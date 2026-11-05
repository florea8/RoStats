-- RoStats PostgreSQL schema.
-- Apply with: psql "$DATABASE_URL" -f server/db/schema.sql
-- Safe to re-run: every statement is idempotent.

CREATE TABLE IF NOT EXISTS earthquakes (
  id           TEXT PRIMARY KEY,          -- EMSC event id
  magnitude    NUMERIC(3,1) NOT NULL,
  place        TEXT,
  depth_km     INTEGER,
  lat          DOUBLE PRECISION NOT NULL,
  lng          DOUBLE PRECISION NOT NULL,
  occurred_at  TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS earthquakes_occurred_at_idx
  ON earthquakes (occurred_at DESC);

CREATE TABLE IF NOT EXISTS aqi_readings (
  id           BIGSERIAL PRIMARY KEY,
  city_id      TEXT NOT NULL,
  city_name    TEXT NOT NULL,
  aqi_value    INTEGER NOT NULL,          -- US AQI (Open-Meteo / CAMS)
  recorded_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS aqi_readings_city_time_idx
  ON aqi_readings (city_id, recorded_at DESC);
