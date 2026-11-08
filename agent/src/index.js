
require("dotenv").config();

const collectCPU = require("./collectors/cpuCollector");
const collectMemory = require("./collectors/memoryCollector");
const collectDisk = require("./collectors/diskCollector");
const collectNetwork = require("./collectors/networkCollector");
const sendTelemetry = require("./services/apiService");

const interval = Number(process.env.COLLECTION_INTERVAL_MS || 10000);

const runMonitoring = async () => {
    try {
        console.log("\n========== GREENFED-IDS MONITOR ==========\n");

        const cpu = await collectCPU();
        const memory = await collectMemory();
        const disk = await collectDisk();
        const network = await collectNetwork();

        console.log("CPU:", cpu);
        console.log("MEMORY:", memory);
        console.log("DISK:", disk);
        console.log("NETWORK:", network);

        const telemetry = {
    resource: {
        cpuPercent: cpu.cpuPercent,
        memoryTotalBytes: memory.memoryTotalBytes,
        memoryUsedBytes: memory.memoryUsedBytes,
        memoryAvailableBytes: memory.memoryAvailableBytes
    },
    network: network,
    disk: disk
};

        const result = await sendTelemetry(telemetry);

        console.log("\nBACKEND RESPONSE:");
        console.log(result.message);

    } catch (error) {
        console.error("\nMONITORING ERROR:", error.message);
    }
};

const startMonitoring = async () => {
    console.log("GreenFed-IDS Agent Started");
    console.log(`Collection interval: ${interval} ms`);

    while (true) {
        const startTime = Date.now();

        await runMonitoring();

        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, interval - elapsed);

        await new Promise(resolve => setTimeout(resolve, remainingTime));
    }
};

startMonitoring();
