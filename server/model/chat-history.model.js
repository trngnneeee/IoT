const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  userID: String,
  chat: Array // Array of Object (1: User message, 2: Bot message)  
})

const ChatHistory = mongoose.model('ChatHistory', schema, "chat-history");

module.exports = ChatHistory;