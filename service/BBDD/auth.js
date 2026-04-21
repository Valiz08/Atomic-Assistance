const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);

let db = null;

async function connectDB() {
  if (!db) {
    await client.connect();
    db = client.db('atomicApp');
    console.log('Conectado a MongoDB');
  }
  return db;
}

function getDB() {
  if (!db) throw new Error('Debes conectar primero con connectDB');
  return db;
}

module.exports = {
  connectDB,
  getDB,
};