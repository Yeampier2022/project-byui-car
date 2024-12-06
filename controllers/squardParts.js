const mongodb = require("../database/database");
const ObjectId = require("mongodb").ObjectId;

const getSquardPart = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const cars = await db.collection("squardPart").find().toArray();
    res.json(squardPart);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getSquardPartId = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "must use valid id employees" });
    return;
  }
  const id = new ObjectId(req.params.id);
  const result = await mongodb
    .getDb()
    .squardPart.db()
    .collection("squardPart")
    .find({ _id: id });
  result.toArray().then((squardPart) => {
    if (squardPart.error) {
      res.status(400).json(squardPart.error);
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(squardPart[0]);
  });
};



const deleteSquardPart = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json('Must use a valid squardPart id to delete a squardPart.');
  }
  const userId = new ObjectId(req.params.id);
  const response = await mongodb.getDb().db().collection('squardPart').remove({ _id: userId }, true);
  console.log(response);
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while deleting the squardPart.');
  }
};
module.exports = {
  getSquardPart,
  getSquardPartId,
  deleteSquardPart
};
