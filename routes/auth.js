var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var dbConn = require('../services/db');


function generateAccessToken(user) {
  return jwt.sign({user}, process.env.TOKEN_SECRET, { expiresIn: '86400s' });
}

function verifyPassword(password, hashedPassword, salt) {
  const pwhash = crypto
    .pbkdf2Sync(password, salt, 310000, 32, 'sha256')
    .toString('hex');

  return crypto.timingSafeEqual(Buffer.from(pwhash), Buffer.from(hashedPassword));
}

/* POST login */
router.post('/login', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const db = await dbConn;
  const coll = db.collection("users")
  const foundUser = await coll.findOne({ username: username }, {});

  if(foundUser) {
    [ hashedPassword, passwordSalt ] = foundUser.password.split('.');
    let result = verifyPassword(password, hashedPassword, passwordSalt);

    if(result)
      return res.send(generateAccessToken(String(foundUser._id)));
  }

  res.status(401).send('Unauthorized');
});

/* POST signup */
router.post('/register', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  // TODO: unique login

  const db = await dbConn;
  const coll = db.collection("users")

  const pwsalt = crypto.randomBytes(16).toString('hex');
  const pwhash = crypto
    .pbkdf2Sync(password, pwsalt, 310000, 32, 'sha256')
    .toString('hex');

  const insertResult = await coll.insertOne({
    username: username,
    password: pwhash + '.' + pwsalt,
  });

  const user = {
    id: insertResult.insertedId,
    username: username,
  }

  res.send(user);
});

module.exports = router;
