import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Simple URL validation
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  // Set CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });

  const path = req.url?.replace(/\?.*$/, '') || '/';

  // Health check
  if (path === '/health' || path === '/api/health') {
    return res.json({ status: 'ok', timestamp: new Date().toISOString() });
  }

  // Root
  if (path === '/' || path === '/api' || path === '/api/') {
    return res.json({
      name: 'Agent Pulse API',
      version: '1.0.0',
      status: 'running',
      endpoints: {
        analyze: 'POST /api/analyze',
        jobs: 'GET /api/jobs/:id',
        health: 'GET /api/health',
      },
    });
  }

  // Analyze endpoint
  if ((path === '/analyze' || path === '/api/analyze') && req.method === 'POST') {
    try {
      const { url } = req.body || {};

      if (!url) {
        return res.status(400).json({ success: false, error: 'URL is required' });
      }

      // Normalize URL
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith('http')) {
        normalizedUrl = 'https://' + normalizedUrl;
      }

      if (!isValidUrl(normalizedUrl)) {
        return res.status(400).json({ success: false, error: 'Invalid URL' });
      }

      // Create job record
      const { data: job, error: jobError } = await supabase
        .from('analysis_jobs')
        .insert({
          url: normalizedUrl,
          status: 'pending',
          client_ip: (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 'unknown',
          depth: 'single',
          progress: { step: 0, totalSteps: 5, currentCheck: 'Queued...' },
        })
        .select('id')
        .single();

      if (jobError) {
        console.error('Failed to create job:', jobError);
        return res.status(500).json({ success: false, error: 'Failed to create job' });
      }

      // Trigger analysis via Trigger.dev (if configured)
      if (process.env.TRIGGER_SECRET_KEY) {
        try {
          const triggerResponse = await fetch('https://api.trigger.dev/api/v1/tasks/analyze-ecommerce-site/trigger', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.TRIGGER_SECRET_KEY}`,
            },
            body: JSON.stringify({
              payload: { jobId: job.id, url: normalizedUrl },
            }),
          });

          if (!triggerResponse.ok) {
            console.error('Trigger.dev failed:', await triggerResponse.text());
          }
        } catch (triggerError) {
          console.error('Trigger.dev error:', triggerError);
        }
      }

      return res.json({
        success: true,
        jobId: job.id,
        estimatedDuration: 60,
        statusUrl: `/api/jobs/${job.id}`,
      });
    } catch (error: any) {
      console.error('Analyze error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }
  }

  // Jobs endpoint
  const jobsMatch = path.match(/^\/(?:api\/)?jobs\/([a-f0-9-]+)$/);
  if (jobsMatch && req.method === 'GET') {
    const jobId = jobsMatch[1];

    const { data: job, error } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error || !job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    let summary = undefined;
    if (job.status === 'completed' && job.analysis_id) {
      const { data: analysis } = await supabase
        .from('analyses')
        .select('total_score, grade, checks')
        .eq('id', job.analysis_id)
        .single();

      if (analysis) {
        summary = {
          score: analysis.total_score,
          grade: analysis.grade,
          checksCount: Array.isArray(analysis.checks) ? analysis.checks.length : 0,
          issuesCount: Array.isArray(analysis.checks)
            ? (analysis.checks as any[]).filter((c) => c.status !== 'pass').length
            : 0,
        };
      }
    }

    return res.json({
      status: job.status,
      progress: job.progress,
      createdAt: job.created_at,
      analysisId: job.analysis_id,
      summary,
      resultsUrl: job.analysis_id ? `/results/${job.analysis_id}` : undefined,
      error: job.error,
    });
  }

  // 404
  return res.status(404).json({ error: 'Not found' });
}
