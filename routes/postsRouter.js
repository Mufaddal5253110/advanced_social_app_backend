const express = require('express'),
    // Posts = require('../models/postSchema'),
    AllPosts = require('../models/allPostSchema');
var authenticate = require('../authenticate');


const postRouter = express.Router();

postRouter.post("/all", authenticate.verifyUser, (req, res, next) => {
    req.body.followings.push(req.user._id.toString());
    // var finalList = [];
    // console.log(req.body.followings);
    AllPosts
        .find({
            user: { $in: req.body.followings },
            // user: req.user._id,
            // createdAt: {
            //     $gte: new Date(req.body.startDate),
            //     $lt: new Date(req.body.endDate)
            // }

        })
        .sort({ createdAt: -1 })
        .limit(req.body.end)
        // .skip(req.body.start)
        .populate([

            {
                path: 'user',
                model: 'User',

            },
            // {
            //     path: 'comments.user',
            //     model: 'User',
            // },
            // {
            //     path: 'likes',
            //     model: 'User',
            // },
        ]
        )
        .then((posts) => {
            if (posts) {

                return res.json({ success: true, message: "Found", posts });
            } else {
                return res.status(403).json({ success: false, message: "Not Found" });

            }
        }).catch((err) => next(err));
});

postRouter.route('/my/get')
    .post(authenticate.verifyUser, (req, res, next) => {
        AllPosts
            .find({ user: req.user._id })
            .populate([

                {
                    path: 'user',
                    model: 'User',

                },
                // {
                //     path: 'comments.user',
                //     model: 'User',
                // },
                // {
                //     path: 'likes',
                //     model: 'User',
                // },
            ]
            ).then((posts) => {
                if (posts) {
                    if (posts.length - req.body.end < 0) {
                        return res.json({ success: true, message: "Found", posts: posts.slice(0, posts.length - req.body.start) });

                    }
                    return res.json({ success: true, message: "Found", posts: posts.slice(posts.length - req.body.end, posts.length - req.body.start) });
                } else {
                    return res.status(403).json({ success: false, message: "Not Found" });
                }
            }).catch((err) => next(err));
    });

postRouter.route('/my')
    .get(authenticate.verifyUser, (req, res, next) => {
        Posts.findOne({ user: req.user._id })
            .populate([
                {
                    path: 'user',
                    model: 'User',
                },
                {
                    path: 'posts.user',
                    model: 'User',

                },
                {
                    path: 'posts.comments.user',
                    model: 'User',
                },
                {
                    path: 'posts.likes',
                    model: 'User',
                },
            ]
            ).then((posts) => {
                if (posts) {
                    return res.json({ success: true, message: "Found", posts: posts });
                } else {
                    return res.status(403).json({ success: false, message: "Not Found" });
                }
            }).catch((err) => next(err));
    })

    .post(authenticate.verifyUser, (req, res, next) => {
        AllPosts.create(req.body).then((post) => {
            res.setHeader('Content-Type', 'application/json');
            return res.json({ success: true, message: "Post Uploaded Successfully", post });
        }, (err) => next(err))
            .catch((err) => next(err));
        // AllPosts.findOne({ user: req.user._id }).then((posts) => {
        //     if (posts) {
        //         // Posts Collection aleady created just append post on posts list
        //         posts.posts.push(req.body);
        //         posts.save().then((posts) => {
        //             return res.json({ success: true, message: "Post Uploaded Successfully", posts: posts });
        //         }).catch((err) => next(err));
        //     } else {
        //         // Create Collection and then post
        //         Posts.create(
        //             {
        //                 'user': req.user._id
        //             }
        //         ).then((posts) => {
        //             posts.posts.push(req.body);
        //             return posts.save();
        //         }).then((posts) => {
        //             return res.json({ success: true, message: "Post Uploaded Successfully", posts: posts });
        //         }).catch((err) => next(err));
        //     }
        // }).catch((err) => next(err));
    })
// .delete(authenticate.verifyUser, (req, res, next) => {
//     AllPost.findOneAndRemove({ 'user': req.user._id }).then((posts) => {
//         if (posts) {
//             // post found delete all
//             return res.json({ success: true, message: "All Posts Deleted Successfully" });
//         } else {
//             // posts not found
//             return res.status(403).json({ success: false, message: "Not Found" });
//         }
//     }).catch((err) => next(err));
// });

postRouter.route('/:postid')
    .get(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).populate([
            {
                path: 'user',
                model: 'User',

            },
            {
                path: 'comments.user',
                model: 'User',
            },
            {
                path: 'likes',
                model: 'User',
            },
        ]).then((post) => {
            if (post) {
                // Posts are availabe now find inside posts array

                // if (post.posts.id(req.params.postid) != null) {
                //     res.setHeader('Content-Type', 'application/json');
                //     // return res.json(post.posts.id(req.params.postid));
                //     return res.json({
                //         success: true, message: "Post Found", post: post.posts.id(req.params.postid)
                //     });
                // } else {

                //     // Post Not Found
                //     return res.status(403).json({ success: false, message: "Not Found" });
                // }

                return res.json({
                    success: true, message: "Post Found", post
                });

            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    })
    .put(authenticate.verifyUser, (req, res, next) => {

        AllPosts.findByIdAndUpdate(req.params.postid, { $set: req.body }, { new: true }).then((post) => {
            if (post) {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({ success: true, message: 'Post Updated Successfully', post });
            } else {
                res.status(403).json({ success: false, message: 'Post Not Found' });
            }
        }).catch((err) => next(err));
        // Posts.findOne({ user: req.user._id }).then((post) => {
        //     if (post) {

        //         if (post.posts.id(req.params.postid) != null) {

        //             if (req.body.imageurl) {
        //                 post.posts.id(req.params.postid).imageurl = req.body.imageurl;
        //             }
        //             if (req.body.caption) {
        //                 post.posts.id(req.params.postid).caption = req.body.caption;
        //             }
        //             if (req.body.location) {
        //                 post.posts.id(req.params.postid).location = req.body.location;
        //             }
        //             post.save().then((postt) => {

        //                 return res.json({ success: true, message: "Post Updated Successfully!" });

        //             }).catch((err) => next(err));
        //         } else {
        //             // Post Not Found
        //             return res.status(403).json({ success: false, message: "Not Found" });
        //         }
        //     } else {
        //         // posts not found
        //         return res.status(403).json({ success: false, message: "Not Found" });
        //     }
        // }).catch((err) => next(err));
    });

postRouter.route('/like/:postid/')
    .get(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {
                // we get the post
                if (post.likes.indexOf(req.user._id) == -1) {

                    post.likes.push(req.user._id);
                    post.save().then((p) => {
                        return res.json({ success: true, message: "Post Liked Successfully!" });
                    }).catch((err) => next(err));
                } else {
                    // Already Liked
                    return res.status(403).json({ success: false, message: "Post Already liked" });
                }

            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    });

postRouter.route('/unlike/:postid/')
    .get(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {

                // we get the post
                if (post.likes.indexOf(req.user._id) != -1) {

                    post.likes.splice(post.likes.indexOf(req.user._id), 1);
                    post.save().then((p) => {
                        return res.json({ success: true, message: "Post UnLiked Successfully!" });
                    }).catch((err) => next(err));
                } else {
                    // Already Liked
                    return res.status(403).json({ success: false, message: "Post Are Not liked by you" });
                }

            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    });

postRouter.route('/comment/:postid/:end')
    .get(authenticate.verifyUser, (req, res, next) => {
        console.log(req.params.userid);
        AllPosts
            .findById(req.params.postid)
            .populate([

                {
                    path: 'comments.user',
                    model: 'User',
                },
            ]).then((post) => {
                if (post) {
                    console.log("mdndkdk");
                    if (post.comments.length < req.params.end) {
                        return res.json({ success: true, message: "Comments Found", comments: post.comments.slice(0, post.comments.length) });
                    }
                    return res.json({ success: true, message: "Comments Found", comments: post.comments.slice(post.comments.length - req.params.end, post.comments.length) });

                } else {
                    // Post Not Found
                    return res.status(403).json({ success: false, message: "Not Found" });
                }
            }).catch((err) => next(err));
    })
    .post(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {

                req.body.user = req.user._id;
                post.comments.push(req.body);
                post.save().then((p) => {
                    return res.json({ success: true, message: "Comment Uploaded Successfully" });
                }).catch((err) => next(err));

            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    })
    .delete(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {
                if (req.user._id.equals(post.user)) {
                    post.comments = [];
                    post.save().then((p) => {
                        return res.json({ success: true, message: "Comments Deleted Successfully" });
                    }).catch((err) => next(err));
                } else {
                    // Not authorized
                    return res.status(403).json({ success: false, message: "You are not authorized to perform this operation!" });
                }
            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    });

postRouter.route('/comment/:postid/:commentid')
    .put(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {

                if (post.comments.id(req.params.commentid)) {
                    if (post.comments.id(req.params.commentid).user.equals(req.user._id)) {
                        post.comments.id(req.params.commentid).comment = req.body.comment;
                        post.save().then((p) => {
                            return res.json({ success: true, message: "Comment Updated Successfully" });
                        }).catch((err) => next(err));
                    } else {
                        // Not authorized
                        return res.status(403).json({ success: false, message: "You are not authorized to perform this operation!" });
                    }
                } else {
                    // Comment not found
                    return res.status(403).json({ success: false, message: "Comment Not Found" });
                }


            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    }).delete(authenticate.verifyUser, (req, res, next) => {
        AllPosts.findById(req.params.postid).then((post) => {
            if (post) {

                if (post.comments.id(req.params.commentid)) {
                    if (post.comments.id(req.params.commentid).user.equals(req.user._id)) {
                        post.comments.id(req.params.commentid).remove();
                        post.save().then((p) => {
                            return res.json({ success: true, message: "Comment Deleted Successfully" });
                        }).catch((err) => next(err));
                    } else {
                        // Not authorized
                        return res.status(403).json({ success: false, message: "You are not authorized to perform this operation!" });
                    }
                } else {
                    // Comment not found
                    return res.status(403).json({ success: false, message: "Comment Not Found" });
                }


            } else {
                // posts not found
                return res.status(403).json({ success: false, message: "Not Found" });
            }
        }).catch((err) => next(err));
    });

module.exports = postRouter;

// let result = yourModel.find({date: { 
//     $gte:`${startDate}`, 
//     $lt: `${endDate}` 
// } })