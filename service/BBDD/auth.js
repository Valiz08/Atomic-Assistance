const mongoose = require('mongoose');

const AuthSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Auth = mongoose.model('Auth', AuthSchema);

async function userBBDD() {
    const client = new MongoClient(uri, { useUnifiedTopology: true });
    try {
        await client.connect();
        const db = client.db('atomicdb');
        const usuarios = db.collection('users');
        console.log('Conectado a la colección usuarios');
        return usuarios;
    } catch (err) {
        console.error('Error conectando a MongoDB:', err);
        throw err;
    }
}

module.exports = { Auth, userBBDD };