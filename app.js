var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');

var indexRouter = require('./routes/index');
const usersRouter = require('./routes/users'),
  config = require('./config'),
  mongoose = require('mongoose'),
  uploadImageRouter = require('./routes/uploadImageRouter'),
  postsRouter = require('./routes/postsRouter'),
  activitiesRouter = require('./routes/activityRouter');



const connect = mongoose.connect(config.mongoUrl);
connect.then((res) => {
  console.log("Connected To Database Succefully");
}).catch((err) => next(err));

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use('/public/images', express.static(__dirname + '/public/images'));
app.use(express.static(path.join(__dirname + 'public')));


app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/uploadImage', uploadImageRouter);
app.use('/post', postsRouter);
app.use('/activity', activitiesRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render('error');

  if (typeof (err) === 'string') {
    // custom application error
    return res.status(400).json({ success: false, message: err });
  }
  // default to 500 server error
  return res.status(500).json({ success: false, message: err.message });
});

module.exports = app;
