const express = require("express");
const router = express.Router();

const { dequeueCommand } = require("../db/redis");
const { query } = require("../db/postgres");

router.get("/claim", async (req, res) => {

    try {

        const twinId = req.query.twinId;

        if (!twinId) {
            return res.status(400).json({
                error: "Missing twinId"
            });
        }

        const command = await dequeueCommand(twinId);

        if (!command) {
            return res.status(204).send();
        }

        await query(
            `
            UPDATE actions
            SET status = 'executing',
                executed_at = NOW()
            WHERE id = $1
            `,
            [command.id]
        );

        res.json(command);

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to claim command"
        });

    }

});

router.post("/:id/ack", async (req, res) => {

    try {

        const { success } = req.body;

        const status = success ? "completed" : "failed";
        const now = success ? "completed_at = NOW()," : "";

        const result = await query(
            `
            UPDATE actions
            SET
                ${now}
                status = $1
            WHERE id = $2
            RETURNING *
            `,
            [status, req.params.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                error: "Action not found"
            });
        }

        res.json({
            message: "Acknowledged",
            action: result.rows[0]
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            error: "Failed to acknowledge command"
        });

    }

});