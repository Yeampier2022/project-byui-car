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

const getCarId = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "must use valid id employees" });
    return;
  }
  const id = new ObjectId(req.params.id);
  const result = await mongodb
    .getDb()
    .client.db()
    .collection("cars")
    .find({ _id: id });
  result.toArray().then((cars) => {
    if (cars.error) {
      res.status(400).json(cars.error);
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(cars[0]);
  });
};

module.exports = {
  getCars,
  getCarId,
};
