var passport = require('passport');
// Local Strategy for authenticate user using username and password
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/userSchema');
// JWTStartegy for Verifying JWt Token
var JwtStrategy = require('passport-jwt').Strategy;
// ExtractJwt For extracting token from header and all.
var ExtractJwt = require('passport-jwt').ExtractJwt;
// jwt for creating token
var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

var config = require('./config');

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

exports.getToken = (userId) => {
    return jwt.sign(userId, config.secretKey); //option = {expiresIn: 3600}
};

var opt = {};
opt.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opt.secretOrKey = config.secretKey;

exports.jwtPassport = passport.use(new JwtStrategy(opt, (jwt_payload, done) => {
    console.log("JWT Payload:", jwt_payload);
    User.findOne({ _id: jwt_payload._id }, (err, user) => {
        if (err) {
            // When Error occurs
            return done(err, false);
        } else if (user) {
            // When User Founds and token verified
            return done(null, user);
        } else {
            // If New user
            return done(null, false);
        }
    });
}));

// Simple Calling this function we will check wether user is verified or not
exports.verifyUser = passport.authenticate('jwt', { session: false });

exports.verifyAdmin = (req,res,next)=>{
    if(req.user.admin){
        next();
    }else{
        return res.status(403).json({ success: false, message: "You are not authorized to perform this operation!" });
    }
}