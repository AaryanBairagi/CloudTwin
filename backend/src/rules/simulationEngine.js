// backend/src/rules/simulationEngine.js

const HORIZON_SECONDS = 300;      // Predict 5 minutes ahead
const LOOKBACK_SECONDS = 600;     // Use last 10 minutes of history

const DANGER_CPU = 90;
const DANGER_MEM = 88;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function computeSlope(rows, key) {

    if (!rows || rows.length < 2) {
        return 0;
    }

    const first = rows[0];
    const last = rows[rows.length - 1];

    const firstTime = new Date(first.captured_at).getTime();
    const lastTime = new Date(last.captured_at).getTime();

    const deltaSeconds = (lastTime - firstTime) / 1000;

    if (deltaSeconds <= 0) {
        return 0;
    }

    return (last[key] - first[key]) / deltaSeconds;
}

function secondsToThreshold(current, slope, threshold) {

    if (slope <= 0) {
        return null;
    }

    return (threshold - current) / slope;
}

function recommendation(predictedCPU, predictedMemory) {

    if (predictedCPU >= DANGER_CPU || predictedMemory >= DANGER_MEM) {
        return "ADD_REPLICA";
    }

    if (predictedCPU >= 75 || predictedMemory >= 75) {
        return "MONITOR_CLOSELY";
    }

    return "SAFE";
}

function simulate(history, loadMultiplier = 1) {

    if (!history || history.length === 0) {
        return {
            cpuNow: 0,
            memoryNow: 0,
            cpuPrediction: 0,
            memoryPrediction: 0,
            cpuSlope: 0,
            memorySlope: 0,
            recommendation: "SAFE"
        };
    }

    const cpuSlope = computeSlope(history, "cpu_percent");
    const memorySlope = computeSlope(history, "memory_percent");

    const latest = history[history.length - 1];

    const cpuPrediction = clamp(
        latest.cpu_percent +
        cpuSlope * HORIZON_SECONDS * loadMultiplier,
        0,
        100
    );

    const memoryPrediction = clamp(
        latest.memory_percent +
        memorySlope * HORIZON_SECONDS * loadMultiplier,
        0,
        100
    );

    return {

        cpuNow: latest.cpu_percent,

        memoryNow: latest.memory_percent,

        cpuSlope,

        memorySlope,

        cpuPrediction,

        memoryPrediction,

        secondsToCpuDanger: secondsToThreshold(
            latest.cpu_percent,
            cpuSlope * loadMultiplier,
            DANGER_CPU
        ),

        secondsToMemoryDanger: secondsToThreshold(
            latest.memory_percent,
            memorySlope * loadMultiplier,
            DANGER_MEM
        ),

        recommendation: recommendation(
            cpuPrediction,
            memoryPrediction
        )

    };

}

module.exports = {
    simulate
};