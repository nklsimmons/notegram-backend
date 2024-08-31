var express = require('express');
var router = express.Router();
var getCollection = require('../services/db');
var ObjectId = require('mongodb').ObjectId;
var passport = require('passport');


/* GET current user. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  getCollection("users")
    .then(coll => {
      return coll.findOne({
        username: req.user.username
      }, {});
    })
    .then(result => {
      res.send({
        username: result.username,
      });
    });
});

/* GET user by id. */
router.get('/:userId', async function(req, res, next) {
  getCollection("users")
    .then(coll => {
      return coll.findOne({
        "_id": new ObjectId(req.params.userId)
      }, {});
    })
    .then(result => {
      res.send(result)
    });
});

module.exports = router;
