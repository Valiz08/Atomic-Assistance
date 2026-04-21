const mongoose = require('mongoose');

const ChunkSchema = new mongoose.Schema({
  pdfId: String,
  chunkId: Number,
  text: String,
  embedding: [Number],
  path: String,
});

module.exports = mongoose.model('chunk', ChunkSchema, 'chunks');
