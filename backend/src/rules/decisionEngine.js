const { query } = require('../db/postgres');

const COOLDOWN_MINUTES = 10;

async function hasRecentAction(twinId) {
    const result = await query(
        `SELECT id FROM actions
         WHERE twin_id = $1
           AND created_at >= now() - interval '1 minute' * $2
           AND status NOT IN ('rejected', 'failed', 'completed')
         LIMIT 1`,
        [twinId, COOLDOWN_MINUTES]
    );
    return result.rows.length > 0;
}

async function proposeRestart(snapshot, alertId, reason) {
    const twinId = snapshot.containerId;

    if (await hasRecentAction(twinId)) {
        console.log(`[decision] skipping proposal for ${snapshot.name} -- cooldown active`);
        return null;
    }

    const result = await query(
        `INSERT INTO actions (
            twin_id,
            alert_id,
            action_type,
            reason,
            status
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id`,
        [
            twinId,
            alertId,
            'restart',
            reason,
            'pending'
        ]
    );

    console.log(`[decision] proposed restart for ${snapshot.name}: ${reason}`);
    return result.rows[0];
}

module.exports = { proposeRestart };