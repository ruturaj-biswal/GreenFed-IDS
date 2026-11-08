
const generateDisk = () => {
    const totalBytes = 500 * 1024 ** 3;
    const usedPercent = Number(
        (30 + Math.random() * 55).toFixed(2)
    );

    const usedBytes = Math.floor(totalBytes * usedPercent / 100);
    const availableBytes = totalBytes - usedBytes;

    return [{
        filesystem: "SIMULATED",
        mount: "/simulated",
        totalBytes,
        usedBytes,
        availableBytes,
        usedPercent
    }];
};

module.exports = generateDisk;
