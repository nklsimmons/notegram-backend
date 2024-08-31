var dotenv = require('dotenv');
var mongodb = require('mongodb');

dotenv.config();

module.exports = async function(collectionName) {
  const uri = process.env.MONGO_URI || "";
  const client = new mongodb.MongoClient(uri);

  return client
    .db("notegram")
    .collection(collectionName);
};
