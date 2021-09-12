const mongoose = require('mongoose'),
    Schema = mongoose.Schema;


const activitySchema = new Schema({
    from: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {  // LP:Liked Post,LC:Liked Comment,COP:Comment On Post
        type: String,
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'AllPost',
    },
    likedcomment: {
        type: String,
    },
    comment: {
        type: String,
    }

}, { timestamps: true });


var Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;