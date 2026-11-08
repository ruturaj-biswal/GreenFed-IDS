
const si = require("systeminformation");

const collectDisk = async () => {
    try {
        const disks = await si.fsSize();

        return disks.map((disk) => ({
            filesystem: disk.fs,
            mount: disk.mount,
            totalBytes: disk.size,
            usedBytes: disk.used,
            availableBytes: disk.size - disk.used,
            usedPercent: Number(disk.use.toFixed(2)),
            source: "measured_client"
        }));

    } catch (error) {
        console.error("Disk collection error:", error.message);
        throw error;
    }
};

module.exports = collectDisk;
