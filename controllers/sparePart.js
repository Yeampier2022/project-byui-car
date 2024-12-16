const sparePart = require('../models/partModel');

const getSpareParts = async (req, res, next) => {
    try {
        const spareParts = await sparePart.getSpareParts();
        res.status(200).json(spareParts);
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const getSparePartById = async (req, res, next) => {
    try {
        const spareParts = await sparePart.getSparePartById(req.params.id);
        if (!spareParts) {
            const error = new Error("Spare Part not found");
            error.status = 404;
            return next(error);  // Pass error to the global error handler
        }
        res.status(200).json(spareParts);
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const createSparePart = async (req, res, next) => {
    try {
        const sparePartId = await sparePart.createSparePart(req.body);
        res.status(201).json({ message: "Spare Part created", id: sparePartId });
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const updateSparePartById = async (req, res, next) => {
    try {
        const success = await sparePart.updateSparePartById(req.params.id, req.body);
        if (!success) {
            const error = new Error("Spare Part not found");
            error.status = 404;
            return next(error);  // Pass error to the global error handler
        }
        res.status(200).json({ message: "Spare Part updated" });
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const deleteSparePartById = async (req, res, next) => {
    try {
        const success = await sparePart.deleteSparePartById(req.params.id);
        if (!success) {
            const error = new Error("Spare Part not found");
            error.status = 404;
            return next(error);  // Pass error to the global error handler
        }
        res.status(200).json({ message: "Spare Part deleted" });
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

module.exports = {
    getSpareParts,
    getSparePartById,
    createSparePart,
    updateSparePartById,
    deleteSparePartById
};
