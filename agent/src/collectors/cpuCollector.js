
const si = require("systeminformation");

const collectCPU = async () => {
    try {
        const cpuLoad = await si.currentLoad();
        const cpuInfo = await si.cpu();

        return {
            cpuPercent: Number(cpuLoad.currentLoad.toFixed(2)),
            cpuModel: cpuInfo.brand,
            cpuCores: cpuInfo.cores,
            source: "measured_client"
        };

    } catch (error) {
        console.error("CPU collection error:", error.message);
        throw error;
    }
};

module.exports = collectCPU;
