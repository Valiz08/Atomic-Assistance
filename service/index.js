require('dotenv').config();
const express = require("express");
const { MongoClient } = require('mongodb');
const cors = require("cors");
const { OpenAI } = require("openai");
const app = express();
const PORT = process.env.PORT || 3088;
const MONGO_URI = process.env.MONGO_URI
const client = new MongoClient(MONGO_URI);
const bcrypt = require('bcrypt');

app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
      const db = client.db('atomicApp');
      const usuarios = db.collection('users');
      const user = await usuarios.findOne({ user: username });
      bcrypt.compare(password, user.pass, (err, resultado) => {
        if (err) throw err;
        if (resultado) {
          res.status(200).json({ message: "Login successful", userId: user.id });
        } else {
          res.status(401).json({ message: "Invalid username or password" });
        }
      });
  } catch (error) {
    console.error("Error al conectar a la base de datos:", error);
    res.status(500).json({ message: "Error al conectar a la base de datos" });
  }
});


app.post("/api/ask", async (req, res) => {
  const { message, userId } = req.body;
  try {
    const db = client.db('atomicApp')
    const record = db.collection('record')
    const records = await record.findOne({ userId: userId })
    const messageRecord = transformData(records?.messages || [])
    const finalMessages = [
      {
        role: "system",
        content: [{ type: "text", text: "Eres un asistente útil para dudas sobre productos llamado Atom" }]
      },
      ...messageRecord,
      {
        role: "user",
        content: [{ type: "text", text: message }]
      }
    ];
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini-2024-07-18",
      messages: [
        { role: "system", content: finalMessages || "Eres un asistente útil para dudas sobre productos llamado Atom" },
        { role: "user", content: message }
      ],
    });
    const reply = completion.choices[0].message.content.text;
    updateSession(
      userId,
      message,
      reply,
    );
    res.status(200).json( reply ? { reply: reply } : { reply: "No se pudo generar una respuesta." });
  } catch (error) {
    console.log("ERROR AL CONECTAR CON OPENAI:");
    console.log(error.response?.data || error.message || error);
    res.status(500).json({ reply: "Error al conectar con la IA. "+error });
  }
});

function updateSession(userId, message, reply) {
  const db = client.db('atomicApp');
  const record = db.collection('record');
  record.updateOne(
    { userId: userId },
    { $push: { messages: { from: "user", text: message } } },
    { upsert: true }
  );
  record.updateOne(
    { userId: userId },
    { $push: { messages: { from: "bot", text: reply } } },
    { upsert: true }
  );
}

function transformData(messages) {
  return messages.map(msg => ({
    role: msg.from === "user" ? "user" : "assistant",
    content: [{ type: "text", text: msg.text }]
  }));
}


app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});