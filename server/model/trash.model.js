const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  percentage1: Number,
  percentage2: Number,
  percentage3: Number,
  date: Date
})

const TrashVolume = mongoose.model('TrashVolume', schema, "trash-volume");

module.exports = TrashVolume;