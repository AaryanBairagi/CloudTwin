import type { Twin } from "@/types/twin";

interface FleetSummaryProps {
  twins: Twin[];
}

export function FleetSummary({ twins }: FleetSummaryProps) {
  const counts = {
    healthy: twins.filter((t) => t.status === "healthy").length,
    warning: twins.filter((t) => t.status === "warning").length,
    critical: twins.filter((t) => t.status === "critical").length,
  };

  return (
    <div className="flex items-center gap-5">
      <SummaryItem label="Healthy" count={counts.healthy} colorVar="--status-healthy" />
      <SummaryItem label="Warning" count={counts.warning} colorVar="--status-warning" />
      <SummaryItem label="Critical" count={counts.critical} colorVar="--status-critical" />
    </div>
  );
}

function SummaryItem({
  label,
  count,
  colorVar,
}: {
  label: string;
  count: number;
  colorVar: string;
}) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span
        className="font-mono text-lg font-medium tabular-nums"
        style={{ color: `var(${colorVar})` }}
      >
        {count}
      </span>
      <span className="text-xs text-text-tertiary">{label}</span>
    </div>
  );
}
