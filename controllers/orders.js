const ordersModel = require('../models/orderModel');


const getOrders = async (req, res) => {
    try {
        const orders = await ordersModel.getOrders();
        res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch orders" });
    }
};

const getOrderById = async (req, res) => {
    try {
        const order = await ordersModel.getOrderById(req.params.id);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

const createOrder = async (req, res) => {
    try {
        const orderId = await ordersModel.createOrder(req.body);
        res.status(201).json({ message: "Order created", orderId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create order" });
    }
};

const updateOrderById = async (req, res) => {
    try {
        const success = await ordersModel.updateOrderById(req.params.id, req.body);
        if (!success) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

const deleteOrderById = async (req, res) => {
    try {
        const success = await ordersModel.deleteOrderById(req.params.id);
        if (!success) {
            return res.status(404).json({ message: "Order not found" });
        }
        res.status(200).json({ message: "Order deleted" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderById,
    deleteOrderById
};