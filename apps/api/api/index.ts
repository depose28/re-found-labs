import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from '../src/index';

// Vercel serverless function handler
// Converts Vercel's req/res to standard Web Request/Response
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Build the full URL
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost';
  const url = new URL(req.url || '/', `${protocol}://${host}`);

  // Convert Vercel request to standard Request
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach(v => headers.append(key, v));
      } else {
        headers.set(key, value);
      }
    }
  }

  // Read body for POST/PUT/PATCH requests
  let body: string | undefined;
  if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
    body = JSON.stringify(req.body);
  }

  const request = new Request(url.toString(), {
    method: req.method,
    headers,
    body,
  });

  // Call Hono app
  const response = await app.fetch(request);

  // Convert Response to Vercel response
  res.status(response.status);

  // Set headers
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  // Send body
  const responseBody = await response.text();
  res.send(responseBody);
}

// Config for longer execution time
export const config = {
  maxDuration: 60,
};
