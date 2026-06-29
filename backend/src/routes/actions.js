const express = require('express');
const router = express.Router();
const { query } = require("../db/postgres");
const { enqueueCommand } = require("../db/redis");

router.get("/" , async(req,res) => {
    try{
        const result = await query(
            `
            SELECT *
            FROM actions
            ORDER BY created_at DESC
            `
        );

        res.status(200).json(result.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({ error : "Failed to fetch Actions." });
    }
});

router.post("/:id/approve" , async(req,res) => {
    try{
        const result = await query(`
            UPDATE actions
            SET status = 'approved',
                approved_at = NOW()
            WHERE id = $1
            RETURNING *
            `,
        [req.params.id]); //returning * means return the updated row 

        if(result.rows.length === 0) return res.status(404).json({message : "Action Not Found"});

        const action = result.rows[0];
        await enqueueCommand(action.twin_id , action);
        return res.status(200).json({message : "Action approved" , action});
        
    }catch(err){
        console.error(err);
        return res.status(500).json({error : "Error approving the request."});
    }
});

router.post("/:id/reject" , async(req,res) => {
    try{
        const result = await query(`
            UPDATE actions
            SET status = 'rejected' 
            WHERE id = $1
            RETURNING *
            `, [req.params.id]);
        
        if(result.rows.length === 0) return res.status(404).json({message : "Action Not Found."});
        const action = result.rows[0];
        return res.status(200).json({message : "Action Rejected." , action});

    }catch(err){
        console.error(err);
        return res.status(500).json({error : "Error rejecting the request."});
    }
});

module.exports = router