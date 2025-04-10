const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: false, ref: 'Chat' }, 
  senderId: { type: String, required: true, ref: 'User' },
  receiverId: { type: String, required: true, ref: 'User' }, 
  messageType: { type: String, enum: ['text', 'image', 'video', 'file', 'audio'], default: 'text' }, 
  content: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now }, 
  isRead: { type: Boolean, default: false }, 
  reactions: [{ userId: String, emoji: String }], 
  deletedFor: [{ type: String, ref: 'User' }], 
});

module.exports = mongoose.model('Message', messageSchema);