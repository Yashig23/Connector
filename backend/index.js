const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
const { User } = require("./schema"); 
const InstagramProfile = require("./userprofileschema");
const multer = require('multer');
const Notification = require('./notificationschema');
const socketSetup = require('./socketIo');
const path = require('path');
const Message = require('./chatmessageschema');
const Comment = require('./commentsscheme');
const UserStory = require('./userstroyschema')

const app = express();
const PORT = process.env.PORT || 8000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:4200";
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const server = http.createServer(app);

// 🔹 Set up Multer storage for files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); 
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); 
  },
});

const upload = multer({ storage: storage });

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/chatting-webapp", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// Enable CORS
app.use(cors({
  origin: CLIENT_URL,
  methods: "GET,POST,PUT,DELETE,PATCH",
  allowedHeaders: "Content-Type,Authorization"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Get all people present
app.get("/api/peoplePresent", async (req, res) => {
  try {
    const people = await InstagramProfile.find({});
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// Get all people near you
app.get("/api/peopleNearYou", async (req, res) => {
  try {
    const people = await InstagramProfile.find({});

    // Convert InstagramProfile data to followersSchema format
    const followersData = people.map(person => ({
      profile_pic_url: person.profile_picture_url || "",
      username: person.username,
      instagram_id: person.instagram_id,
      follow_status: person.follow_status || "follow",
      user_status: person.user_status || null,
      account_type2: person.account_type2 || "public",
    }));

    res.json(followersData);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/allUsernames", async (req, res) => {
  try {
    const users = await InstagramProfile.find({}, "username"); // Fetch only usernames

    const usernames = users.map(user => user.username);

    res.json({ usernames });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});



app.get("/api/myProfile/:id", async (req, res) => {
  try {
    const { id } = req.params;

    //  Find user by `instagram_id` instead of `_id`
    const person = await InstagramProfile.findOne({ instagram_id: id });

    if (!person) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(person);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/api/myProfile", async (req, res) => {
  try {

    const username = req.user?.username; 

    if (!username) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const myProfile = await InstagramProfile.findOne({ username });

    if (!myProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json(myProfile);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Add a new person to "peoplePresent"
app.post("/api/newProfiles", async (req, res) => {
  const {
    instagram_id,
    username,
    gmail,
    full_name,
    bio,
    profile_picture_url,
    website,
    is_verified,
    is_private,
    account_type,
    account_type2,
    followers_count,
    following_count,
    user_status,
    posts_count,
    media,
    analytics,
  } = req.body;

  // Basic validation
  if (!instagram_id || !username) {
    return res.status(400).json({ error: "Instagram ID and username are required!" });
  }

  try {
    const newProfile = new InstagramProfile({
      instagram_id,
      username,
      full_name,
      bio,
      gmail,
      user_status,
      profile_picture_url,
      website,
      is_verified: is_verified ?? false,
      is_private: is_private ?? false,
      account_type: account_type || "personal",
      account_type2: account_type2 || "public",
      followers_count: followers_count ?? 0,
      following_count: following_count ?? 0,
      posts_count: posts_count ?? 0,
      media: media || [],
      analytics: analytics || {},
    });

    await newProfile.save();
    res.status(201).json({ message: "Profile added successfully", profile: newProfile });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


//  Update a profile
app.put("/api/profiles/:id", async (req, res) => {
  try {
    const updatedProfile = await InstagramProfile.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

app.patch("/api/profiles/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Allow only specific fields to be updated
    const allowedUpdates = ["full_name", "bio", "profile_picture_url", "website", "account_type2", "chatting_people", "user_status"];
    const filteredBody = Object.keys(req.body)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});

    if (Object.keys(filteredBody).length === 0) {
      return res.status(400).json({ error: "No valid fields to update" });
    }

    // Find user by Firebase UID instead of `_id`
    const updatedProfile = await InstagramProfile.findOneAndUpdate(
      { instagram_id: id }, // Firebase UID instead of `_id`
      { $set: filteredBody, updated_at: Date.now() },
      { new: true, runValidators: true }
    );

    if (!updatedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    res.json({ message: "Profile updated successfully", profile: updatedProfile });

  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//posting the user_status
app.post("/api/user-story", async (req, res) => {
  try {
    const { instagram_id, username, current_story } = req.body;

    if (!instagram_id || !current_story) {
      return res.status(400).json({ error: "instagram_id and story are required" });
    }

    // Pehle se story hai kya check karo
    let existingStory = await UserStory.findOne({ instagram_id });

    if (existingStory) {
      // Update existing story
      existingStory.current_story = current_story;
      existingStory.created_at = Date.now();
      existingStory.expires_at = Date.now() + 24 * 60 * 60 * 1000;
      await existingStory.save();
    } else {
      // New story create karein
      existingStory = new UserStory({
        instagram_id,
        username,
        current_story,
      });
      await existingStory.save();
    }

    // Instagram Profile me `user_status` ko image set karo
    await InstagramProfile.findOneAndUpdate(
      { instagram_id },
      { user_status: current_story, updated_at: Date.now() }, // 🔥 Image ko directly user_status me store kar diya
      { new: true }
    );

    return res.status(201).json({ message: "Story posted successfully", story: existingStory });

  } catch (error) {

    return res.status(500).json({ error: "Internal Server Error" });
  }
});



// Delete a profile
app.delete("/api/profiles/:id", async (req, res) => {
  try {
    const deletedProfile = await InstagramProfile.findByIdAndDelete(req.params.id);
    if (!deletedProfile) {
      return res.status(404).json({ error: "Profile not found" });
    }
    res.json({ message: "Profile deleted successfully" });
  } catch (err) {
    res.status(400).json({ error: "Invalid ID format" });
  }
});

app.post("/api/profiles/:profileId/media/:mediaId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const { profileId, mediaId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const profile = await InstagramProfile.findOne({ instagram_id: profileId });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }


    // Find the media by media_id
    const media = profile.media.find((m) => m.media_id === mediaId);

    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }


    // Initialize likes_data array if it doesn't exist
    if (!media.likes_data) {
      media.likes_data = [];
    }

    //  Check if the user has already liked the post
    if (media.likes_data.includes(userId)) {
      media.likes_count -= 1;
      media.likes_data = media.likes_data.filter(id => id !== userId);

      
      await profile.save();
      return res.status(200).json({ message: "Post unliked successfully", likes: media.likes_count });
    }

    //  If not already liked, then like it
    media.likes_count += 1;
    media.likes_data.push(userId);

    // Save changes after like
    await profile.save();

    // Send a successful response
    res.json({ message: "Post liked successfully", likes: media.likes_count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profiles/:profileId/media/:mediaId/unlike", async (req, res) => {
  try {
    const { userId } = req.body;
    const { profileId, mediaId } = req.params;


    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });


    const media = profile.media.find((m) => m.media_id === mediaId);
    if (!media) return res.status(404).json({ error: "Media not found" });


    if (!media.likes_data.includes(userId)) {
      return res.status(400).json({ error: "You have not liked this post" });
    }

    media.likes_data = media.likes_data.filter(id => id !== userId);

    media.likes_count = Math.max(0, media.likes_count - 1);

    await profile.save();

    res.json({ message: "Post unliked successfully", likes: media.likes_count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profiles/:profileId/media/:mediaId/comment", async (req, res) => {
  try {
    const { userId, username, profile_pic, text } = req.body;
    const { profileId, mediaId } = req.params;

    if (!text) {
      return res.status(400).json({ error: "Comment text is required" });
    }

    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    const media = profile.media.find((m) => m.media_id === mediaId);
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }
    const newComment = {
      comment_id: new mongoose.Types.ObjectId().toString(),
      user_id: userId, // Yeh bhi string hi rahega
      username,
      profile_pic,
      text,
      created_at: new Date(),
      likes_count: 0,
      replies: [],
    };

    media.comments.push(newComment);
    media.comments_count += 1;

    await profile.save();

    res.json({ success: true, message: "Comment added successfully", comment: newComment });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/profiles/:profileId/media/:mediaId/comments/:commentId/like", async (req, res) => {
  try {
    const { userId } = req.body;
    const { profileId, mediaId, commentId } = req.params;

    const profile = await InstagramProfile.findById(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const media = profile.media.find((m) => m.media_id === mediaId);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const comment = media.comments.find((c) => c.comment_id === commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Increase like count
    comment.likes_count += 1;

    await profile.save();
    res.json({ message: "Comment liked successfully", likes: comment.likes_count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.post("/api/profiles/:profileId/media/:mediaId/comments/:commentId/unlike", async (req, res) => {
  try {
    const { userId } = req.body;
    const { profileId, mediaId, commentId } = req.params;

    const profile = await InstagramProfile.findById(profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const media = profile.media.find((m) => m.media_id === mediaId);
    if (!media) return res.status(404).json({ error: "Media not found" });

    const comment = media.comments.find((c) => c.comment_id === commentId);
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    // Decrease like count (ensure it doesn't go below 0)
    comment.likes_count = Math.max(0, comment.likes_count - 1);

    await profile.save();
    res.json({ message: "Comment unliked successfully", likes: comment.likes_count });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profiles/:profileId/media/upload", upload.single("media"), async (req, res) => {
  try {
    const { profileId } = req.params;
    const { caption, media_id, media_type, owner_id, owner_name, owner_profilePic } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const serverUrl = process.env.SERVER_URL || "http://localhost:8000";

    // Replace backslashes with forward slashes for cross-platform compatibility
    const mediaUrl = `${serverUrl}/uploads/${req.file.filename.replace(/\\/g, "/")}`;

    const newMedia = {
      media_id: media_id || Date.now().toString(),
      media_type: media_type || "image",
      caption,
      media_url: mediaUrl, // Save with forward slashes
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(),
      owner_id,            
      owner_name,         
      owner_profilePic
    };

    profile.media.push(newMedia);
    profile.posts_count += 1;
    await profile.save();

    res.json({ message: "Media uploaded successfully", media: newMedia });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


app.delete("/api/media/:mediaId/comment/:commentId", async (req, res) => {
  try {
    const { mediaId, commentId } = req.params;

    // Find the media by media_id
    const media = await Media.findOne({ media_id: mediaId });
    if (!media) {
      return res.status(404).json({ error: "Media not found" });
    }

    //  Find the comment
    const comment = await Comment.findOne({ comment_id: commentId });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found" });
    }

    //  Remove the comment from media's comments array
    media.comments = media.comments.filter((c) => c.comment_id !== commentId);
    media.comments_count = Math.max(0, media.comments_count - 1); // Ensure count never goes negative

    //  Delete the comment from the database
    await Comment.deleteOne({ comment_id: commentId });

    await media.save();

    res.json({ message: "Comment deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.delete("/api/profiles/:profileId/media/:mediaId", async (req, res) => {
  try {
    const { profileId, mediaId } = req.params;

    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // Filter out the media to remove it
    const initialLength = profile.media.length;
    profile.media = profile.media.filter((m) => m.media_id !== mediaId);

    if (profile.media.length === initialLength) {
      return res.status(404).json({ error: "Post not found" });
    }

    profile.posts_count = Math.max(0, profile.posts_count - 1); // Ensure count doesn't go negative
    await profile.save();

    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.put("/api/profiles/:profileId/media/:mediaId", async (req, res) => {
  try {
    const { profileId, mediaId } = req.params;
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({ error: "Caption is required" });
    }

    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const mediaItem = profile.media.find((m) => m.media_id === mediaId);
    if (!mediaItem) return res.status(404).json({ error: "Post not found" });

    mediaItem.caption = caption;
    await profile.save();

    res.json({ message: "Caption updated successfully", media: mediaItem });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.post("/api/profiles/:profileId/media/upload/multiple", upload.array("media", 6), async (req, res) => {
  try {
    const { profileId } = req.params;
    const { caption, owner_id, owner_name, owner_profilePic } = req.body;

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    //  Find Profile using `instagram_id`
    const profile = await InstagramProfile.findOne({ instagram_id: profileId });
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    const serverUrl = process.env.SERVER_URL || "http://localhost:8000";

    //  Process multiple files correctly
    const newMedia = req.files.map((file) => ({
      media_id: Math.floor(Math.random() * 1000000000),
      media_type: req.files.length > 1 ? "carousel" : "image",
      caption: caption || "",
      media_url: `${serverUrl}/uploads/${file.filename.replace(/\\/g, "/")}`, // ✅ Correct file path
      likes_count: 0,
      comments_count: 0,
      created_at: new Date(),
      owner_id: owner_id,
      owner_name: owner_name,
      owner_profilePic
    }));

    profile.media.push(...newMedia);
    profile.posts_count += newMedia.length; //  Increment post count
    await profile.save();

    res.json({ message: "Media uploaded successfully", media: newMedia });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

//  API to Get Media by ID & its Comments
app.get("/media/:mediaId", async (req, res) => {
  try {
    const mediaId = req.params.mediaId;


    // Fetch Media from Instagram Profile collection
    const media = await InstagramProfile.findOne({
      "media.media_id": mediaId
    });

    if (!media) {
      return res.status(404).json({ message: "Media not found" });
    }

    // Fetch Comments linked to this media
    const comments = await Comment.find({ media_id: mediaId });

    res.json({ media, comments });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/addCollection/:userID", async (req, res) => {
  try {
    let { instagram_id, title, description = "", media = [] } = req.body;

    // Basic validation
    if (!instagram_id) {
      return res.status(400).json({ error: "Instagram ID and title are required!" });
    }

    if (typeof media === "string") {
      media = [media];
    }

    const profile = await InstagramProfile.findOne({ instagram_id });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found!" });
    }

    const newCollection = {
      instagram_id,
      title,
      description,
      media,  
      created_at: new Date(),
      updated_at: new Date(),
      user: req.body.user 
    };

    // Push the new collection to the profile's collections field
    profile.collections.push(newCollection);

    // Save the updated profile
    await profile.save();

    res.status(201).json({ message: "Collection added successfully!", collection: newCollection });
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/api/following/:instagram_id", async (req, res) => {
  try {
    const { instagram_id } = req.params;

    // Find user by Instagram ID
    const profile = await InstagramProfile.findOne({ instagram_id });

    if (!profile) {
      return res.status(404).json([]);
    }

    // Filter only "following" status users
    const followingList = profile.following_data.filter(f => f.follow_status === "following");

    //  Fetch account_type2 from InstagramProfile for each user
    const enrichedFollowingList = await Promise.all(
      followingList.map(async (follower) => {
        const userProfile = await InstagramProfile.findOne({ instagram_id: follower.userId });

        return {
          ...follower.toObject(),  // Convert Mongoose document to plain object
          profile_pic: userProfile?.profile_picture_url || "",
          user_status: userProfile.user_status,
          account_type2: userProfile?.account_type2 || "public",  // Default to "public" if undefined
        };
      })
    );

    res.status(200).json(enrichedFollowingList);
  } catch (err) {
    res.status(500).json([]);
  }
});

app.get("/api/followers/:instagram_id", async (req, res) => {
  try {
    const { instagram_id } = req.params;

    //Find user by Instagram ID
    const profile = await InstagramProfile.findOne({ instagram_id });


    if (!profile) {
      return res.status(404).json([]);
    }

    //  Filter only "following" status users
    const followingList = profile.followers_data.filter(f => f.follow_status === "following");

    //  Fetch account_type2 from InstagramProfile for each user
    const enrichedFollowingList = await Promise.all(
      followingList.map(async (follower) => {
        const userProfile = await InstagramProfile.findOne({ instagram_id: follower.userId });

        return {
          ...follower.toObject(),
          profile_pic: userProfile?.profile_picture_url,
          user_status: userProfile.user_status,
          account_type2: userProfile?.account_type2 || "public",  
        };
      })
    );

    res.status(200).json(enrichedFollowingList);
  } catch (err) {
    res.status(500).json([]);
  }
});


app.patch("/api/following/:instagram_id/:userId", async (req, res) => {
  try {
    const { instagram_id, userId } = req.params;
    const updateData = req.body; // Jo fields update karni hai

    // Find user by Instagram ID
    const profile = await InstagramProfile.findOne({ instagram_id });

    if (!profile) {
      return res.status(404).json([]);
    }

    // Find the specific follower in the following list
    const follower = profile.following_data.find(f => f.userId === userId);

    if (!follower) {
      return res.status(404).json({ error: "Follower not found" });
    }

    // Update only provided fields
    Object.assign(follower, updateData);

    // Save the updated profile
    await profile.save();

    res.status(200).json(follower);
  } catch (err) {
    res.status(500).json({ error: "Server error", details: err.message });
  }
});



app.post("/api/sendFollowRequest", async (req, res) => {
  try {
    const { requesterInstagramId, targetInstagramId } = req.body;

    if (!requesterInstagramId || !targetInstagramId) {
      return res.status(400).json({ error: "Instagram IDs are required" });
    }

    // Find the requester's profile
    const requesterProfile = await InstagramProfile.findOne({ instagram_id: requesterInstagramId });
    if (!requesterProfile) {
      return res.status(404).json({ error: "Requester profile not found" });
    }

    // Find the target user's profile
    const targetProfile = await InstagramProfile.findOne({ instagram_id: targetInstagramId });
    if (!targetProfile) {
      return res.status(404).json({ error: "Target profile not found" });
    }

    // Check if the user is already following
    const followingIndex = requesterProfile.following_data.findIndex(
      (following) => String(following.instagram_id) === String(targetInstagramId)
    );

    if (followingIndex !== -1) {
      // User is already following, so unfollow
      requesterProfile.follow_status = "follow";
      requesterProfile.following_data.splice(followingIndex, 1);
      requesterProfile.following_count -= 1;

      targetProfile.followers_data = targetProfile.followers_data.filter(
        (follower) => String(follower.instagram_id) !== String(requesterInstagramId)
      );
      targetProfile.followers_count -= 1;

      try {
        await targetProfile.save();
        await requesterProfile.save();
        return res.status(200).json({ message: "Unfollowed successfully!" });
      } catch (saveError) {
        return res.status(500).json({ error: "Failed to save profiles", details: saveError.message });
      }
    }

    // If public account, follow directly, otherwise send follow request
    const accountType = targetProfile.account_type2?.toLowerCase() || "public";
    const tempStatusOfRequester = accountType === "public" ? "following" : "requested";
    const tempStatusOfTarget = accountType === "public" ? "followback" : "accept";
    // requesterProfile.follow_status = accountType === "public" ? "following" : "requested";

    if (!requesterInstagramId) {

    } else {

      targetProfile.followers_data.push({
        username: requesterProfile.username,
        userId: String(requesterInstagramId),
        follow_status: tempStatusOfTarget,
        account_type2: requesterProfile.account_type2,
        profile_pic: requesterProfile.profile_picture_url
      });

      targetProfile.followers_count++;

      requesterProfile.following_data.push({
        username: targetProfile.username,
        userId: String(targetInstagramId),
        follow_status: tempStatusOfRequester,
        account_type2: targetProfile.account_type2,
        profile_pic: targetProfile.profile_picture_url
      })
    }

    // Save the profiles
    try {
      await targetProfile.save();
      await requesterProfile.save();
      return res.status(200).json({ message: "Follow request sent successfully!", data: requesterProfile.following_data });
    } catch (saveError) {
      return res.status(500).json({ error: "Failed to save follow request", details: saveError.message });
    }
  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});


app.post("/api/sendUnFollowRequest", async (req, res) => {
  try {

    const { requesterInstagramId, targetInstagramId } = req.body;

    // Check if IDs are provided
    if (!requesterInstagramId || !targetInstagramId) {
      return res.status(400).json({ error: "Missing requester or target ID" });
    }

    // Find the requester's profile
    const requesterProfile = await InstagramProfile.findOne({ instagram_id: requesterInstagramId });
    if (!requesterProfile) {
      return res.status(404).json({ error: "Requester profile not found" });
    }

    // Find the target user's profile
    const targetProfile = await InstagramProfile.findOne({ instagram_id: targetInstagramId });
    if (!targetProfile) {
      return res.status(404).json({ error: "Target profile not found" });
    }

    // Remove requester from target's followers_data
    targetProfile.followers_data = targetProfile.followers_data.filter(
      (follower) => follower.userId !== String(requesterInstagramId)
    );

    if (targetProfile.followers_count > 0) {
      targetProfile.followers_count--;
    }

    requesterProfile.following_data = requesterProfile.following_data.filter(
      (following) => following.userId !== String(targetInstagramId)
    );

    if (requesterProfile.following_count > 0) {
      requesterProfile.following_count--;
    }

    await targetProfile.save();
    await requesterProfile.save();

    return res.status(200).json({
      message: "Unfollow request processed successfully!",
      data: requesterProfile.following_data,
    });

  } catch (err) {
    return res.status(500).json({ error: "Server error", details: err.message });
  }
});



// API for accepting follow request
app.post("/api/acceptFollowRequest", async (req, res) => {
  try {
    const { targetInstagramId, requesterInstagramId } = req.body;

    if (!targetInstagramId || !requesterInstagramId) {
      return res.status(400).json({ error: "Instagram IDs are required" });
    }

    const targetProfile = await InstagramProfile.findOne({ instagram_id: targetInstagramId });
    if (!targetProfile) {
      return res.status(404).json({ error: "Target profile not found" });
    }

    const requesterProfile = await InstagramProfile.findOne({ instagram_id: requesterInstagramId });
    if (!requesterProfile) {
      return res.status(404).json({ error: "Requester profile not found" });
    }

    const followRequestIndex = targetProfile.followers_data.findIndex(
      (follower) => follower._id === requesterInstagramId
    );

    if (followRequestIndex === -1) {
      return res.status(400).json({ error: "No follow request found from this user" });
    }

    const followRequest = targetProfile.followers_data.splice(followRequestIndex, 1)[0];
    targetProfile.following_data.push(followRequest);

    targetProfile.follow_status = 'followback';
    await targetProfile.save();

    requesterProfile.following_data.push(followRequest);
    requesterProfile.follow_status = 'following';
    await requesterProfile.save();

    await targetProfile.save();

    res.status(200).json({ message: "Follow request accepted successfully!" });
  } catch (err) {

    res.status(500).json({ error: "Server error", details: err.message });
  }
});

app.get("/notifications/:receiverId", async (req, res) => {
  try {
    const { receiverId } = req.params;

    if (!receiverId) {
      return res.status(400).json({ error: "Receiver ID is required" });
    }

    const notifications = await Notification.find({ receiverId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get('/api/messages/:senderId/:receiverId', async (req, res) => {
  const { senderId, receiverId } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId }
      ]
    }).sort({ createdAt: 1 }); 

    res.status(200).json(messages);
  } catch (error) {

    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Get comments by ownerId and media_id
app.get("/api/comments", async (req, res) => {
  try {
    const { media_id } = req.query;

    if (!media_id) {
      return res.status(400).json({ error: "media_id is required" });
    }

    const comments = await Comment.find({ media_id }).sort({ created_at: -1 });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post('/uploadMessageFile', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { senderId, receiverId, chatId, messageType } = req.body;

    const serverUrl = process.env.SERVER_URL || "http://localhost:8000";

    const mediaUrl = `${serverUrl}/uploads/${req.file.filename.replace(/\\/g, "/")}`;

    const messageData = new Message({
      chatId,
      senderId,
      receiverId,
      messageType,
      content: mediaUrl,
      timestamp: new Date(),
      isRead: false,
    });

    await messageData.save();

    res.status(200).json({ message: 'File uploaded successfully', data: messageData });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

socketSetup(server);


// Start server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
