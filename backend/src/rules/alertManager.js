const { query } = require('../db/postgres');

async function createAlert (snapshot , rule) {
    await query(
        `INSERT INTO alerts
            twin_id,
            rule_id,
            metric,
            current_value,
            threshold,
            severity,
            message
        VALUES ($1 , $2 , $3 , $4 , $5 , $6 , $7)
        `,
        [
            snapshot.containerId,
            rule.id,
            rule.metric,
            rule.metric === 'cpu' ? snapshot.cpuPercent : snapshot.memoryPercent,
            rule.threshold,
            rule.severity,
            `${rule.metric.toUpperCase()} exceeded ${rule.threshold}`
        ]
    );
} 

module.exports = { createAlert };