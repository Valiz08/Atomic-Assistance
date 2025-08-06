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

const user = require('./routes/user.routes');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
app.use('api/', user)

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en http://localhost:${PORT}`);
});