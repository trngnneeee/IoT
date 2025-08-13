const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  w1: Number,
  w2: Number,
  w3: Number,
})

const TrashWeight = mongoose.model('TrashWeight', schema, "trash-weight");

module.exports = TrashWeight;