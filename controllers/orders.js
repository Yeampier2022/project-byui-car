const ordersModel = require('../models/orderModel');

const getOrders = async (req, res, next) => {
    try {
        const orders = await ordersModel.getOrders();
        res.status(200).json(orders);
    } catch (error) {
        next(error);
    }
};

const getOrderById = async (req, res, next) => {
    try {
        const order = await ordersModel.getOrderById(req.params.id);
        if (!order) {
            const error = new Error('Order not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).json(order);
    } catch (error) {
        next(error);
    }
};

const createOrder = async (req, res, next) => {
    try {
        req.body.userId = req.session.user._id;
        const orderId = await ordersModel.createOrder(req.body);
        res.status(201).json({ message: 'Order created', id: orderId });
    } catch (error) {
        next(error);
    }
};

const updateOrderById = async (req, res, next) => {
    try {
        const success = await ordersModel.updateOrderById(req.params.id, req.body);
        if (!success) {
            const error = new Error('Order not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Order updated' });
    } catch (error) {
        next(error);
    }
};

const deleteOrderById = async (req, res, next) => {
    try {
        const success = await ordersModel.deleteOrderById(req.params.id);
        if (!success) {
            const error = new Error('Order not found');
            error.status = 404;
            return next(error);
        }
        res.status(200).json({ message: 'Order deleted' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getOrders,
    getOrderById,
    createOrder,
    updateOrderById,
    deleteOrderById
};
