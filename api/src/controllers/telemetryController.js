
const { saveTelemetry } = require("../services/telemetryService");

const receiveTelemetry = async (req, res) => {
    try {
        const {
            resource,
            network = [],
            disk = []
        } = req.body;

        const validNumber = (value) =>
            typeof value === "number" && Number.isFinite(value);

        // Validate CPU and RAM
        if (
            !resource ||
            typeof resource !== "object" ||
            Array.isArray(resource)
        ) {
            return res.status(400).json({
                success: false,
                message: "Resource data is required"
            });
        }

        const {
            cpuPercent,
            memoryTotalBytes,
            memoryUsedBytes,
            memoryAvailableBytes
        } = resource;

        if (
            !validNumber(cpuPercent) ||
            cpuPercent < 0 ||
            cpuPercent > 100 ||
            !validNumber(memoryTotalBytes) ||
            !validNumber(memoryUsedBytes) ||
            !validNumber(memoryAvailableBytes) ||
            memoryTotalBytes < 0 ||
            memoryUsedBytes < 0 ||
            memoryAvailableBytes < 0 ||
            memoryUsedBytes + memoryAvailableBytes > memoryTotalBytes + 1
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid CPU or memory measurements"
            });
        }

        // Validate network measurements
        if (!Array.isArray(network)) {
            return res.status(400).json({
                success: false,
                message: "Network data must be an array"
            });
        }

        for (const item of network) {
            if (
                !item ||
                typeof item !== "object" ||
                typeof item.interface !== "string" ||
                item.interface.length > 100 ||
                !validNumber(item.transferBytes) ||
                !validNumber(item.durationMs) ||
                !validNumber(item.bandwidthMbps) ||
                item.transferBytes < 0 ||
                item.durationMs <= 0 ||
                item.bandwidthMbps < 0
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid network measurements"
                });
            }
        }

        // Validate disk measurements
        if (!Array.isArray(disk)) {
            return res.status(400).json({
                success: false,
                message: "Disk data must be an array"
            });
        }

        for (const item of disk) {
            if (
                !item ||
                typeof item !== "object" ||
                (item.filesystem !== undefined &&
                    item.filesystem !== null &&
                    typeof item.filesystem !== "string") ||
                (item.mount !== undefined &&
                    item.mount !== null &&
                    typeof item.mount !== "string") ||
                !validNumber(item.totalBytes) ||
                !validNumber(item.usedBytes) ||
                !validNumber(item.availableBytes) ||
                !validNumber(item.usedPercent) ||
                item.totalBytes < 0 ||
                item.usedBytes < 0 ||
                item.availableBytes < 0 ||
                item.usedPercent < 0 ||
                item.usedPercent > 100 ||
                item.usedBytes + item.availableBytes > item.totalBytes + 1
            ) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid disk measurements"
                });
            }
        }

        // Save all measurements
        await saveTelemetry(req.client.client_id, req.client.agent_mode, {
            resource: {
                cpuPercent,
                memoryTotalBytes,
                memoryUsedBytes,
                memoryAvailableBytes
            },
            network,
            disk
        });

        return res.status(201).json({
            success: true,
            message: "CPU, RAM, disk and network telemetry saved successfully"
        });

    } catch (error) {
        console.error("Telemetry error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to save telemetry"
        });
    }
};

module.exports = { receiveTelemetry };
