const mongoose = require('mongoose'),
    Schema = mongoose.Schema;

const commentSchema = new Schema({
    comment: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }

}, { timestamps: true });

const postSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    caption: {
        type: String,
    },
    imageurl: {
        type: String,
    },
    location: {
        type: String,
    },
    comments: [commentSchema],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]
}, { timestamps: true });

const postsSchema = new Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    posts: [postSchema],
}, { timestamps: true });

var Posts = mongoose.model('Post', postsSchema);
module.exports = Posts;