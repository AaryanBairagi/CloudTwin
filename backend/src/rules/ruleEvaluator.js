const { query } = require("../db/postgres");

async function getEnabledRules() {
    const result = await query(`
        SELECT *
        FROM rules
        WHERE enabled = TRUE
    `);

    return result.rows;
}

function evaluateRule(snapshot, rule) {

    let value;

    if (rule.metric === "cpu") {
        value = snapshot.cpuPercent;
    }
    else if (rule.metric === "memory") {
        value = snapshot.memoryPercent;
    }
    else {
        return false;
    }

    switch (rule.operator) {

        case ">":
            return value > rule.threshold;

        case ">=":
            return value >= rule.threshold;

        case "<":
            return value < rule.threshold;

        case "<=":
            return value <= rule.threshold;

        case "==":
            return value === rule.threshold;

        default:
            return false;
    }
}

module.exports = {
    evaluateRule,
    getEnabledRules
};