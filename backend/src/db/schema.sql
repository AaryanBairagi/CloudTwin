-- CloudTwin schema

CREATE TABLE IF NOT EXISTS twins (
  twin_id         TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  kind            TEXT NOT NULL DEFAULT 'container',
  status          TEXT NOT NULL DEFAULT 'unknown',
  health_score    INTEGER NOT NULL DEFAULT 100,
  state           JSONB NOT NULL DEFAULT '{}',
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

CREATE TABLE IF NOT EXISTS rules (
    id        SERIAL PRIMARY KEY,
    metric    TEXT NOT NULL,
    operator  TEXT NOT NULL,
    threshold DOUBLE PRECISION NOT NULL,
    severity  TEXT NOT NULL,
    enabled   BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alerts (
    id            BIGSERIAL PRIMARY KEY,
    twin_id       TEXT NOT NULL,
    rule_id       INTEGER REFERENCES rules(id),
    metric        TEXT NOT NULL,
    current_value DOUBLE PRECISION,
    threshold     DOUBLE PRECISION,
    severity      TEXT NOT NULL,
    message       TEXT,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS actions (
    id           BIGSERIAL PRIMARY KEY,
    twin_id      TEXT NOT NULL REFERENCES twins(twin_id) ON DELETE CASCADE,
    alert_id     BIGINT REFERENCES alerts(id) ON DELETE SET NULL,
    action_type  TEXT NOT NULL,
    reason       TEXT,
    status       TEXT NOT NULL DEFAULT 'pending',
    approved_at  TIMESTAMPTZ,
    executed_at  TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_snapshots_twin_time
  ON metric_snapshots (twin_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_actions_twin_status
  ON actions (twin_id, status);