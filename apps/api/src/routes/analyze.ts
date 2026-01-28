import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { tasks } from "@trigger.dev/sdk/v3";
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/logger';
import { validateUrlSecurity } from '../lib/security';
import { runAnalysis } from '../jobs/analyze.job';
import type { analyzeTask } from '../trigger/analyze';

const log = createLogger('analyze');

const analyzeSchema = z.object({
  url: z.string().url('Invalid URL format'),
  depth: z.enum(['single', 'deep']).default('single'),
});

export const analyzeRoutes = new Hono();

// Rate limit constants
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW_MS = 3600000; // 1 hour

async function checkRateLimit(ip: string): Promise<{ allowed: boolean; remaining: number }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();

  try {
    const { data: existing, error } = await supabase
      .from('rate_limits')
      .select('id, count')
      .eq('ip', ip)
      .eq('endpoint', 'analyze')
      .gte('window_start', windowStart)
      .order('window_start', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      log.error({ error }, 'Rate limit check failed');
      return { allowed: true, remaining: RATE_LIMIT_MAX };
    }

    if (!existing) {
      await supabase.from('rate_limits').insert({
        ip,
        endpoint: 'analyze',
        window_start: new Date().toISOString(),
        count: 1,
      });
      return { allowed: true, remaining: RATE_LIMIT_MAX - 1 };
    }

    if (existing.count >= RATE_LIMIT_MAX) {
      return { allowed: false, remaining: 0 };
    }

    await supabase
      .from('rate_limits')
      .update({ count: existing.count + 1 })
      .eq('id', existing.id);

    return { allowed: true, remaining: RATE_LIMIT_MAX - existing.count - 1 };
  } catch (error) {
    log.error({ error }, 'Rate limit check error');
    return { allowed: true, remaining: RATE_LIMIT_MAX };
  }
}

function normalizeUrl(url: string): string {
  let normalized = url.trim();
  if (!normalized.startsWith('http')) {
    normalized = 'https://' + normalized;
  }
  return normalized;
}

// Check if Trigger.dev is configured
function isTriggerConfigured(): boolean {
  return !!process.env.TRIGGER_SECRET_KEY;
}

// Async job-based endpoint (returns immediately, poll for status)
analyzeRoutes.post('/', zValidator('json', analyzeSchema), async (c) => {
  const { url, depth } = c.req.valid('json');
  const clientIp =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';

  log.info({ url, depth, clientIp }, 'Analysis request received');

  // Check rate limit
  const { allowed, remaining } = await checkRateLimit(clientIp);
  if (!allowed) {
    log.warn({ clientIp }, 'Rate limit exceeded');
    return c.json(
      { success: false, error: 'Rate limit exceeded. Please try again later.' },
      429,
      {
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': '0',
        'Retry-After': '3600',
      }
    );
  }

  // Normalize and validate URL
  const normalizedUrl = normalizeUrl(url);
  const securityCheck = validateUrlSecurity(normalizedUrl);
  if (!securityCheck.valid) {
    log.warn({ url: normalizedUrl, error: securityCheck.error }, 'URL validation failed');
    return c.json({ success: false, error: securityCheck.error }, 400);
  }

  try {
    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        url: normalizedUrl,
        status: 'pending',
        client_ip: clientIp,
        depth,
        progress: { step: 0, totalSteps: 5, currentCheck: 'Initializing...' },
      })
      .select('id')
      .single();

    if (jobError) {
      log.error({ error: jobError }, 'Failed to create job');
      throw new Error('Failed to create analysis job');
    }

    log.info({ jobId: job.id, url: normalizedUrl }, 'Job created, starting analysis');

    // Use Trigger.dev if configured, otherwise run inline
    if (isTriggerConfigured()) {
      // Trigger the analysis task via Trigger.dev
      const handle = await tasks.trigger<typeof analyzeTask>(
        "analyze-ecommerce-site",
        { jobId: job.id, url: normalizedUrl }
      );

      log.info({ jobId: job.id, triggerRunId: handle.id }, 'Analysis triggered via Trigger.dev');
    } else {
      // Fallback: run analysis inline (for local development without Trigger.dev)
      log.info({ jobId: job.id }, 'Running analysis inline (Trigger.dev not configured)');
      runAnalysis({ jobId: job.id, url: normalizedUrl }).catch((err) => {
        log.error({ jobId: job.id, error: err }, 'Background analysis failed');
      });
    }

    return c.json({
      success: true,
      jobId: job.id,
      estimatedDuration: depth === 'deep' ? 120 : 60,
      statusUrl: `/api/jobs/${job.id}`,
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Analysis request failed');
    return c.json({ success: false, error: 'Failed to start analysis' }, 500);
  }
});

// Sync endpoint for compatibility with existing frontend
// This waits for the analysis to complete before returning
// Note: This endpoint always runs inline (not via Trigger.dev) for immediate response
analyzeRoutes.post('/sync', zValidator('json', analyzeSchema), async (c) => {
  const { url } = c.req.valid('json');
  const clientIp =
    c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ||
    c.req.header('x-real-ip') ||
    'unknown';

  log.info({ url, clientIp }, 'Sync analysis request received');

  // Check rate limit
  const { allowed } = await checkRateLimit(clientIp);
  if (!allowed) {
    return c.json(
      { success: false, error: 'Rate limit exceeded. Please try again later.' },
      429
    );
  }

  // Normalize and validate URL
  const normalizedUrl = normalizeUrl(url);
  const securityCheck = validateUrlSecurity(normalizedUrl);
  if (!securityCheck.valid) {
    return c.json({ success: false, error: securityCheck.error }, 400);
  }

  try {
    // Create job record
    const { data: job, error: jobError } = await supabase
      .from('analysis_jobs')
      .insert({
        url: normalizedUrl,
        status: 'pending',
        client_ip: clientIp,
        depth: 'single',
        progress: { step: 0, totalSteps: 5, currentCheck: 'Initializing...' },
      })
      .select('id')
      .single();

    if (jobError) {
      throw new Error('Failed to create analysis job');
    }

    // Run analysis synchronously
    const result = await runAnalysis({ jobId: job.id, url: normalizedUrl });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 500);
    }

    // Fetch the analysis summary
    const { data: analysis } = await supabase
      .from('analyses')
      .select('total_score, grade, checks')
      .eq('id', result.analysisId)
      .single();

    return c.json({
      success: true,
      analysisId: result.analysisId,
      summary: analysis
        ? {
            score: analysis.total_score,
            grade: analysis.grade,
            checksCount: Array.isArray(analysis.checks) ? analysis.checks.length : 0,
            issuesCount: Array.isArray(analysis.checks)
              ? analysis.checks.filter((c: any) => c.status !== 'pass').length
              : 0,
          }
        : undefined,
    });
  } catch (error: any) {
    log.error({ error: error.message }, 'Sync analysis failed');
    return c.json({ success: false, error: error.message }, 500);
  }
});
