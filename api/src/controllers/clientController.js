
const { registerClient } = require("../services/clientService");

const createClient = async (req, res) => {
    try {
        const { displayName, agentMode } = req.body;

        // Validate display name
        if (
            typeof displayName !== "string" ||
            !displayName.trim() ||
            displayName.trim().length > 120
        ) {
            return res.status(400).json({
                success: false,
                message: "Display name is required and must be under 120 characters"
            });
        }

        // Validate agent mode
        const allowedModes = ["real_agent", "simulated_agent"];

        if (!allowedModes.includes(agentMode)) {
            return res.status(400).json({
                success: false,
                message: "Agent mode must be real_agent or simulated_agent"
            });
        }

        const client = await registerClient({
            displayName: displayName.trim(),
            agentMode
        });

        return res.status(201).json({
            success: true,
            message: "Client registered successfully",
            data: client
        });

    } catch (error) {
        console.error("Client registration error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to register client"
        });
    }
};

module.exports = { createClient };
