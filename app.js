const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
var cors = require('cors');
// const mongoose = require('mongoose');

const userRouter = require('./src/routes/users');
const indexRouter = require('./src/routes/index');

const app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);
app.use('/users', userRouter);
// app.use('/sensor', sensorRoute);

// catch 404 and forward to error handler
app.use((req, res, next) => next(createError(404)));

// const allowCrossDomain = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// };
//
// app.use(allowCrossDomain);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cache-Control', 'no-cache');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.use(cors());

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// Establish MongoDB connection
// mongoose.connect(process.env.Mongo_URL, { useNewUrlParser: true, useUnifiedTopology: true });
// const mongodb = mongoose.connection;
//
// mongodb.on('error', err => console.error(err));
// mongodb.once('open', () => console.log('mongodb: connection established'));

/**
 * Event listener for MQTT "connect" event.
 */

// NOTE: topic can contain only strings, "-" and "_"
// async function onMessage(topic, message) {
//   // simple regex to match either:
//   // 1. a string: "topic"
//   // 2. string with a slash: "topic/somethingelse"
//   if (/([A-Za-z\-_]+$|[A-Za-z\-_]+\/[A-Za-z\-_]+$)/g.test(topic)) {
//
//   }
// }

module.exports = app;
