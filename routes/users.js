var express = require('express');
var router = express.Router();
var ObjectId = require('mongodb').ObjectId;
var passport = require('passport');


/* GET current user. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  const db = await dbConn;
  const coll = db.collection("users")

  const result = await coll.findOne({
    username: req.user.username
  }, {});

  res.send({
    username: result.username,
  });
});

/* GET user by id. */
router.get('/:userId', async function(req, res, next) {
  try {
    const db = await dbConn;
    const coll = db.collection("users")

    const result = await coll.findOne({
      "_id": new ObjectId(req.params.userId)
    }, {});

    res.send(result);
  } catch(err) {
    next(err);
  }
});

module.exports = router;
