// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'https://agent-pulse-api.vercel.app';

// API endpoints
export const endpoints = {
  analyze: `${API_URL}/api/analyze`,
  jobs: (jobId: string) => `${API_URL}/api/jobs/${jobId}`,
  analysis: (analysisId: string) => `${API_URL}/api/analysis/${analysisId}`,
  stats: `${API_URL}/api/stats`,
  emailCapture: `${API_URL}/api/email-capture`,
  health: `${API_URL}/health`,
};

// Job polling configuration
export const POLL_INTERVAL_MS = 2000; // Poll every 2 seconds
export const MAX_POLL_TIME_MS = 120000; // Max 2 minutes of polling
