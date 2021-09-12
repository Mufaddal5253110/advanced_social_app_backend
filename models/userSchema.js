const mongoose = require('mongoose'),
    Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
    admin: {
        type: Boolean,
        default: false,
    },
    firstname: String,
    lastname: String,
    fullname: String,
    profileImage: String,
    // email: String,
    fbId: String,
    website: String,
    bio: String,
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],
    followings: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }]

}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

var Users = mongoose.model('User', userSchema);
module.exports = Users;