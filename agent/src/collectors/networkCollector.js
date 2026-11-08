
const si = require("systeminformation");

const previousStats = new Map();

const collectNetwork = async () => {
    try {
        const stats = await si.networkStats();
        const now = Date.now();
        const measurements = [];

        for (const network of stats) {
            const iface = network.iface;

            // Skip interfaces without valid counters
            if (
                typeof network.rx_bytes !== "number" ||
                typeof network.tx_bytes !== "number"
            ) {
                continue;
            }

            const current = {
                rxBytes: network.rx_bytes,
                txBytes: network.tx_bytes,
                timestamp: now
            };

            const previous = previousStats.get(iface);

            // Store first reading as baseline
            previousStats.set(iface, current);

            if (!previous) continue;

            const durationMs = now - previous.timestamp;
            const received = current.rxBytes - previous.rxBytes;
            const transmitted = current.txBytes - previous.txBytes;

            // Ignore counter resets or invalid intervals
            if (
                durationMs <= 0 ||
                received < 0 ||
                transmitted < 0
            ) {
                continue;
            }

            const transferBytes = received + transmitted;

            const bandwidthMbps =
                (transferBytes * 8) / durationMs / 1000;

            measurements.push({
                interface: iface,
                transferBytes,
                durationMs,
                bandwidthMbps: Number(bandwidthMbps.toFixed(4)),
                source: "measured_network"
            });
        }

        return measurements;

    } catch (error) {
        console.error("Network collection error:", error.message);
        throw error;
    }
};

module.exports = collectNetwork;
