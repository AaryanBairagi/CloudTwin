-- CloudTwin Phase 2 schema
-- Single-tenant for now (no workspace_id yet -- that comes with the SaaS phase)

CREATE TABLE IF NOT EXISTS twins (
  twin_id         TEXT PRIMARY KEY,        -- container short ID, e.g. "a1b2c3d4e5f6"
  name            TEXT NOT NULL,
  kind            TEXT NOT NULL DEFAULT 'container',
  status          TEXT NOT NULL DEFAULT 'unknown',   -- healthy | warning | critical | unknown
  health_score    INTEGER NOT NULL DEFAULT 100,      -- 0-100
  state           JSONB NOT NULL DEFAULT '{}',       -- latest raw snapshot
  first_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS metric_snapshots (
  id              BIGSERIAL PRIMARY KEY,
  twin_id         TEXT NOT NULL REFERENCES twins(twin_id) ON DELETE CASCADE,
  captured_at     TIMESTAMPTZ NOT NULL,
  cpu_percent     DOUBLE PRECISION,
  memory_percent  DOUBLE PRECISION,
  memory_mb       DOUBLE PRECISION,
  payload         JSONB NOT NULL
);

-- Most twin lookups + dashboard load want "all twins, most recent state" --
-- that's just the twins table. Snapshots are for history/sparklines/what-if later.
CREATE INDEX IF NOT EXISTS idx_snapshots_twin_time
  ON metric_snapshots (twin_id, captured_at DESC);
