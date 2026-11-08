
const express = require("express");
const router = express.Router();

const authenticateAgent = require("../middleware/authMiddleware");
const { receiveHeartbeat } = require("../controllers/heartbeatController");

router.post("/", authenticateAgent, receiveHeartbeat);

module.exports = router;
