const express = require('express');
const router = express.Router();
const { query } = require('../db/postgres'); 

router.get('/' , async(req , res) => {
    try{
        const data = await query(`
                SELECT *
                FROM twins
                ORDER BY updated_at DESC
            `);
        
        res.status(200).json(data.rows);
    }
    catch(error){
        console.error("Error Querying the Database");
        res.status(500).json({
            error : "Failed to fetch twins"
        });
    }
});


router.get('/:id' , async(req,res) => {
    try{
        const result = await query(`
                SELECT * 
                FROM twins
                WHERE twin_id = $1
            `, [req.params.id]);
        
        if(result.rows.length === 0){
            return res.status(404).json({
                error : "Twin data not found."
            });
        }

//NOTE : $1 will be replaced by the arrays index 1 
//  Node Postgres (pg) sees:

// query(
//     "SELECT * FROM twins WHERE twin_id = $1",
//     ["e1873f1f7ef6"]
// )

// and converts it internally into:

// SELECT *
// FROM twins
// WHERE twin_id = 'e1873f1f7ef6';

        res.status(200).json(result.rows[0]);
    }catch(err){
        console.error(err);
        res.status(500).json({error : "Failed to fetch twins data."});
    }
});


router.get('/:id/history', async (req, res) => {
    try {

        const result = await query(
            `
            SELECT
                captured_at,
                cpu_percent,
                memory_percent,
                memory_mb
            FROM metric_snapshots
            WHERE twin_id = $1
            ORDER BY captured_at DESC
            LIMIT 100
            `,
            [req.params.id]
        );

        res.json(result.rows);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: 'Failed to fetch history'
        });
    }
});

module.exports = router;