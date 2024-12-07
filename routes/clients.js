const express = require("express");
const router = express.Router();
const clientsController = require("../controllers/clients");

router.get("/", clientsController.getClients);
router.get("/:id", clientsController.getClientById);
router.post("/", clientsController.createClient);
router.put("/:id", clientsController.updateClientById);
router.delete("/:id", clientsController.deleteClientById);

module.exports = router;