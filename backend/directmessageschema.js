const DirectMessageSchema = new mongoose.Schema({
    message_id: { type: String, unique: true, required: true },
    sender_id: { type: String, required: true }, 
    receiver_id: { type: String, required: true }, 
    message: String,
    media_url: String, 
    message_type: { type: String, enum: ["text", "image", "video"], required: true },
    sent_at: { type: Date, default: Date.now },
    status: { type: String, enum: ["delivered", "seen", "failed"], default: "delivered" }
  });
  
  module.exports = mongoose.model("DirectMessage", DirectMessageSchema);
  