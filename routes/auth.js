var express = require('express');
var router = express.Router();
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var UserRepository = require('../repositories/UserRepository');


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

  const repository = new UserRepository();
  const foundUser = await repository.getUser({ username: username });

  if(foundUser) {
    [ hashedPassword, passwordSalt ] = foundUser.password.split('.');
    let result = verifyPassword(password, hashedPassword, passwordSalt);

    if(result)
      return res.send({
        token: generateAccessToken(String(foundUser._id)),
        username: foundUser.username
      });
  }

  res.status(401).send({ error: 'Unauthorized' });
});

/* POST signup */
router.post('/register', async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  const repository = new UserRepository();
  const foundUser = await repository.getUser({ username: username });

  if(foundUser) {
    return res.status(400).send({ error: 'Username already exists' });
  }

  const pwsalt = crypto.randomBytes(16).toString('hex');
  const pwhash = crypto
    .pbkdf2Sync(password, pwsalt, 310000, 32, 'sha256')
    .toString('hex');

  const insertResult = await repository.createUser({
    username: username,
    password: pwhash + '.' + pwsalt,
  });

  res.send({
    token: generateAccessToken(insertResult.insertedId),
    username: username,
  });
});

module.exports = router;
