const express = require('express');
const router = express.Router();
const { simulate } = require('../controllers/simulateController');
const { query } = require('../db/postgres');

router.post('/' , async(req , res) => {
    try{
        const { twinId , loadMultiplier = 1 } = req.body;
        if(!twinId){
            return res.status(400).json({ message: 'twinId is required' });
        }

        const result = await query(`
            SELECT captured_at , memory_percent , cpu_percent
            FROM metric_snapshots 
            WHERE twin_id = $1
            AND captured_at >= NOW() - INTERVAL '10 minutes'
            ORDER BY captured_at ASC
            `, [twinId]);

        const simulationResult = simulate(result.rows, loadMultiplier);

        return res.status(200).json(simulationResult);
    }catch(err){
        console.error(err);
        res.status(500).json({ message: 'Error occurred while simulating' });
    }
});
module.exports = router;