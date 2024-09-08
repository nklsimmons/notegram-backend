var mongoose = require('mongoose');


const schema = new mongoose.Schema({
  username: String,
  password: String,
});
const User = mongoose.model('User', schema);

module.exports = class UserRepository {
  constructor() {
    mongoose.connect(process.env.MONGO_URI);
  }

  async getUserById(id) {
    return await User.findById(id);
  }

  async getAllUsers() {
    const result = await User.find();
    return result;
  }

  async createUser(user) {
    const newUser = new User(user);
    return await newUser.save();
  }
};
