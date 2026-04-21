const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  from: { type: String, enum: ['user', 'assistant', 'operator'], required: true },
  text: { type: String, required: true }
}, { _id: false });

const RecordSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  clientId: { type: String, default: null },
  clientName: { type: String, default: null },
  clientPhone: { type: String, default: null },
  messages: [MessageSchema],
  updateDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('record', RecordSchema, 'record');
