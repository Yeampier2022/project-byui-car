const express = require("express");
const router = express.Router();
const squardPartController = require("../controllers/squardPart");

router.get("/", squardPartController.getSquardPart);
router.get("/:id", squardPartController.getSquardPartById);
router.post("/", squardPartController.createSquardPart);
router.put("/:id", squardPartController.updateSquardPartById);
router.delete("/:id", squardPartController.deleteSquardPartById);

module.exports = router;