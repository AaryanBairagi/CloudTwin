interface MetricRowProps {
  label: string;
  value: string;
  warn?: boolean;
}

export function MetricRow({ label, value, warn = false }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-text-tertiary">{label}</span>
      <span
        className={`font-mono text-sm tabular-nums ${
          warn ? "text-status-warning" : "text-text-secondary"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
