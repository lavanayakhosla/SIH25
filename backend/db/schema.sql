CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS codesystems (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  version text,
  json jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conceptmaps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_url text,
  target_url text,
  version text,
  mappings jsonb,
  status text DEFAULT 'draft',
  created_by text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mapping_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  namaste_code text,
  candidates jsonb,
  curator text,
  action text,
  created_at timestamptz DEFAULT now()
);
