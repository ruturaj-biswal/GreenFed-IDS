
const crypto = require("crypto");
const pool = require("../config/db");

const authenticateAgent = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication token is required"
            });
        }

        const token = authHeader.slice(7).trim();

        if (!token || token.length > 256) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token"
            });
        }

        const tokenHash = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const result = await pool.query(
            `SELECT
                c.client_id,
                c.display_name,
                c.agent_mode
             FROM client_credentials cc
             JOIN clients c ON c.client_id = cc.client_id
             WHERE cc.token_hash = $1
               AND cc.revoked_at IS NULL
               AND (cc.expires_at IS NULL OR cc.expires_at > NOW())
               AND c.enabled = TRUE
             LIMIT 1`,
            [tokenHash]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired authentication token"
            });
        }

        req.client = result.rows[0];

        await pool.query(
            `UPDATE client_credentials
             SET last_used_at = NOW()
             WHERE token_hash = $1`,
            [tokenHash]
        );

        next();

    } catch (error) {
        console.error("Agent authentication error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Authentication service error"
        });
    }
};

module.exports = authenticateAgent;
