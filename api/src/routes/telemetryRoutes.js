
const express = require("express");
const router = express.Router();

const authenticateAgent = require("../middleware/authMiddleware");
const { receiveTelemetry } = require("../controllers/telemetryController");

router.post("/", authenticateAgent, receiveTelemetry);

module.exports = router;
