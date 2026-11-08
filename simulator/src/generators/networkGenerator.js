
const generateNetwork = () => {
    const durationMs = 10000;
    const bandwidthMbps = Number(
        (1 + Math.random() * 99).toFixed(2)
    );

    const transferBytes = Math.floor(
        bandwidthMbps * 1000000 * durationMs / 8000
    );

    return [{
        interface: "SIMULATED-NETWORK",
        transferBytes,
        durationMs,
        bandwidthMbps
    }];
};

module.exports = generateNetwork;
