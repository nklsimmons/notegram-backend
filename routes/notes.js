var express = require('express');
var router = express.Router();
var passport = require('passport');
var NoteRepository = require('../repositories/NoteRepository');


/* GET notes listing. */
router.get('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const sortDirection = req.query.sort == 'asc' ? 1 : -1;
    const sortField = req.query.sortField ?? '_id';

    const repo = new NoteRepository(req.user);

    const sorting = {};
    if(sortField) {
      sorting[sortField] = sortDirection;
    }

    const result = await repo.getAllNotes(req.user.username);


    res.send(result);
  } catch(err) {
    next(err);
  }
});

/* POST note. */
router.post('/', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const repo = new NoteRepository(req.user);

    await repo.createNote({
      text: req.body.text,
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

    const repo = new NoteRepository(req.user);

    const result = await repo.deleteNote(noteId);

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
  const tags = req.body.tags;

  const repo = new NoteRepository(req.user);

  const result = await repo.addNoteTag(noteId, tags);

  res.send(result);
});

/* GET note tags. */
router.get('/tags', passport.authenticate('jwt', { session: false }), async function(req, res, next) {
  try {
    const repository = new NoteRepository(req.user);
    const result = await repository.getAllNoteTags();

    res.send(result);
  } catch(err) {
    next(err);
  }
});

module.exports = router;
