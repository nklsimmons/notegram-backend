var express = require('express');
var router = express.Router();
var getCollection = require('../services/db');
var passport = require('passport');
var ObjectId = require('mongodb').ObjectId;


/* GET notes listing. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {

  const sortDirection = req.query.sort == 'asc' ? 1 : -1;
  const sortField = req.query.sortField ?? '_id';

  const sorting = {};
  if(sortField) {
    sorting[sortField] = sortDirection;
  }

  getCollection("notes")
    .then(coll => {
      return coll.find({ user: req.user.username }, {});
    })
    .then(result => {
      return result
      .sort(sorting)
      .toArray();
    })
    .then(foundNotes => {
      res.send(foundNotes);
    })
});

/* POST note. */
router.post('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {

  const user = req.user.username;

  getCollection("notes")
    .then(coll => {
      return coll.insertOne({
        user: user,
        text: req.body.text,
        active: 1,
        notebook: null,
      });
    })
    .then(insertResult => {
      res.sendStatus(201);
    })
    .catch(err => {
      res.status(400).send({ error: String(err) });
    })
  ;
});

/* DELETE note. */
router.delete('/:id', passport.authenticate('jwt', { session: false }), async function(req, res, next) {

  getCollection("notes")
    .then(coll => {
      coll.deleteOne({
        _id: new ObjectId(req.params.id),
        user: req.user.username,
      }, {});
    })
    .then(result => {
      if(result.deletedCount) {
        res.sendStatus(204);
      } else {
        res.sendStatus(404);
      }
    })
    .catch(err => {
      res.status(400).send({ error: String(err) });
    })
  ;
});

/* POST note tag. */
router.post('/:id/tags', passport.authenticate('jwt', { session: false }), async function(req, res, next) {

  let notesCollection;
  let query = {
    _id: new ObjectId(req.params.id),
    user: req.user.username,
  };
  let options = {};

  getCollection("notes")
    .then(coll => {
      notesCollection = coll;

      return coll.findOne(query, {});
    })
    .then(result => {
      const existingTags = result.tags ?? [];
      const allTags = existingTags.concat(req.body.tags);
      const allUniqueTags = [...new Set(allTags)];

      return notesCollection.updateOne(query, {
        $set: {tags: allUniqueTags}
      });
    })
    .then(result => {
      return notesCollection.findOne(query, options);
    })
    .then(updatedNote => {
      res.send(updatedNote);
    })
    .catch(err => {
      res.status(400).send({ error: String(err) });
    })
});

module.exports = router;
