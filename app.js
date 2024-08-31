var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
var dbConn = require('./services/db');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var ObjectId = require('mongodb').ObjectId;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notesRouter = require('./routes/notes');
var authRouter = require('./routes/auth');

var app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = process.env.TOKEN_SECRET;

passport.use(new JwtStrategy(opts, async function(jwt_payload, done) {
  const db = await dbConn;
  const coll = db.collection("users")

  const foundUser = await coll.findOne({ _id: new ObjectId(jwt_payload.user) });
  // TODO: Expiry?

  done(null, { id: String(foundUser._id), username: foundUser.username });
}));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

module.exports = app;
