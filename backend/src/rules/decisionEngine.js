const { query } = require("../db/postgres");

async function proposeRestart(snapshot,alertId,reason){
    await query(`
        INSERT INTO actions(
            twin_id,
            alert_id,
            action_type,
            reason,
            status
        )
        VALUES ($1,$2,$3,$4)
        `,
        [
            snapshot.containerId,
            alertId,
            "restart",
            reason,
            "pending"
        ]
    )
}

module.exports = { proposeRestart }