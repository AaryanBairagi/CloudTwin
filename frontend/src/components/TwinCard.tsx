"use client";

import { useEffect, useState } from "react";
import type { Twin } from "@/types/twin";
import { HealthGauge } from "./HealthGauge";
import { StatusDot } from "./StatusDot";
import { MetricRow } from "./MetricRow";
import { timeAgo } from "@/lib/timeAgo";

interface TwinCardProps {
  twin: Twin;
}

const STATUS_LABEL: Record<Twin["status"], string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical",
  unknown: "Unknown",
};

export function TwinCard({ twin }: TwinCardProps) {
  // Re-render every few seconds purely so the "Xs ago" label stays live
  // without needing a fresh fetch -- cosmetic, not a data refresh.
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick((n) => n + 1), 3000);
    return () => clearInterval(id);
  }, []);

  const snapshot = twin.state;

  return (
    <div className="rounded-lg border border-border-hairline bg-bg-surface p-4 transition-colors hover:border-[var(--accent-system)]/40">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <StatusDot status={twin.status} />
            <h3 className="truncate text-sm font-medium text-text-primary">
              {twin.name}
            </h3>
          </div>
          <p className="mt-0.5 font-mono text-xs text-text-tertiary">
            {twin.twin_id}
          </p>
        </div>
        <HealthGauge score={twin.health_score} status={twin.status} />
      </div>

      <div className="mt-3 border-t border-border-hairline pt-2">
        <MetricRow
          label="CPU"
          value={`${snapshot?.cpuPercent?.toFixed(1) ?? "—"}%`}
          warn={(snapshot?.cpuPercent ?? 0) > 80}
        />
        <MetricRow
          label="Memory"
          value={`${snapshot?.memoryMB?.toFixed(0) ?? "—"} MB`}
          warn={(snapshot?.memoryPercent ?? 0) > 80}
        />
        <MetricRow label="State" value={snapshot?.state ?? "—"} />
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-text-tertiary">
          {STATUS_LABEL[twin.status]}
        </span>
        <span className="text-xs text-text-tertiary">
          {timeAgo(twin.last_seen_at)}
        </span>
      </div>
    </div>
  );
}
