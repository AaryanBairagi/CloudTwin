"use client";

import { useState } from "react";
import type { Twin } from "@/types/twin";
import type { SimulationResult } from "@/types/simulation";
import { simulateTwin } from "@/lib/api";

interface WhatIfPanelProps {
  twins: Twin[];
}

function formatSeconds(seconds: number | null): string {
  if (seconds === null || !isFinite(seconds)) return "Never";
  if (seconds <= 0) return "Already at limit";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return mins > 0 ? `~${mins}m ${secs}s` : `~${secs}s`;
}

const REC_STYLE: Record<string, { color: string; bg: string }> = {
  SAFE:           { color: "var(--status-healthy)", bg: "var(--status-healthy-dim)" },
  MONITOR_CLOSELY:{ color: "var(--status-warning)", bg: "var(--status-warning-dim)" },
  ADD_REPLICA:    { color: "var(--status-critical)", bg: "var(--status-critical-dim)" },
};

interface TwinSimResult {
  twin: Twin;
  result: SimulationResult;
}

export function WhatIfPanel({ twins }: WhatIfPanelProps) {
  const [loadMultiplier, setLoadMultiplier] = useState(2);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TwinSimResult[]>([]);
  const [ran, setRan] = useState(false);

  async function handleSimulation() {
    setLoading(true);
    try {
      const settled = await Promise.allSettled(
        twins.map((t) =>
          simulateTwin(t.twin_id, loadMultiplier).then((r) => ({
            twin: t,
            result: r,
          }))
        )
      );

      const successful = settled
        .filter(
          (r): r is PromiseFulfilledResult<TwinSimResult> =>
            r.status === "fulfilled"
        )
        .map((r) => r.value)
        .sort((a, b) => {
          const order = { ADD_REPLICA: 0, MONITOR_CLOSELY: 1, SAFE: 2 };
          return (
            order[a.result.recommendation] - order[b.result.recommendation]
          );
        });

      setResults(successful);
      setRan(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mt-10 border-t border-border-hairline pt-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">
            What if traffic increases?
          </h2>
          <p className="mt-0.5 text-sm text-text-tertiary">
            Projects CPU and memory at the selected load multiplier using the last 10 minutes of history.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-text-tertiary">
              Load multiplier:{" "}
              <span className="font-mono font-medium text-text-primary">
                {loadMultiplier.toFixed(1)}×
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={loadMultiplier}
              onChange={(e) => setLoadMultiplier(Number(e.target.value))}
              className="w-36 accent-[var(--accent-system)]"
            />
          </div>

          <button
            type="button"
            onClick={handleSimulation}
            disabled={loading || twins.length === 0}
            className="rounded-md px-4 py-2 text-sm font-medium text-white transition-opacity disabled:opacity-40"
            style={{ background: "var(--accent-system)" }}
          >
            {loading ? "Simulating…" : ran ? "Re-run" : "Run simulation"}
          </button>
        </div>
      </div>

      {ran && !loading && results.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {results.map(({ twin, result }) => {
            const rec = REC_STYLE[result.recommendation] ?? REC_STYLE.SAFE;
            return (
              <div
                key={twin.twin_id}
                className="rounded-lg border border-border-hairline bg-bg-surface p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">
                      {twin.name}
                    </p>
                    <p className="font-mono text-xs text-text-tertiary">
                      {twin.twin_id}
                    </p>
                  </div>
                  <span
                    className="ml-2 shrink-0 rounded px-2 py-1 text-xs font-medium"
                    style={{ color: rec.color, background: rec.bg }}
                  >
                    {result.recommendation.replace("_", " ")}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">CPU now</span>
                    <span className="font-mono text-text-secondary">
                      {result.cpuNow.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">
                      CPU at {loadMultiplier.toFixed(1)}×
                    </span>
                    <span
                      className="font-mono font-medium"
                      style={{
                        color:
                          result.cpuPrediction >= 90
                            ? "var(--status-critical)"
                            : result.cpuPrediction >= 70
                            ? "var(--status-warning)"
                            : "var(--status-healthy)",
                      }}
                    >
                      {result.cpuPrediction.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Mem now</span>
                    <span className="font-mono text-text-secondary">
                      {result.memoryNow.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">
                      Mem at {loadMultiplier.toFixed(1)}×
                    </span>
                    <span
                      className="font-mono font-medium"
                      style={{
                        color:
                          result.memoryPrediction >= 88
                            ? "var(--status-critical)"
                            : result.memoryPrediction >= 70
                            ? "var(--status-warning)"
                            : "var(--status-healthy)",
                      }}
                    >
                      {result.memoryPrediction.toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2 border-t border-border-hairline pt-2 flex justify-between">
                    <span className="text-text-tertiary">CPU limit in</span>
                    <span className="font-mono text-text-secondary">
                      {formatSeconds(result.secondsToCpuDanger)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Mem limit in</span>
                    <span className="font-mono text-text-secondary">
                      {formatSeconds(result.secondsToMemoryDanger)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {ran && !loading && results.length === 0 && (
        <p className="text-sm text-text-tertiary">
          No results — make sure the agent is running and containers have metric history.
        </p>
      )}
    </section>
  );
}