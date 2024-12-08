const squardPart = require('../models/partModel');

const getSquardParts = async (req, res, next) => {
    try {
        const squardParts = await squardPart.getSpareParts();
        res.status(200).json(squardParts);
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const getSquardPartById = async (req, res, next) => {
    try {
        const squardParts = await squardPart.getSparePartById(req.params.id);
        if (!squardParts) {
            const error = new Error("Spare Part not found");
            error.status = 404;
            return next(error);  // Pass error to the global error handler
        }
        res.status(200).json(squardParts);
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const createSquardPart = async (req, res, next) => {
    try {
        const squardPartId = await squardPart.createSparePart(req.body);
        res.status(201).json({ message: "Spare Part created", squardPartId });
    } catch (error) {
        next(error);  // Pass error to the global error handler
    }
};

const updateSquardPartById = async (req, res, next) => {
    try {
        const success = await squardPart.updateSparePartById(req.params.id, req.body);
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

const deleteSquardPartById = async (req, res, next) => {
    try {
        const success = await squardPart.deleteSparePartById(req.params.id);
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
    getSquardParts,
    getSquardPartById,
    createSquardPart,
    updateSquardPartById,
    deleteSquardPartById
};
