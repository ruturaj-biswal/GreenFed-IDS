
const crypto = require("crypto");
const pool = require("../config/db");

const registerClient = async ({ displayName, agentMode }) => {
    const clientToken = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto
        .createHash("sha256")
        .update(clientToken)
        .digest("hex");

    const dbClient = await pool.connect();

    try {
        await dbClient.query("BEGIN");

        const clientResult = await dbClient.query(
            `INSERT INTO clients (display_name, agent_mode)
             VALUES ($1, $2)
             RETURNING client_id, display_name, agent_mode, enabled, created_at`,
            [displayName, agentMode]
        );

        const client = clientResult.rows[0];

        await dbClient.query(
            `INSERT INTO client_credentials (client_id, token_hash)
             VALUES ($1, $2)`,
            [client.client_id, tokenHash]
        );

        await dbClient.query("COMMIT");

        return {
            ...client,
            clientToken
        };

    } catch (error) {
        await dbClient.query("ROLLBACK");
        throw error;
    } finally {
        dbClient.release();
    }
};

module.exports = { registerClient };
