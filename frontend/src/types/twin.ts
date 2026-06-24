// Mirrors the row shape returned by `SELECT * FROM twins` in routes/twins.js.
// Keep this in sync with backend/src/db/schema.sql.

export type TwinStatus = "healthy" | "warning" | "critical" | "unknown";

export interface Snapshot {
  containerId: string;
  name: string;
  state: string;
  cpuPercent: number;
  memoryMB: number;
  memoryLimitMB: number;
  memoryPercent: number;
  timestamp: string;
}

export interface Twin {
  twin_id: string;
  name: string;
  kind: string;
  status: TwinStatus;
  health_score: number;
  state: Snapshot;
  first_seen_at: string;
  last_seen_at: string;
  updated_at: string;
}

export interface HistoryPoint {
  captured_at: string;
  cpu_percent: number;
  memory_percent: number;
  memory_mb: number;
}
