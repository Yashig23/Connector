const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  comment_id: { type: String, required: true, unique: true }, 
  media_id: {type: String, required: true},
  user_id: { type: String, ref: "User", required: false }, 
  username: { type: String, required: true }, 
  profile_pic: { type: String }, 
  text: { type: String, required: true }, 
  created_at: { type: Date, default: Date.now }, 
  likes_count: { type: Number, default: 0 }, 
  replies: [
    {
      comment_id: { type: String, required: true, unique: true }, 
      media_id: {type: String, required: true},
      user_id: { type: String, ref: "User", required: true }, 
      username: { type: String, required: true }, 
      profile_pic: { type: String }, 
      text: { type: String, required: true }, 
      created_at: { type: Date, default: Date.now }, 
      likes_count: { type: Number, default: 0 }
    }
  ] 
});



module.exports = mongoose.model("Comment", CommentSchema);
