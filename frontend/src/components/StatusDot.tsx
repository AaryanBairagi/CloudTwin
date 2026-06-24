import type { TwinStatus } from "@/types/twin";

const PULSE_CLASS: Record<TwinStatus, string> = {
  healthy: "pulse-healthy",
  warning: "pulse-warning",
  critical: "pulse-critical",
  unknown: "",
};

const DOT_COLOR: Record<TwinStatus, string> = {
  healthy: "bg-status-healthy",
  warning: "bg-status-warning",
  critical: "bg-status-critical",
  unknown: "bg-status-unknown",
};

interface StatusDotProps {
  status: TwinStatus;
}

// The pulse speed itself carries meaning: calm and slow when healthy,
// sharp and fast when critical -- the one place this UI spends motion.
export function StatusDot({ status }: StatusDotProps) {
  return (
    <span className="relative flex h-2 w-2">
      <span
        className={`absolute inline-flex h-full w-full rounded-full ${DOT_COLOR[status]} ${PULSE_CLASS[status]}`}
      />
    </span>
  );
}
