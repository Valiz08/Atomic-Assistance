const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  id: String,
  user: String,
  pass: String,
  ia: Boolean,
  hasPdf: { type: Boolean, default: false },
  pdfName: { type: String, default: null },
  whatsappPhoneNumberId: { type: String, default: null },
  whatsappToken: { type: String, default: null },
  whatsappVerifyToken: { type: String, default: null },
  workers: [{
    id: { type: String },
    name: { type: String }
  }],
  businessHours: [{
    day: { type: Number },      // 0=Dom 1=Lun ... 6=Sáb
    enabled: { type: Boolean, default: true },
    open: { type: Number, default: 8 },
    close: { type: Number, default: 19 }
  }]
});

module.exports = mongoose.model('user', UserSchema, 'users');
