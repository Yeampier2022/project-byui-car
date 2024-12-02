const mongodb = require("../database/database");
const ObjectId = require("mongodb").ObjectId;

const getCars = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const cars = await db.collection("cars").find().toArray();
    res.json(cars);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getCars,
};
