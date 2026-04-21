const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
  id: String,
  number: String,
  name: String,
}, { strict: false });

module.exports = mongoose.model('conversation', ConversationSchema, 'conversations');
