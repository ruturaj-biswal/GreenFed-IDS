
const heartbeatRoutes = require("./routes/heartbeatRoutes");
const clientRoutes = require("./routes/clientRoutes");
const telemetryRoutes = require("./routes/telemetryRoutes");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const pool = require("./config/db");

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/telemetry", telemetryRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/heartbeat", heartbeatRoutes);

// API health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "GreenFed-IDS API is running",
        status: "UP"
    });
});

// PostgreSQL health check
app.get("/api/db-health", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT current_database() AS database, NOW() AS server_time"
        );

        res.status(200).json({
            success: true,
            status: "CONNECTED",
            database: result.rows[0].database,
            serverTime: result.rows[0].server_time
        });

    } catch (error) {
        console.error("Database error:", error.message);

        res.status(503).json({
            success: false,
            status: "DISCONNECTED"
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`GreenFed-IDS API running on port ${PORT}`);
});
