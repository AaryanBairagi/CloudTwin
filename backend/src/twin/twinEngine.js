const { query } = require('../db/postgres');

function calculateHealthScore(snapshot){
    let score = 100;
    score -= snapshot.cpuPercent * 0.5;
    score -= snapshot.memoryPercent * 0.3;

    return Math.max(0, Math.round(score));
}


function getStatus(health){
    if(health>=80) return 'healthy';
    else if(health>=50) return 'warning';
    return 'critical';
}

async function upsertTwin(snapshot){
    const healthScore = calculateHealthScore(snapshot);
    const status = getStatus(healthScore);

    await query(
        `INSERT INTO twins(
            twin_id,
            name,
            status,
            health_score,
            state,
            last_seen_at,
            updated_at
        )
         VALUES ($1,$2,$3,$4,$5,NOW(),NOW())
         ON CONFLICT (twin_id)
         DO UPDATE SET
            name = EXCLUDED.name,
            status = EXCLUDED.status, 
            health_score = EXCLUDED.health_score,
            state = EXCLUDED.state,
            last_seen_at = NOW(),
            updated_at = NOW()
        `
    ,[
        snapshot.containerId,
        snapshot.name,
        status,
        healthScore,
        snapshot
    ]);
}

async function saveSnapshot(snapshot){
    await query(
        `INSERT INTO metric_snapshots(
            twin_id,
            captured_at,
            cpu_percent,
            memory_percent,
            memory_mb,
            payload
        )
        VALUES ($1,$2,$3,$4,$5,$6)`
    ,[
        snapshot.containerId,
        snapshot.timestamp,
        snapshot.cpuPercent,
        snapshot.memoryPercent,
        snapshot.memoryMB,
        snapshot
    ]);
}
module.exports = { upsertTwin , saveSnapshot , calculateHealthScore , getStatus }