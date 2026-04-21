const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  user: String,
  pass: String,
  ia: Boolean,
  hasPdf: { type: Boolean, default: false },
  pdfName: { type: String, default: null },
});

module.exports = mongoose.model('user', UserSchema, 'users');
