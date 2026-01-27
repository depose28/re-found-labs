import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const log = createLogger('jobs');

export const jobsRoutes = new Hono();

// Get job status
jobsRoutes.get('/:id', async (c) => {
  const jobId = c.req.param('id');

  const { data: job, error } = await supabase
    .from('analysis_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    log.warn({ jobId, error }, 'Job not found');
    return c.json({ error: 'Job not found' }, 404);
  }

  // Base response
  const response: Record<string, any> = {
    status: job.status,
    createdAt: job.created_at,
  };

  // Add progress info if running
  if (job.status === 'running' || job.status === 'pending') {
    response.progress = job.progress || {
      step: 0,
      totalSteps: 5,
      currentCheck: 'Waiting...',
    };
    if (job.started_at) {
      response.elapsedMs = Date.now() - new Date(job.started_at).getTime();
    }
  }

  // Add results if completed
  if (job.status === 'completed' && job.analysis_id) {
    // Fetch summary from analyses table
    const { data: analysis } = await supabase
      .from('analyses')
      .select('total_score, grade, checks')
      .eq('id', job.analysis_id)
      .single();

    if (analysis) {
      response.analysisId = job.analysis_id;
      response.summary = {
        score: analysis.total_score,
        grade: analysis.grade,
        checksCount: Array.isArray(analysis.checks) ? analysis.checks.length : 0,
        issuesCount: Array.isArray(analysis.checks)
          ? analysis.checks.filter((c: any) => c.status !== 'pass').length
          : 0,
      };
      response.resultsUrl = `/results?id=${job.analysis_id}`;
    }
  }

  // Add error info if failed
  if (job.status === 'failed') {
    response.error = job.error || { message: 'Unknown error' };
  }

  return c.json(response);
});

// List recent jobs (for debugging)
jobsRoutes.get('/', async (c) => {
  const limit = parseInt(c.req.query('limit') || '20');

  const { data: jobs, error } = await supabase
    .from('analysis_jobs')
    .select('id, url, status, created_at, completed_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    log.error({ error }, 'Failed to list jobs');
    return c.json({ error: 'Failed to list jobs' }, 500);
  }

  return c.json({ jobs });
});
