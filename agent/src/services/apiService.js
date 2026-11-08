
const sendTelemetry = async (telemetry) => {
    const apiUrl = process.env.API_URL;
    const token = process.env.AGENT_TOKEN;

    if (!apiUrl || !token) {
        throw new Error("API_URL or AGENT_TOKEN is missing in .env");
    }

    const response = await fetch(`${apiUrl}/api/telemetry`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(telemetry)
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message || `API error: ${response.status}`);
    }

    return result;
};

module.exports = sendTelemetry;
