var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var getCollection = require('../services/db');


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

  getCollection("users")
    .then(coll => {
      return coll.findOne({ username: username }, {});
    })
    .then(foundUser => {
      if(!foundUser) throw new Error('Unauthorized');

      console.log(foundUser);

      [ hashedPassword, passwordSalt ] = foundUser.password.split('.');
      let result = verifyPassword(password, hashedPassword, passwordSalt);

      if(!result) throw new Error('Unauthorized');

      res.send({
        token: generateAccessToken(String(foundUser._id)),
        username: foundUser.username
      });
    })
    .catch(err => {
      res.status(401).send({ error: String(err) });
    })
  ;
});

/* POST signup */
router.post('/register', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  let usersCollection;

  getCollection("users")
    .then(coll => {
      usersCollection = coll;
      return coll.findOne({ username: username }, {});
    })
    .then(foundUser => {
      if(foundUser) throw new Error('Username already exists');

      const pwsalt = crypto.randomBytes(16).toString('hex');
      const pwhash = crypto
        .pbkdf2Sync(password, pwsalt, 310000, 32, 'sha256')
        .toString('hex');

      const insertResult = usersCollection.insertOne({
        username: username,
        password: pwhash + '.' + pwsalt,
      });

      res.send({
        token: generateAccessToken(insertResult.insertedId),
        username: username,
      });
    })
    .catch(err => {
      res.status(400).send({ error: String(err) });
    })
  ;
});

module.exports = router;
