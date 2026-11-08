
const sendTelemetry = async (apiUrl, token, telemetry) => {
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
        throw new Error(result.message || `API error ${response.status}`);
    }

    return result;
};

module.exports = sendTelemetry;
