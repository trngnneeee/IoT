const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  value: Number,
  date: Date
})

const TrashVolume = mongoose.model('TrashVolume', schema, "trash-volume");

module.exports = TrashVolume;