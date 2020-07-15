const User = require("./User");

const mongoose = require("mongoose");

// post schema and saving data to Post
const postSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
  },
   userEmail:{
       type: String,
   },
    createdAt: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
    }
});
const Post = mongoose.model("Post", postSchema);

module.exports = Post;