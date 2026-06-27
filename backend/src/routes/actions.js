const express = require('express');
const router = express.Router();
const { query } = require("../db/postgres");

router.get("/" , async(req,res) => {
    try{
        const result = await query(
            `
            SELECT *
            FROM actions
            ORDER_BY created_at DESC
            `
        );

        res.status(200).json(result.rows);
    }catch(err){
        console.error(err);
        res.status(500).json({ error : "Failed to fetch Actions." });
    }
});



module.exports = router