
const random = (min, max) =>
    Math.random() * (max - min) + min;

const generateResource = () => {
    const memoryTotalBytes = 8 * 1024 ** 3;
    const memoryUsedBytes = Math.floor(
        memoryTotalBytes * random(0.2, 0.85)
    );

    return {
        cpuPercent: Number(random(5, 95).toFixed(2)),
        memoryTotalBytes,
        memoryUsedBytes,
        memoryAvailableBytes: memoryTotalBytes - memoryUsedBytes
    };
};

module.exports = generateResource;
