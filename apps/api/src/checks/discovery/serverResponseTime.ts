import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:serverResponseTime');

export interface ServerResponseTimeResult {
  check: Check;
  ttfbMs: number;
}

export function checkServerResponseTime(ttfbMs: number): ServerResponseTimeResult {
  const { id, name, category, maxScore } = CHECKS.D3;

  let status: CheckStatus;
  let score: number;
  let details: string;
  let threshold: string;

  if (ttfbMs < 400) {
    status = 'pass';
    score = maxScore; // 3
    threshold = 'optimal';
    details = `TTFB ${ttfbMs}ms — optimal for AI agent crawling (<400ms)`;
  } else if (ttfbMs < 800) {
    status = 'partial';
    score = 2;
    threshold = 'acceptable';
    details = `TTFB ${ttfbMs}ms — acceptable but slower agents may skip (400-800ms)`;
  } else if (ttfbMs < 1200) {
    status = 'partial';
    score = 1;
    threshold = 'at_risk';
    details = `TTFB ${ttfbMs}ms — at risk of being skipped by AI agents (800-1200ms)`;
  } else {
    status = 'fail';
    score = 0;
    threshold = 'too_slow';
    details = `TTFB ${ttfbMs}ms — too slow, agents likely bounce (>1200ms)`;
  }

  log.info({ ttfbMs, threshold, score }, 'Server response time check complete');

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score,
      maxScore,
      details,
      data: { ttfbMs, threshold },
    },
    ttfbMs,
  };
}
