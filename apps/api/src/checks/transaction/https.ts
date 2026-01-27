import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:https');

export interface HttpsResult {
  check: Check;
  isHttps: boolean;
}

export function checkHttps(url: string): HttpsResult {
  const { id, name, category, maxScore } = CHECKS.T2;

  const isHttps = url.startsWith('https://');

  log.debug({ url, isHttps }, 'HTTPS check');

  const status: CheckStatus = isHttps ? 'pass' : 'fail';
  const score = isHttps ? maxScore : 0;
  const details = isHttps
    ? 'Site uses HTTPS — secure for transactions'
    : "Site does not use HTTPS — agents won't transact";

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score,
      maxScore,
      details,
      data: { isHttps },
    },
    isHttps,
  };
}
