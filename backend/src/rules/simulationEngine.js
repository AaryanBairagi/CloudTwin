const HORIZON_SECONDS = 300;
const DANGER_CPU = 90;
const DANGER_MEM = 88;
const LOOKBACK_SECONDS = 600;

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
