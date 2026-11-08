
const registerClient = async (apiUrl, displayName) => {
    const response = await fetch(`${apiUrl}/api/clients`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            displayName,
            agentMode: "simulated_agent"
        })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        throw new Error(result.message || "Client registration failed");
    }

    // Your backend returns the client directly inside result.data
    const client = result.data;

    if (!client?.client_id || !client?.clientToken) {
        throw new Error("Client ID or authentication token missing");
    }

    return {
        clientId: client.client_id,
        displayName: client.display_name,
        token: client.clientToken
    };
};

module.exports = registerClient;
