const express = require('express'),
    Activity = require('../models/activitySchema');
var authenticate = require('../authenticate');

const activityRouter = express.Router();

activityRouter
    .post('/', authenticate.verifyUser, (req, res, next) => {
        Activity.findOne(req.body).then((act) => {
            if (act) {
                return res.json({ success: false, message: "Activity Already Uploaded" });
            } else {
                Activity.create(req.body).then((activity) => {
                    res.setHeader('Content-Type', 'application/json');
                    return res.json({ success: true, message: "Activity Uploaded Successfully" });
                }, (err) => next(err))
                    .catch((err) => next(err));
            }
        }, (err) => next(err))
            .catch((err) => next(err));

    })
    .post('/get', authenticate.verifyUser, (req, res, next) => {

        Activity
            .find({
                to: req.user._id,
                // createdAt: {
                //     // $gte: new Date(req.body.startDate),
                //     $lt: new Date(req.params.endDate)
                // }
            },
            )
            .sort({ createdAt: -1 })
            .limit(req.body.end)
            .populate([

                {
                    path: 'to',
                    model: 'User',

                },
                {
                    path: 'post',
                    model: 'AllPost',
                },
                {
                    path: 'from',
                    model: 'User',
                },
            ]
            ).then((activity) => {
                if (activity) {

                    return res.json({ success: true, message: "Found", activity });
                } else {
                    return res.status(403).json({ success: false, message: "Not Found" });

                }
            }).catch((err) => next(err));
    });

module.exports = activityRouter;