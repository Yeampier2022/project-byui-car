const dotenv = require('dotenv');
dotenv.config();
const MongoClient = require('mongodb').MongoClient;

let database;


const initDb = (callback) => {
    if (database) {
        console.log("db is already!");
        return callback(null, database);
    }
    
    MongoClient.connect(process.env.MONGODB_URL)
      .then((client) => {
        database = client.db();
        callback(null, database);
      })
        .catch((err) => {
            console.log(err);
            callback(err, null);
        }); 
    }
    

const getDb = () => {
  if (!database) {
    throw new Error('Db has not been initialized');
  }
    return database;
}

module.exports = {
    initDb,
    getDb
};