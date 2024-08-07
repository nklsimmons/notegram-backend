var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

var dbConn = require('../services/db');
var ObjectId = require('mongodb').ObjectId;

function generateAccessToken(username) {
  return jwt.sign({username}, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
}

function authenticateToken(req, res, next) {
  // const authHeader = req.headers['authorization']
  // const token = authHeader && authHeader.split(' ')[1]

  // if (token == null) return res.sendStatus(401)

  // jwt.verify(token, process.env.TOKEN_SECRET as string, (err: any, user: any) => {
  //   console.log(err)

  //   if (err) return res.sendStatus(403)

  //   req.user = user

  //   next()
  // })
}

// function somethingsomethingpassword

/* POST new user */
router.post('/register', async function(req, res, next) {

  const db = await dbConn;

  const coll = db.collection("users");

  const newUser = {
    username: req.body.username,
    password: req.body.password,
  }

  coll.insertOne(newUser)

  res.send({
    id: newUser._id,
    username: newUser.username,
    token: generateAccessToken(newUser.username),
  });
});

/* POST retrieve JWT */
router.post('/login', async function(req, res, next) {

  const db = await dbConn;

  const coll = db.collection("users");

  const user = {
    username: req.body.username,
    password: req.body.password,
  }

  const foundUser = await coll.findOne(user);

  res.send({
    id: foundUser._id,
    username: foundUser.username,
    token: generateAccessToken(foundUser.username),
  });
});

module.exports = router;
