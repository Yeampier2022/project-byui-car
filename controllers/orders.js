const mongodb = require("../database/database");
const ObjectId = require("mongodb").ObjectId;

const getOrders = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const orders = await db.collection("orders").find().toArray();
    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getOrderId = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json({ error: "must use valid id employees" });
    return;
  }
  const id = new ObjectId(req.params.id);
  const result = await mongodb
    .getDb()
    .order.db()
    .collection("orders")
    .find({ _id: id });
  result.toArray().then((orders) => {
    if (orders.error) {
      res.status(400).json(orders.error);
    }
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(orders[0]);
  });
};



const deleteOrders = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    res.status(400).json('Must use a valid order id to delete an order.');
  }
  const userId = new ObjectId(req.params.id);
  const response = await mongodb.getDb().db().collection('orders').remove({ _id: userId }, true);
  console.log(response);
  if (response.deletedCount > 0) {
    res.status(204).send();
  } else {
    res.status(500).json(response.error || 'Some error occurred while deleting the order.');
  }
};
module.exports = {
  getOrders,
  getOrderId,
  deleteOrders
};
