require('dotenv').config();
const bcrypt = require('bcryptjs');
const pdf = require("pdf-parse");
const OpenAI = require("openai");
const Chunk = require("../models/chuncks");
const { subirArchivoSFTP } = require('../services/ftp');
const { v4: uuidv4 } = require('uuid');
let openai;
const getOpenAI = () => {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
};
const User = require("../models/user");
const recordDB = require("../models/record");
const classifyMssg = require("../services/ai");
const fs = require('fs');
const path = require('path');

const UPLOADS_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

exports.login = async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ user: username });
    if (!user) return res.status(401).json({ message: "Usuario no encontrado" });
    const coincide = await bcrypt.compare(password, user.pass);
    if (coincide) {
      res.status(200).json({ message: "Login successful", userId: user.id });
    } else {
      res.status(401).json({ message: "Credenciales incorrectas" });
    }
  } catch (error) {
    next(error);
  }
};

exports.getUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const filePath = path.join(UPLOADS_DIR, `${userId}.pdf`);
    const fileExists = fs.existsSync(filePath);
    if (fileExists && !user.hasPdf) {
      await User.findOneAndUpdate({ id: userId }, { hasPdf: true });
    }
    res.status(200).json({
      ia: user.ia !== false,
      hasPdf: fileExists || user.hasPdf || false,
      pdfName: user.pdfName || (fileExists ? `${userId}.pdf` : null)
    });
  } catch (error) {
    next(error);
  }
};

exports.getPdf = (req, res, next) => {
  const { userId } = req.params;
  const filePath = path.join(UPLOADS_DIR, `${userId}.pdf`);
  if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'No hay PDF subido' });
  res.setHeader('Content-Type', 'application/pdf');
  res.sendFile(filePath);
};

exports.toggleIA = async (req, res, next) => {
  const { userId } = req.body;
  try {
    const user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });
    const newIa = user.ia === false ? true : false;
    await User.findOneAndUpdate({ id: userId }, { $set: { ia: newIa } });
    res.status(200).json({ message: "IA toggled", ia: newIa });
  } catch (error) {
    next(error);
  }
};

exports.sendMessage = async (req, res, next) => {
  const { message, userId } = req.body;
  try {
    await recordDB.updateOne(
      { userId },
      {
        $push: { messages: { from: "client", text: message } },
        $set: { updateDate: new Date() }
      },
      { upsert: true }
    );
    res.status(200).json({ message: "Mensaje registrado" });
  } catch (error) {
    next(error);
  }
};

exports.ask = async (req, res, next) => {
  const { message, userId, clientId } = req.body;
  try {
    const user = await User.findOne({ id: userId });

    const io = req.app.get('io');

    if (!user.ia) {
      await recordDB.findOneAndUpdate(
        { userId, clientId },
        {
          $set: { userId, clientId, updateDate: new Date() },
          $push: { messages: { from: "user", text: message } }
        },
        { upsert: true }
      );
      if (io) io.to(clientId).emit('receive_message', { from: userId, message });
      res.status(200).json({ reply: "Mensaje recibido del cliente" });
      return;
    }

    const records = await recordDB.findOne({ userId });
    const messageRecord = transformData(records?.messages || []);
    orderClient(message);

    const finalMessages = [
      ...messageRecord,
      { role: "user", content: [{ type: "text", text: message }] }
    ];

    const reply = await getOpenAIResponse(finalMessages);
    await updateSession(userId, message, reply, clientId);
    if (io) io.to(clientId).emit('receive_message', { from: userId, message });

    res.status(200).json(reply ? { reply } : { reply: "No se pudo generar una respuesta." });
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = async (req, res) => {
  const userId = req.body.userId;
  const archivo = req.file;

  if (!archivo || !userId) {
    return res.status(400).json({ message: "Faltan datos (archivo o userId)" });
  }

  try {
    await subirArchivoSFTP(archivo.buffer, userId);
  } catch (ftpErr) {
    console.error('SFTP upload failed (non-critical):', ftpErr.message);
  }

  try {
    fs.writeFileSync(path.join(UPLOADS_DIR, `${userId}.pdf`), archivo.buffer);
    await User.findOneAndUpdate({ id: userId }, { hasPdf: true, pdfName: archivo.originalname });
  } catch (error) {
    return res.status(500).json({ message: "Error al guardar el PDF", error: error.message });
  }

  res.status(200).json({ message: "PDF subido correctamente." });

  processChunk(archivo.buffer, userId).catch(err =>
    console.error('Error procesando chunks (non-critical):', err.message)
  );
};

function updateSession(userId, message, reply, clientId = null) {
  recordDB.findOneAndUpdate(
    { userId, clientId },
    {
      $set: { userId, clientId, updateDate: new Date() },
      $push: {
        messages: {
          $each: [
            { from: "user", text: message },
            { from: "assistant", text: reply }
          ]
        }
      }
    },
    { upsert: true }
  );
}

function transformData(messages) {
  return messages.map(msg => ({
    role: msg.from === "user" ? "user" : "assistant",
    content: [{ type: "text", text: msg.text }]
  }));
}

async function processChunk(buffer, userId) {
  const filePath = `/var/www/vhosts/atomic-assistance.es/uploads/${userId}`;
  const pdfId = uuidv4();
  const data = await pdf(buffer);
  const text = data.text;
  const chunkSize = 1000;
  const chunks = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  let chunkId = 0;
  for (const chunk of chunks) {
    const response = await getOpenAI().embeddings.create({
      model: "text-embedding-3-small",
      input: chunk
    });
    const embedding = response.data[0].embedding;
    await new Chunk({ pdfId, chunkId: chunkId++, text: chunk, embedding, path: filePath }).save();
  }

  console.log(`PDF procesado y ${chunks.length} chunks guardados en Mongo.`);
}

async function getOpenAIResponse(messages) {
  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages
  });
  return response.choices[0]?.message?.content || null;
}

function orderClient(message) {
  const its = classifyMssg(message);
  if (its === 'nuevo_pedido') {
  } else if (its === 'modificar_pedido') {
  } else if (its === 'consulta') {
  }
}
