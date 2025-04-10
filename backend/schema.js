const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String },
    image: { type: String, required: true },
    caption: { type: String },
    blueTick: { type: Boolean, default: false },
    gender: { type: String },
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

module.exports = { User };
