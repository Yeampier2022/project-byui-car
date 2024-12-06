const mongodb = require("../database/database");
const ObjectId = require("mongodb").ObjectId;

const getClients = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const clients = await db.collection("clients").find().toArray();
    res.json(clients);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getClientsId = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "must use valid id employees" });
    return;
  }
  const id = new ObjectId(req.params.id);
  const result = await mongodb
    .getDb()
    .client.db()
    .collection("clients")
    .find({ _id: id });
  result.toArray().then((clients) => {
    if (clients.error) {
      res.status(400).json(clients.error);
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(clients[0]);
  });
};



const deleteClients = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json('Must use a valid client id to delete a client.');
  }
  const userId = new ObjectId(req.params.id);
  const response = await mongodb.getDb().db().collection('client').remove({ _id: userId }, true);
  console.log(response);
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while deleting the client.');
  }
};
module.exports = {
  getClients,
  getClientsId,
  deleteClients
};
