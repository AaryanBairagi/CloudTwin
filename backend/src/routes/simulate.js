const express = require('express');
const router = express.Router();
const { query } = require('../db/postgres');
const { simulate } = require('../rules/simulationEngine');

// GET /simulate/:twinId?loadMultiplier=2
router.get('/:twinId', async (req, res) => {
    try {
        const { twinId } = req.params;
        const loadMultiplier = Math.min(3, Math.max(0.5, Number(req.query.loadMultiplier) || 2));

        // Fetch the twin's metric history for the last 10 minutes
        const result = await query(
            `SELECT captured_at, cpu_percent, memory_percent
             FROM metric_snapshots
             WHERE twin_id = $1
               AND captured_at >= NOW() - INTERVAL '10 minutes'
             ORDER BY captured_at ASC`,
            [twinId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No metric history found for this twin' });
        }

        const simulationResult = simulate(result.rows, loadMultiplier);

        return res.status(200).json(simulationResult);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error occurred while simulating' });
    }
});

module.exports = router;