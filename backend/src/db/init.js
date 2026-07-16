const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');
const { pool } = require('./postgres');

async function init() {
    const filePath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(filePath, 'utf-8');

    await pool.query(sql);
    console.log('[db] schema applied');

    // Seed default rules so the pipeline actually triggers out of the box.
    // WHERE NOT EXISTS makes this safe to re-run without duplicating rows.
    
    await pool.query(`
        INSERT INTO rules (metric, operator, threshold, severity, enabled)
        SELECT 'cpu', '>', 90, 'critical', true
        WHERE NOT EXISTS (
            SELECT 1 FROM rules WHERE metric = 'cpu' AND threshold = 90
        )
    `);

    await pool.query(`
        INSERT INTO rules (metric, operator, threshold, severity, enabled)
        SELECT 'memory', '>', 85, 'warning', true
        WHERE NOT EXISTS (
            SELECT 1 FROM rules WHERE metric = 'memory' AND threshold = 85
        )
    `);

    await pool.query(`
        INSERT INTO rules (metric, operator, threshold, severity, enabled)
        SELECT 'cpu', '>', 75, 'warning', true
        WHERE NOT EXISTS (
            SELECT 1 FROM rules WHERE metric = 'cpu' AND threshold = 75
        )
    `);

    console.log('[db] default rules seeded');
    await pool.end();
}

init().catch((err) => {
    console.error('[db] failed to apply schema:', err);
    process.exit(1);
});