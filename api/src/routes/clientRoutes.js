
const express = require("express");
const router = express.Router();

const { createClient } = require("../controllers/clientController");

// Register a new monitoring client
router.post("/", createClient);

module.exports = router;
