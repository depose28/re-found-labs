-- Add new columns for Distribution pillar
ALTER TABLE analyses
  ADD COLUMN IF NOT EXISTS platform_detected text,
  ADD COLUMN IF NOT EXISTS platform_name text,
  ADD COLUMN IF NOT EXISTS feeds_found jsonb,
  ADD COLUMN IF NOT EXISTS feed_validation jsonb,
  ADD COLUMN IF NOT EXISTS protocol_compatibility jsonb,
  ADD COLUMN IF NOT EXISTS distribution_score integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS distribution_max integer DEFAULT 15;

-- Update default max values for adjusted scoring weights
ALTER TABLE analyses 
  ALTER COLUMN discovery_max SET DEFAULT 35,
  ALTER COLUMN trust_max SET DEFAULT 15;