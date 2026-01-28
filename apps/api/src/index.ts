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
  origin: [
    'http://localhost:8080',
    'http://localhost:5173',
    'https://ai-commerce-audit.lovable.app',
    // Add your Vercel frontend URL here once deployed
  ],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
app.use('*', logger());
app.use('*', prettyJSON());

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    name: 'Agent Pulse API',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/analyze',
      jobs: 'GET /api/jobs/:id',
      health: 'GET /health',
    },
  });
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

// Export for Vercel serverless
export default app;

// Local development server
// Only start the server if not running on Vercel
if (!process.env.VERCEL) {
  const port = parseInt(process.env.PORT || '3001');
  log.info({ port }, 'Starting API server');

  import('@hono/node-server').then(({ serve }) => {
    serve({
      fetch: app.fetch,
      port,
    }, (info) => {
      log.info({ port: info.port }, 'Server listening');
    });
  });
}
