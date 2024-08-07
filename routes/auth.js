var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

var dbConn = require('../services/db');
var ObjectId = require('mongodb').ObjectId;

function generateAccessToken(username) {
  return jwt.sign({username}, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
}

// function somethingsomethingpassword

// TODO: Export these into service methods, which return promises
// https://www.toptal.com/express-js/routes-js-promises-error-handling
/* POST new user */
router.post('/register', async (req, res, next) => {
  try {
    const db = await dbConn;

    const coll = db.collection("users");

    const newUser = {
      username: req.body.username,
      password: req.body.password,
    }

    coll.insertOne(newUser);

    res.send({
      id: newUser._id,
      username: newUser.username,
      token: generateAccessToken(newUser.username),
    });
  } catch(err) {
    next(err);
  }
});

/* POST retrieve JWT */
router.post('/login', async (req, res, next) => {
  try {
    const db = await dbConn;

    const coll = db.collection("users");

    const user = {
      username: req.body.username,
      password: req.body.password,
    }

    const foundUser = await coll.findOne(user);

    if(!foundUser) {
      res.status(404);
      res.send("");
      return;
    }

    res.send({
      id: foundUser._id,
      username: foundUser.username,
      token: generateAccessToken(foundUser.username),
    });

  } catch(err) {
    next(err)
  }
});

module.exports = router;
