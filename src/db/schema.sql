-- LienLens Database Schema

CREATE TABLE IF NOT EXISTS counties (
  fips                    VARCHAR(5) PRIMARY KEY,
  name                    TEXT NOT NULL,
  state                   CHAR(2) NOT NULL,
  adapter_name            TEXT,
  has_tax_data            BOOLEAN NOT NULL DEFAULT FALSE,
  has_preforeclosure_data BOOLEAN NOT NULL DEFAULT FALSE,
  has_code_violation_data BOOLEAN NOT NULL DEFAULT FALSE,
  update_frequency        TEXT NOT NULL DEFAULT 'weekly',
  last_ingested_at        TIMESTAMPTZ,
  record_count            INTEGER NOT NULL DEFAULT 0,
  status                  TEXT NOT NULL DEFAULT 'active',
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS properties (
  id                SERIAL PRIMARY KEY,
  parcel_id         TEXT NOT NULL,
  raw_parcel_id     TEXT,
  county_fips       VARCHAR(5) NOT NULL REFERENCES counties(fips),
  address_normalized TEXT,
  address_raw       TEXT,
  owner_name        TEXT,
  property_type     TEXT NOT NULL DEFAULT 'residential',
  latitude          DOUBLE PRECISION,
  longitude         DOUBLE PRECISION,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parcel_id, county_fips)
);

CREATE INDEX IF NOT EXISTS idx_properties_county ON properties(county_fips);
CREATE INDEX IF NOT EXISTS idx_properties_parcel ON properties(parcel_id);

CREATE TABLE IF NOT EXISTS distress_signals (
  id                  SERIAL PRIMARY KEY,
  property_id         INTEGER NOT NULL REFERENCES properties(id),
  signal_type         TEXT NOT NULL,
  amount              NUMERIC(14,2),
  date_filed          DATE,
  date_effective      DATE,
  case_number         TEXT,
  raw_label           TEXT,
  source              TEXT,
  lender_name         TEXT,
  attorney_name       TEXT,
  auction_date        DATE,
  years_delinquent    NUMERIC(4,1),
  last_payment_date   DATE,
  tax_sale_scheduled  BOOLEAN DEFAULT FALSE,
  tax_sale_date       DATE,
  metadata            JSONB,
  ingested_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signals_property ON distress_signals(property_id);
CREATE INDEX IF NOT EXISTS idx_signals_type ON distress_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_signals_date_filed ON distress_signals(date_filed);
CREATE INDEX IF NOT EXISTS idx_signals_amount ON distress_signals(amount);

CREATE UNIQUE INDEX IF NOT EXISTS uq_distress_signals_dedupe
ON distress_signals (
  property_id,
  signal_type,
  COALESCE(case_number, ''),
  COALESCE(date_filed, DATE '1900-01-01')
);

CREATE TABLE IF NOT EXISTS ingestion_logs (
  id            SERIAL PRIMARY KEY,
  county_fips   VARCHAR(5) NOT NULL REFERENCES counties(fips),
  adapter_name  TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at   TIMESTAMPTZ,
  records_found INTEGER,
  records_new   INTEGER,
  records_updated INTEGER,
  records_failed  INTEGER,
  status        TEXT NOT NULL DEFAULT 'running',
  error_message TEXT
);

-- Seed supported counties
INSERT INTO counties (fips, name, state, adapter_name, has_tax_data, has_preforeclosure_data, has_code_violation_data, update_frequency, status)
VALUES
  ('48201', 'Harris County', 'TX', 'HarrisAdapter', TRUE, TRUE, FALSE, 'daily', 'active'),
  ('17031', 'Cook County',   'IL', 'CookAdapter',   TRUE, TRUE, FALSE, 'daily', 'active'),
  ('04013', 'Maricopa County', 'AZ', 'MaricopaAdapter', TRUE, TRUE, FALSE, 'daily', 'active')
ON CONFLICT (fips) DO NOTHING;
