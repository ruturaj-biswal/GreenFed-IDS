
const pool = require("../config/db");

const saveTelemetry = async (clientId, agentMode, telemetry) => {
    const dbClient = await pool.connect();

    // Determine data source using the authenticated database record.
    const isSimulated = agentMode === "simulated_agent";

    const resourceSource = isSimulated ? "simulated" : "measured_client";
    const networkSource = isSimulated ? "simulated" : "measured_network";
    const diskSource = isSimulated ? "simulated" : "measured_client";

    try {
        await dbClient.query("BEGIN");

        // 1. Save CPU and RAM
        const resource = telemetry.resource;

        await dbClient.query(
            `INSERT INTO resource_samples (
                client_id, observed_at, cpu_percent,
                memory_total_bytes, memory_used_bytes,
                memory_available_bytes, source, collection_version
            )
            VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7)`,
            [
                clientId,
                resource.cpuPercent,
                resource.memoryTotalBytes,
                resource.memoryUsedBytes,
                resource.memoryAvailableBytes,
                resourceSource,
                "1.0.0"
            ]
        );

        // 2. Save network measurements
        const networks = Array.isArray(telemetry.network)
            ? telemetry.network
            : [];

        for (const network of networks) {
            const valid =
                Number.isFinite(network.transferBytes) &&
                Number.isFinite(network.durationMs) &&
                Number.isFinite(network.bandwidthMbps) &&
                network.transferBytes >= 0 &&
                network.durationMs > 0 &&
                network.bandwidthMbps >= 0;

            if (!valid) continue;

            await dbClient.query(
                `INSERT INTO network_samples (
                    client_id, observed_at, transfer_bytes,
                    duration_ms, bandwidth_mbps, source, method
                )
                VALUES ($1, NOW(), $2, $3, $4, $5, $6)`,
                [
                    clientId,
                    network.transferBytes,
                    network.durationMs,
                    network.bandwidthMbps,
                    networkSource,
                    `interface_counters:${network.interface || "unknown"}`
                ]
            );
        }

        // 3. Save disk measurements
        const disks = Array.isArray(telemetry.disk)
            ? telemetry.disk
            : [];

        for (const disk of disks) {
            const valid =
                Number.isFinite(disk.totalBytes) &&
                Number.isFinite(disk.usedBytes) &&
                Number.isFinite(disk.availableBytes) &&
                Number.isFinite(disk.usedPercent) &&
                disk.totalBytes >= 0 &&
                disk.usedBytes >= 0 &&
                disk.availableBytes >= 0 &&
                disk.usedPercent >= 0 &&
                disk.usedPercent <= 100 &&
                disk.usedBytes + disk.availableBytes <= disk.totalBytes + 1;

            if (!valid) continue;

            await dbClient.query(
                `INSERT INTO disk_samples (
                    client_id, observed_at, filesystem, mount,
                    total_bytes, used_bytes, available_bytes,
                    used_percent, source, collection_version
                )
                VALUES ($1, NOW(), $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                    clientId,
                    disk.filesystem || null,
                    disk.mount || null,
                    disk.totalBytes,
                    disk.usedBytes,
                    disk.availableBytes,
                    disk.usedPercent,
                    diskSource,
                    "1.0.0"
                ]
            );
        }

        await dbClient.query("COMMIT");

        return {
            message: "CPU, RAM, disk and network telemetry saved successfully",
            source: isSimulated ? "simulated" : "measured"
        };

    } catch (error) {
        await dbClient.query("ROLLBACK");
        throw error;
    } finally {
        dbClient.release();
    }
};

module.exports = { saveTelemetry };
