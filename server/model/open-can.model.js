const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  id: Number,
  pressedBy: String,
  pressed: Boolean,
  date: Date
})

const OpenCan = mongoose.model('OpenCan', schema, "open-can");

module.exports = OpenCan;