const mongoose = require("mongoose");

const UserStory = new mongoose.Schema({
  instagram_id: {type: String, required: false},
  username: {type: String, required: false},
  current_story: {type: String, required: false},
  created_at: { type: Date, default: Date.now }, // Story upload ka time
  expires_at: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 }, 
})


// Define the Comment Schema (aligned with frontend interface)
const CommentSchema = new mongoose.Schema({
  comment_id: { type: String, 
    default: () => new mongoose.Types.ObjectId().toString() }, 
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  username: { type: String, required: false }, // User's username
  profile_pic: { type: String }, 
  text: { type: String, required: false }, 
  created_at: { type: Date, default: Date.now },
  likes_count: { type: Number, default: 0 },
  replies: [{
    comment_id: { type: String, required: false, unique: true }, 
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    username: { type: String, required: false },
    profile_pic: { type: String },
    text: { type: String, required: false },
    created_at: { type: Date, default: Date.now },
    likes_count: { type: Number, default: 0 }
  }]
});

const followersSchema = new mongoose.Schema({
  profile_pic: { type: String, required: false },
  username: { type: String, required: true },
  userId: { type: String, required: false },
  follow_status: { type: String, enum: ["follow", "following", "requested", "accept", "followback", "decline"], default: "follow", required: false},
  user_status : {type: UserStory, required: false},
  account_type2: { type: String, enum: ["private", "public"], default: "public", required: false },
});

const MediaSchema = new mongoose.Schema({
  media_id: { type: String, required: true, unique: true },
  media_type: { type: String, enum: ["image", "video", "carousel"], required: true },
  caption: { type: String },
  media_url: { type: String, required: true },
  likes_count: { type: Number, default: 0 },
  likes_data: {type: [String], required: false},
  comments_count: { type: Number, default: 0 },
  views_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },

  // New properties for like functionality
  isLiked: { type: Boolean, default: false },
  floatingHearts: { type: [Number], default: [] },
  showComments: { type: Boolean, default: false },
  comments: [CommentSchema],
  mentions: {type: [followersSchema], default: [], required: false},

  // New owner fields
  owner_id: { type: String, required: false },
  owner_name: { type: String, required: false },
  owner_profilePic: { type: String, required: false }, // Use string for file URL
});

const reelSchema = new mongoose.Schema({
  caption: { type: String, default: '' },
  videoUrl: { type: String, required: true }, // Storing the video URL
  thumbnailUrl: { type: String, default: '' }, // Optional thumbnail
  likes: { type: Number, default: 0 },
  comments: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const collectionSchema = new mongoose.Schema({
  instagram_id: {type: String, required: true},
  title: { type: String, required: false },
  description: { type: String, default: '', required: false },
  media: { type: [String], default: [] },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  user: {
    id: { type: String, required: true },
    username: { type: String, required: true },
    name: { type: String, required: true },
    location: { type: String, default: null },
    profile_image: { type: String, required: true }
  }
});

const BasicPeopleInfo = new mongoose.Schema({
  userId: {type: String, required: false},
  username: {type: String, required: false}
})

// Define the Instagram Profile Schema
const InstagramProfileSchema = new mongoose.Schema({
  instagram_id: { type: String, unique: true, required: true },
  username: { type: String, required: true },
  gmail: String,
  full_name: String,
  bio: String,
  profile_picture_url: String,
  website: String,
  is_verified: Boolean,
  is_private: Boolean,
  user_status: { type: String, default: null },
  follow_status: { type: String, enum: ["follow", "following", "requested", "accept", "followback"], default: "follow", required: false},
  chatting_people : {type: [BasicPeopleInfo], default: () => [], required: false},
  account_type: { type: String, enum: ["personal", "business", "creator", "community"] },
  account_type2: { type: String, enum: ["private", "public"], default: "public", required: false },
  followers_count: { type: Number, default: 0 },
  following_count: { type: Number, default: 0 },
  followers_data: { type: [followersSchema], default: () => [], required: false },
  following_data: { type: [followersSchema], default: () => [], required: false },
  reels: { type: [reelSchema], default: [], required: false },
  community: {type: [followersSchema], default: [], required: false},
  collections: {type: [collectionSchema], default: [], required: false},
  posts_count: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },

  // Media (Updated to match frontend)
  media: [MediaSchema],

  // Analytics
  analytics: {
    engagement: {
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      saves: { type: Number, default: 0 },
    },
    reach: {
      impressions: { type: Number, default: 0 },
      unique_views: { type: Number, default: 0 },
    },
    audience_demographics: {
      age_range: { type: Object, default: {} },
      gender: { type: Object, default: {} },
      top_countries: { type: [String], default: [] },
    },
  }
});

const InstagramProfile = mongoose.model("InstagramProfile", InstagramProfileSchema, "instagramprofiles");

module.exports = InstagramProfile;


