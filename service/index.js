require('dotenv').config();
const express = require("express");
const cors = require("cors");
const { OpenAI } = require("openai");

const app = express();
const PORT = process.env.PORT || 3088;
app.use(cors());
app.use(express.json());
console.log("DEBUG ENV:", JSON.stringify(process.env, null, 2));
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.post("/api/ask", async (req, res) => {
  const { message } = req.body;
  try {
    console.log("Received message:", message);
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres un asistente útil para dudas sobre productos llamado Atom" },
        { role: "user", content: message }
      ],
      max_tokens: 150,
    });
    const reply = completion.choices[0].message.content;
    res.status(200).json( reply ?  reply : { reply: "No se pudo generar una respuesta." });
  } catch (error) {
    console.log("ERROR AL CONECTAR CON OPENAI:");
    console.log(error.response?.data || error.message || error);
    res.status(500).json({ reply: "Error al conectar con la IA. "+error.response?.data });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});