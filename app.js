var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var passport = require('passport');
var UserRepository = require('./repositories/UserRepository');
var dotenv = require('dotenv');

var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var notesRouter = require('./routes/notes');
var authRouter = require('./routes/auth');
var ObjectId = require('mongodb').ObjectId;

dotenv.config();

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
  const repo = new UserRepository();

  const foundUser = await repo.getUserById(jwt_payload.user)

  // TODO: Expiry?

  if (foundUser)
    return done(null, { id: foundUser._id, username: foundUser.username });

  return done(null, false);
}));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);
app.use('/api/notes', notesRouter);
app.use('/api/auth', authRouter);

module.exports = app;
