
const si = require("systeminformation");

const collectMemory = async () => {
    try {
        const memory = await si.mem();

        return {
            memoryTotalBytes: memory.total,
            memoryUsedBytes: memory.used,
            memoryAvailableBytes: memory.available,
            memoryUsedPercent: Number(
                ((memory.used / memory.total) * 100).toFixed(2)
            ),
            source: "measured_client"
        };

    } catch (error) {
        console.error("Memory collection error:", error.message);
        throw error;
    }
};

module.exports = collectMemory;
