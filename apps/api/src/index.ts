import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { analyzeRoutes } from './routes/analyze';
import { jobsRoutes } from './routes/jobs';
import { reportsRoutes } from './routes/reports';
import { createLogger } from './lib/logger';

const app = new Hono();
const log = createLogger('api');

// Middleware
app.use('*', cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'https://ai-commerce-audit.lovable.app'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.route('/api/analyze', analyzeRoutes);
app.route('/api/jobs', jobsRoutes);
app.route('/api/reports', reportsRoutes);

// Error handler
app.onError((err, c) => {
  log.error({ err }, 'Unhandled error');
  return c.json({ error: 'Internal server error' }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

const port = parseInt(process.env.PORT || '3001');
log.info({ port }, 'Starting API server');

import { serve } from '@hono/node-server';

serve({
  fetch: app.fetch,
  port,
}, (info) => {
  log.info({ port: info.port }, 'Server listening');
});
