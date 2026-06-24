import type { TwinStatus } from "@/types/twin";

const STATUS_COLOR: Record<TwinStatus, string> = {
  healthy: "var(--status-healthy)",
  warning: "var(--status-warning)",
  critical: "var(--status-critical)",
  unknown: "var(--status-unknown)",
};

interface HealthGaugeProps {
  score: number;
  status: TwinStatus;
  size?: number;
}

// An arc, not a bar -- progress bars read as "loading," an arc reads as
// "a measurement," which is closer to what a health score actually is.
export function HealthGauge({ score, status, size = 72 }: HealthGaugeProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // 270 degree sweep, leaving a 90 degree gap at the bottom -- a full
  // circle reads as a clock, this reads as an instrument.
  const sweepFraction = 0.75;
  const arcLength = circumference * sweepFraction;
  const filledLength = arcLength * (score / 100);

  const color = STATUS_COLOR[status];

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-[225deg]"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border-hairline)"
          strokeWidth={strokeWidth}
          strokeDasharray={`${arcLength} ${circumference}`}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${filledLength} ${circumference}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-lg font-medium tabular-nums" style={{ color }}>
          {score}
        </span>
      </div>
    </div>
  );
}
