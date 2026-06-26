const express = require('express');
const router = express.Router();
const { query } = require('../db/postgres');

router.get("/" , async(req,res) => {

    try{
        const result = await query(
            `
            SELECT *
            FROM alerts
            ORDER BY created_at DESC
            `
        );

        res.status(200).json(result.rows);
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Failed to fetch alerts."
        });
    }
});

router.get("/active" , async(req,res) => {

    try{
        const result = await query(
            `
            SELECT *
            FROM alerts
            ORDER BY created_at DESC
            LIMIT 20
            `
        );

        res.status(200).json(result.rows);
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Failed to fetch active alerts."
        });
    }
});

router.get("/:id" , async(req,res) => {

    try{
        const result = await query(
            `
            SELECT *
            FROM alerts
            WHERE id = $1
            `,
            [req.params.id]
        );

        if(result.rows.length === 0) return res.status(404).json({ error : "Alert Not Found." });

        res.status(200).json(result.rows);
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            error : "Failed to fetch alerts."
        });
    }
});

module.exports = router;