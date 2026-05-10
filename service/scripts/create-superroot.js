require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const connectDB = require('../utils/db');
const User = require('../models/user');

const USERNAME = 'superroot';
const PASSWORD = process.argv[2];

if (!PASSWORD) {
  console.error('Uso: node scripts/create-superroot.js <contraseña>');
  process.exit(1);
}

connectDB().then(async () => {
  const existing = await User.findOne({ user: USERNAME });
  if (existing) {
    console.log('El usuario superroot ya existe.');
    process.exit(0);
  }
  const hash = await bcrypt.hash(PASSWORD, 10);
  await new User({
    id: uuidv4(),
    user: USERNAME,
    pass: hash,
    role: 'superroot',
    ia: false,
  }).save();
  console.log('Superroot creado correctamente.');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
