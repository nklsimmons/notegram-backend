var express = require('express');
var router = express.Router();
var dotenv = require('dotenv');
var dbConn = require('../services/db');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectId;

async function authenticateToken(req, res, next) {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  return await jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user

    // next()
  });
}

/* GET current user. */
router.get('/', async function(req, res, next) {
  await authenticateToken(req, res, next);

  const db = await dbConn;

  const coll = db.collection("users")

  const query = { username: req.user.username };
  const options = {};

  const result = await coll.findOne(query, options);

  res.send({
    username: result.username,
  });

  // res.send(() =>);
});

/* GET user by id. */
router.get('/:userId', async function(req, res, next) {

  const db = await dbConn;

  const coll = db.collection("users")

  const query = {"_id": new ObjectId(req.params.userId)};
  const options = {};

  const result = await coll.findOne(query, options);

  res.send(result);
});

/* POST new user */
router.post('/', async function(req, res, next) {

  const db = await dbConn;

  const coll = db.collection("users");

  const newUser = {
    username: req.body.username,
    password: req.body.password,
  }

  coll.insertOne(newUser)

  res.send(newUser);
});

module.exports = router;
