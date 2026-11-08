
require("dotenv").config();

const registerClient = require("./registerClient");
const generateResource = require("./generators/resourceGenerator");
const generateDisk = require("./generators/diskGenerator");
const generateNetwork = require("./generators/networkGenerator");
const sendTelemetry = require("./services/apiService");

const API_URL = process.env.API_URL;
const CLIENT_COUNT = Number(process.env.SIMULATOR_CLIENT_COUNT || 5);
const INTERVAL = Number(process.env.COLLECTION_INTERVAL_MS || 10000);

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function runSimulator() {
    if (!API_URL) {
        throw new Error("API_URL is missing in .env");
    }

    if (!Number.isInteger(CLIENT_COUNT) || CLIENT_COUNT < 1 || CLIENT_COUNT > 50) {
        throw new Error("Client count must be between 1 and 50");
    }

    if (!Number.isFinite(INTERVAL) || INTERVAL < 1000) {
        throw new Error("Collection interval must be at least 1000 ms");
    }

    console.log("Registering simulated clients...");

    const clients = [];

    for (let i = 1; i <= CLIENT_COUNT; i++) {
        const client = await registerClient(
            API_URL,
            `Simulated Client ${i}`
        );

        clients.push(client);

        console.log(
            `Registered ${client.displayName}: ${client.clientId}`
        );
    }

    console.log(`\n${clients.length} simulated clients registered.`);
    console.log("Starting telemetry generation...\n");

    while (true) {
        await Promise.allSettled(
            clients.map(async client => {
                const telemetry = {
                    resource: generateResource(),
                    disk: generateDisk(),
                    network: generateNetwork()
                };

                try {
                    await sendTelemetry(
                        API_URL,
                        client.token,
                        telemetry
                    );

                    console.log(
                        `[SIMULATED] ${client.displayName}: telemetry saved`
                    );
                } catch (error) {
                    console.error(
                        `[ERROR] ${client.displayName}: ${error.message}`
                    );
                }
            })
        );

        await sleep(INTERVAL);
    }
}

runSimulator().catch(error => {
    console.error("Simulator startup failed:", error.message);
    process.exitCode = 1;
});
