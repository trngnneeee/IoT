const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  arr: Array,
  expireAt: { 
    type: Date,
    expires: 0
  }
})

const OpenCan = mongoose.model('OpenCan', schema, "open-can");

module.exports = OpenCan;