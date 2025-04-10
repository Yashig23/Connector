const mongoose = require("mongoose");

const NotificationSchema = new mongoose.Schema({
    senderId: String,
    receiverId: String,
    type: String,
    message: String,
    profile_pic: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Notification", NotificationSchema);
