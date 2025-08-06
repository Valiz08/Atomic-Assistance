require('dotenv').config();
const bcrypt = require('bcrypt');
const { clientBD } = require('../BBDD/auth');
const { MongoClient } = require('mongodb');
const MONGO_URI = process.env.MONGO_URI
const client = new MongoClient(MONGO_URI);
const { subirArchivoPorFTP } = require('../services/ftp');


exports.login = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const db = client.db('atomicApp');
    const usuarios = db.collection('users');
    const user = await usuarios.findOne({ user: username });

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

exports.ask = async (req, res, next) => {
  const { message, userId } = req.body;

  try {
    const db = client.db('atomicApp');
    const record = db.collection('record');
    const records = await record.findOne({ userId });
    const messageRecord = transformData(records?.messages || []);

    const finalMessages = [
      ...messageRecord,
      {
        role: "user",
        content: [{ type: "text", text: message }]
      }
    ];

    const reply = await getOpenAIResponse(finalMessages);
    await updateSession(userId, message, reply);

    res.status(200).json(reply ? { reply } : { reply: "No se pudo generar una respuesta." });
  } catch (error) {
    next(error);
  }
};

exports.uploadFile = async (req, res) => {
  try {
    const { userId } = req.body;
    const archivo = req.file;

    if (!archivo || !userId) {
      return res.status(400).json({ message: "Faltan datos (archivo o userId)" });
    }

    await subirArchivoPorFTP(archivo.buffer, userId, archivo.originalname);

    res.status(200).json({ message: "Archivo subido correctamente al servidor FTP." });
  } catch (error) {
    res.status(500).json({ message: "Error al subir el archivo", error: error.message });
  }
};

function updateSession(userId, message, reply) {
  const db = client.db('atomicApp');
  const record = db.collection('record');
  record.updateOne(
    { userId: userId },
    {
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