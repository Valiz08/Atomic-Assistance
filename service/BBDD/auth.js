const { MongoClient } = require('mongodb');


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

module.exports = userBBDD;