var mongoose = require('mongoose');


const schema = new mongoose.Schema({
  user: String,
  title: String,
  text: String,
  active: Boolean,
  tags: [String],
});
const Note = mongoose.model('Note', schema);

module.exports = class NoteRepository {
  constructor(user) {
    this.user = user;
    mongoose.connect(process.env.MONGO_URI);
  }

  async getAllNotes(sorting = null) {
    const result = await Note.find({ user: this.user.username });
    return result;
  }

  async getAllNoteTags() {

    let result = await Note.aggregate([
      { $match: { user: this.user.username } },
      { $group: { _id: "$tags" } },
    ], {});

    let allTags = [];

    result.forEach(tags => {
      allTags = allTags.concat(tags._id);
    });
    const allUniqueTags = [...new Set(allTags)];

    return allUniqueTags;
  }

  async createNote({ title = '', text = '' }) {
    const newNote = new Note({
      user: this.user.username,
      title: title,
      text: text,
      active: true,
    });

    return await newNote.save();
  }

  async deleteNote(noteId) {
    return await Note.deleteOne({ _id: new mongoose.Types.ObjectId(noteId) });
  }

  async addNoteTag(noteId, tags) {

    const note = await Note.findById(noteId);

    const existingTags = note.tags ?? [];
    const allTags = existingTags.concat(tags);
    const allUniqueTags = [...new Set(allTags)];

    note.tags = allUniqueTags;
    return await note.save();
  }
};
