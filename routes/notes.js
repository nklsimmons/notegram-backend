var express = require('express');
var router = express.Router();
var dbConn = require('../services/db');
var passport = require('passport');
var ObjectId = require('mongodb').ObjectId;


/* GET notes listing. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const sortDirection = req.query.sort == 'asc' ? 1 : -1;
    const sortField = req.query.sortField ?? '_id';

    const db = await dbConn;
    const notesCollection = db.collection("notes")

    const sorting = {};
    if(sortField) {
      sorting[sortField] = sortDirection;
    }

    const result = await notesCollection.find({ user: req.user.username }, {})
      .sort(sorting)
      .toArray();

    res.send(result);
  } catch(err) {
    next(err);
  }
});

/* POST note. */
router.post('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const user = req.user.username;
    const db = await dbConn;
    const notesCollection = db.collection("notes")

    await notesCollection.insertOne({
      user: user,
      text: req.body.text,
      active: 1,
      notebook: null,
    });

    res.sendStatus(201);
  } catch(err) {
    next(err);
  }
});

/* DELETE note. */
router.delete('/:id', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const noteId = req.params.id;

    const db = await dbConn;
    const notesCollection = db.collection("notes")

    const result = await notesCollection.deleteOne({
      _id: new ObjectId(noteId),
      user: req.user.username,
    }, {});

    if(result.deletedCount) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch(err) {
    next(err);
  }
});

/* POST note tag. */
router.post('/:id/tags', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  const noteId = req.params.id;

  const db = await dbConn;
  const notesCollection = db.collection("notes")

  const result = await notesCollection.findOne({
    _id: new ObjectId(noteId),
    user: req.user.username,
  }, {});

  const existingTags = result.tags ?? [];
  const allTags = existingTags.concat(req.body.tags);
  const allUniqueTags = [...new Set(allTags)];

  await notesCollection.updateOne(query, {
    $set: {tags: allUniqueTags}
  });

  const updatedNote = await notesCollection.findOne(query, options);

  res.send(updatedNote);
});


/* GET note tag. */
router.get('/tags', passport.authenticate('jwt', { session: false }), async function(req, res, next) {

  let notesCollection;

  getCollection("notes")
    .then(coll => {
      notesCollection = coll;

      return coll.aggregate([
        { $match: { user: req.user.username } },
        { $group: { _id: "$tags" } },
      ], {});
    })
    .then(result => {
      return result.toArray();
    })
    .then(notesTags => {
      let allTags = [];

      notesTags.forEach(tags => {
        allTags = allTags.concat(tags._id);
      });
      const allUniqueTags = [...new Set(allTags)];

      res.send(allUniqueTags);
    })
    .catch(err => {
      res.status(400).send({ error: String(err) });
    })
});

module.exports = router;
