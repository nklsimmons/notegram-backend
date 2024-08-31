var dotenv = require('dotenv');
var mongodb = require('mongodb');

dotenv.config();

const uri = process.env.MONGO_URI || "";
const client = new mongodb.MongoClient(uri);

const db = client.db("notegram");

module.exports = db;
