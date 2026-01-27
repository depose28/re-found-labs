-- Migration: Create analysis_jobs table for job queue support
-- Run this in Supabase SQL Editor

-- Create the analysis_jobs table
CREATE TABLE IF NOT EXISTS analysis_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  -- Status values: 'pending', 'queued', 'scraping', 'analyzing', 'scoring', 'completed', 'failed'

  -- Progress tracking
  progress JSONB DEFAULT '{}',
  -- Example: { "step": 2, "totalSteps": 5, "currentCheck": "D2", "completedChecks": ["D1"] }

  -- Result reference
  analysis_id UUID REFERENCES analyses(id),
  -- Set when job completes successfully

  -- Error tracking
  error JSONB,
  -- Example: { "code": "TIMEOUT", "message": "Site blocked requests", "retryable": true }

  -- Retry tracking
  attempt_count INTEGER DEFAULT 0,
  trigger_run_id TEXT,  -- External job runner ID for debugging

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  -- Rate limiting / tracking
  client_ip TEXT,

  -- Future: Deep simulation support
  depth TEXT DEFAULT 'single',
  simulation_results JSONB
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_status ON analysis_jobs(status);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_created ON analysis_jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analysis_jobs_client_ip ON analysis_jobs(client_ip, created_at DESC);

-- Add job_id reference to analyses table for linking
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES analysis_jobs(id);

-- Add execution log column for debugging
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS execution_log JSONB;
-- Example: [{ "timestamp": "...", "check": "D1", "durationMs": 1234 }]

-- Add scrape metadata column
ALTER TABLE analyses ADD COLUMN IF NOT EXISTS scrape_metadata JSONB;
-- Example: { "firecrawlUsed": true, "credits": 1, "productPageFollowed": true }

-- Enable Row Level Security
ALTER TABLE analysis_jobs ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for job status polling)
CREATE POLICY "Allow public read access to jobs" ON analysis_jobs
  FOR SELECT
  USING (true);

-- Allow authenticated insert (from backend)
CREATE POLICY "Allow service role full access to jobs" ON analysis_jobs
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comment on table
COMMENT ON TABLE analysis_jobs IS 'Job queue for async analysis processing with progress tracking';
