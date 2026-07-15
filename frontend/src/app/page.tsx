"use client";

import { useTwins } from "@/lib/useTwins";
import { TwinCard } from "@/components/TwinCard";
import { FleetSummary } from "@/components/FleetSummary";
import { WhatIfPanel } from "@/components/WhatIfPanel";
import { timeAgo } from "@/lib/timeAgo";

export default function DashboardPage() {
  const { twins, loading, error, lastUpdatedAt } = useTwins();

  return (
    <main className="flex-1 px-6 py-8 md:px-10">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-border-hairline pb-6">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">CloudTwin</h1>
          <p className="mt-1 text-sm text-text-tertiary">
            Live digital twins for containerized infrastructure
          </p>
        </div>
        <FleetSummary twins={twins} />
      </header>

      {error && (
        <div className="mb-6 rounded-md border border-status-critical/30 bg-[var(--status-critical-dim)] px-4 py-3 text-sm text-status-critical">
          Couldn&apos;t reach the backend. Is it running on{" "}
          <code className="font-mono">localhost:4000</code>?
        </div>
      )}

      {loading && !error && (
        <p className="text-sm text-text-tertiary">Loading twins…</p>
      )}

      {!loading && !error && twins.length === 0 && (
        <div className="rounded-lg border border-dashed border-border-hairline px-6 py-12 text-center">
          <p className="text-sm text-text-secondary">No twins yet.</p>
          <p className="mt-1 text-xs text-text-tertiary">
            Start the agent against a running Docker host to see twins appear here.
          </p>
        </div>
      )}

      {twins.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {twins.map((twin) => (
            <TwinCard key={twin.twin_id} twin={twin} />
          ))}
        </div>
      )}

      <WhatIfPanel twins={twins} />

      {lastUpdatedAt && (
        <p className="mt-8 text-xs text-text-tertiary">
          Last updated {timeAgo(lastUpdatedAt.toISOString())}
        </p>
      )}
    </main>
  );
}