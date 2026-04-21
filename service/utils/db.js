const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { dbName: 'atomicApp' });
    console.log('MongoDB conectado con Mongoose');
  } catch (error) {
    console.error('Error conectando MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
