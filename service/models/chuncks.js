const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  userId: String,
  pdfId: String,
  chunkId: Number,
  text: String,
  embedding: [Number],
});

module.exports = mongoose.model('chunk', ChunkSchema, 'chunks');
