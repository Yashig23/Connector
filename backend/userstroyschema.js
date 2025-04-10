const mongoose = require("mongoose");

const UserStorySchema = new mongoose.Schema({
  instagram_id: { type: String, required: false },
  username: { type: String, required: false },
  current_story: { type: String, required: false },
  created_at: { type: Date, default: Date.now }, // Story upload ka time
  expires_at: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 } // 24 ghante baad expire hoga
});

// Model create karo
const UserStory = mongoose.model("UserStory", UserStorySchema);

module.exports = UserStory;
