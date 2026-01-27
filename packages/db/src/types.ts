// Database types - will be auto-generated from Supabase schema
// For now, manually define the new analysis_jobs table type

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type JobStatus = 'pending' | 'queued' | 'scraping' | 'analyzing' | 'scoring' | 'completed' | 'failed';

export interface AnalysisJob {
  id: string;
  url: string;
  status: JobStatus;
  progress: {
    step: number;
    totalSteps: number;
    currentCheck?: string;
    completedChecks?: string[];
  } | null;
  analysis_id: string | null;
  error: {
    code: string;
    message: string;
    retryable: boolean;
  } | null;
  attempt_count: number;
  trigger_run_id: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  client_ip: string | null;
  depth: 'single' | 'deep';
  simulation_results: Json | null;
}

export interface AnalysisJobInsert {
  url: string;
  status?: JobStatus;
  progress?: AnalysisJob['progress'];
  client_ip?: string;
  depth?: 'single' | 'deep';
}

export interface AnalysisJobUpdate {
  status?: JobStatus;
  progress?: AnalysisJob['progress'];
  analysis_id?: string;
  error?: AnalysisJob['error'];
  attempt_count?: number;
  trigger_run_id?: string;
  started_at?: string;
  completed_at?: string;
  simulation_results?: Json;
}

// Re-export existing types
export type Analysis = {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  discovery_score: number;
  discovery_max: number | null;
  performance_score: number;
  performance_max: number | null;
  transaction_score: number;
  transaction_max: number | null;
  distribution_score: number | null;
  distribution_max: number | null;
  trust_score: number;
  trust_max: number | null;
  platform_detected: string | null;
  platform_name: string | null;
  feeds_found: Json | null;
  protocol_compatibility: Json | null;
  checks: Json;
  recommendations: Json;
  created_at: string;
  analysis_duration_ms: number | null;
  error: string | null;
  job_id: string | null;
  execution_log: Json | null;
  scrape_metadata: Json | null;
};
