var express = require('express');
var router = express.Router();
var dbConn = require('../services/db');
const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {

  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  return await jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)

    req.user = user

    // next()
  });
}

/* GET notes listing. */
router.get('/', async function(req, res, next) {
  await authenticateToken(req, res, next);

  const db = await dbConn;

  const notesCollection = db.collection("notes")

  const query = { user: req.user.username };
  const options = {};

  const result = await notesCollection.find(query, options).toArray();

  res.send(result);
});

/* POST note. */
router.post('/', async function(req, res, next) {
  await authenticateToken(req, res, next);

  const user = req.user.username;

  const db = await dbConn;

  const notesCollection = db.collection("notes")

  const newNote = {
    user: user,
    text: req.body.text,
    active: 1,
    notebook: null,
  }

  await notesCollection.insertOne(newNote);

  res.sendStatus(201);
});

module.exports = router;
