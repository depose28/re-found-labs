import { Hono } from 'hono';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import { supabase } from '../lib/supabase';
import { createLogger } from '../lib/logger';

const log = createLogger('reports');

const reportSchema = z.object({
  email: z.string().email('Invalid email format'),
  analysisId: z.string().uuid('Invalid analysis ID'),
});

export const reportsRoutes = new Hono();

reportsRoutes.post('/', zValidator('json', reportSchema), async (c) => {
  const { email, analysisId } = c.req.valid('json');

  log.info({ email, analysisId }, 'Report request received');

  try {
    // Verify analysis exists
    const { data: analysis, error: fetchError } = await supabase
      .from('analyses')
      .select('id, url, domain, total_score, grade')
      .eq('id', analysisId)
      .single();

    if (fetchError || !analysis) {
      log.warn({ analysisId }, 'Analysis not found');
      return c.json({ error: 'Analysis not found' }, 404);
    }

    // Record email capture
    const { error: captureError } = await supabase
      .from('email_captures')
      .insert({
        email,
        analysis_id: analysisId,
        source: 'report_request',
      });

    if (captureError) {
      log.warn({ error: captureError }, 'Failed to record email capture');
      // Don't fail the request, just log
    }

    // TODO: Trigger report generation job
    // For now, call the existing Supabase edge function
    // This will be migrated to the new backend later

    log.info({ email, analysisId }, 'Report generation triggered');

    return c.json({
      success: true,
      message: 'Report will be sent shortly',
    });
  } catch (error) {
    log.error({ error }, 'Report request failed');
    return c.json({ success: false, error: 'Failed to generate report' }, 500);
  }
});
