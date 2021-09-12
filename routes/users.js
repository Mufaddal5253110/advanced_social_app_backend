var express = require('express');
const Users = require('../models/userSchema'),
  authenticate = require('../authenticate'),
  passport = require('passport');


var router = express.Router();


router
  .post('/', authenticate.verifyUser, function (req, res, next) {
    Users
      .find({})
      .sort({ firstname: 1 })
      .limit(req.body.end)
      .skip(req.body.start)
      .then((users) => {
        res.json({ success: true, message: 'Users Found', users });
      }, (err) => next(err))
      .catch((err) => next(err));
  })
  .post('/login/', (req, res, next) => {
    if (req.body.fbId) {
      // login with fb
      Users.findOne({ fbId: req.body.fbId }).then((user) => {
        if (user) {
          // User Already Exist Just login
          var token = authenticate.getToken({ _id: user._id });
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, message: 'You are successfully logged in!', user: user });
        } else {
          // User Doesnot Exist Register and than login
          res.json({ success: false, message: 'User not exists!' });


        }
      }).catch((err) => next(err));
    } else {
      // login with email
      Users.findOne({ username: req.body.username }).then((user) => {
        if (user) {
          // User Already Exist Just login
          passport.authenticate('local', (err, user, info) => {
            // console.log("entered");
            // console.log(user);
            // console.log(info);
            if (user) {
              var token = authenticate.getToken({ _id: user._id });
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.json({ success: true, token: token, message: 'You are successfully logged in!', user: user });
            } else {
              return res.json({ success: false, message: 'Invalid Password' });
            }
          })(req, res, next);
          // (req, res, () => {
          //   // console.log(res);
          //   var token = authenticate.getToken({ _id: user._id });
          //   res.statusCode = 200;
          //   res.setHeader('Content-Type', 'application/json');
          //    res.json({ success: true, token: token, message: 'You are successfully logged in!', user: user });
          // });
        } else {
          // User Doesnot Exist Register and than login
          res.json({ success: false, message: 'User not exists!' });
        }
      }).catch((err) => next(err));
    }
  })
  .post('/signup/', (req, res, next) => {
    userr = new Users(req.body);
    Users.register(new Users(req.body), req.body.password, (err, user) => {
      if (err) {
        return res.status(500).json({ error: err });

      } else {
        passport.authenticate('local')(req, res, () => {
          var token = authenticate.getToken({ _id: user._id });
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.json({ success: true, token: token, message: 'You are successfully registered!', user: user });
        });
      }
    });
  })
  .put('/profile', authenticate.verifyUser, (req, res, next) => {
    Users.findByIdAndUpdate(req.user._id, { $set: req.body }, { new: true }).then((user) => {
      if (user) {

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, message: 'Profile Updated Successfully', user: user });
      } else {
        res.status(403).json({ success: false, message: 'User Not Found' });
      }
    }).catch((err) => next(err));
  })
  .post("/follow", authenticate.verifyUser, (req, res, next) => {

    // First adding other user to current users following list
    Users.findById(req.user._id)
      .then((user) => {
        if (user) {
          if (user.followings.indexOf(req.body.userid) == -1) {
            // add to followings list
            user.followings.push(req.body.userid);
            return user.save();
          } else {
            return res.json({ success: false, message: "Already Following" });
          }
        } else {
          return res.status(403).json({ success: false, message: 'User Not Found' });
        }
      })
      // Now adding current user to other users followers list
      .then((currentuser) => {
        Users.findById(req.body.userid)
          .then((user) => {
            if (user) {
              if (user.followers.indexOf(req.user._id) == -1) {
                // add to followers list
                user.followers.push(req.user._id);
                user.save().then((user) => {
                  return res.json({ success: true, message: "Followed Successfully!" });
                });
              }
            } else {
              currentuser.followings.splice(currentuser.followings.indexOf(req.body.userid), 1);
              currentuser.save().then((_) => {
                return res.status(403).json({ success: false, message: 'User Not Found' });
              }).catch((err) => next(err));
            }
          }).catch((err) => next(err));
      })
      .catch((err) => next(err));
  })
  .post("/unfollow", authenticate.verifyUser, (req, res, next) => {

    // First removing other user from current users following list
    Users.findById(req.user._id)
      .then((user) => {
        if (user) {
          if (user.followings.indexOf(req.body.userid) == -1) {

            return res.json({ success: false, message: "Not Following" });
            // user.followings.push(req.body.userid);
            // return user.save()
          } else {
            // remove from followings list
            user.followings.splice(user.followings.indexOf(req.body.userid), 1);
            return user.save();
          }
        } else {
          return res.status(403).json({ success: false, message: 'User Not Found' });
        }
      })
      // Now removing current user from other users followers list
      .then((currentuser) => {
        Users.findById(req.body.userid)
          .then((user) => {
            if (user) {
              if (user.followers.indexOf(req.user._id) == -1) {
                return res.json({ success: false, message: "Already UnFollowed!" });
                // user.followers.push(req.user._id);
                // user.save().then((user) => {
                //   return res.json({ success: true, message: "Followed Successfully!" });
                // });
              } else {
                // remove from followers list
                user.followers.splice(user.followers.indexOf(req.user._id), 1);
                user.save().then((_) => {
                  return res.json({ success: true, message: 'Unfollowed Successfully' });
                }).catch((err) => next(err));
              }
            } else {
              // Nothing

            }
          }).catch((err) => next(err));
      })
      .catch((err) => next(err));
  });

module.exports = router;
