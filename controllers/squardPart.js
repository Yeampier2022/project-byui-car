const squardPart = require('../models/partModel');

const getSquardParts = async (req, res) => {
    try {
        const squardParts = await squardPart.getSquardParts();
        res.status(200).json(squardParts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch squardParts" });
    }
}

const getSquardPartById = async (req, res) => {
    try {
        const squardParts = await squardPart.getSquardPartById(req.params.id);
        if (!squardParts) {
            return res.status(404).json({ message: "SquardPart not found" });
        }
        res.status(200).json(squardParts);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

const createSquardPart = async (req, res) => {
    try {
        const squardPartId = await squardPart.createSparePart(req.body);
        res.status(201).json({ message: "SquardPart created", squardPartId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create squardPart" });
    }
}

const updateSquardPartById = async (req, res) => {
    try {
        const success = await squardPart.updateSquardPartById(req.params.id, req.body);
        if (!success) {
            return res.status(404).json({ message: "SquardPart not found" });
        }
        res.status(200).json({ message: "SquardPart updated" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

const deleteSquardPartById = async (req, res) => {
    try {
        const success = await squardPart.deleteSquardPartById(req.params.id);
        if (!success) {
            return res.status(404).json({ message: "SquardPart not found" });
        }
        res.status(200).json({ message: "SquardPart deleted" });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
}

module.exports = {
    getSquardParts,
    getSquardPartById,
    createSquardPart,
    updateSquardPartById,
    deleteSquardPartById
};
