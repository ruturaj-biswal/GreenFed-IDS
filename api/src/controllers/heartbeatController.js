
const pool = require("../config/db");

const receiveHeartbeat = async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE clients
             SET last_seen_at = NOW(),
                 updated_at = NOW()
             WHERE client_id = $1
               AND enabled = TRUE
             RETURNING client_id, display_name, agent_mode, last_seen_at`,
            [req.client.client_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Client not found or disabled"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Heartbeat received successfully",
            data: result.rows[0]
        });

    } catch (error) {
        console.error("Heartbeat error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to process heartbeat"
        });
    }
};

module.exports = { receiveHeartbeat };
