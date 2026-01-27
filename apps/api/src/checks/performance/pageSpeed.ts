import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:pageSpeed');

export interface PageSpeedMetrics {
  performanceScore: number | null;
  lcp: number | null; // Largest Contentful Paint (ms)
  fid: number | null; // First Input Delay (ms)
  cls: number | null; // Cumulative Layout Shift
  tti: number | null; // Time to Interactive (ms)
  speedIndex: number | null;
}

export interface PageSpeedResult {
  check: Check;
  metrics: PageSpeedMetrics;
}

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

export async function getPageSpeedMetrics(
  url: string,
  apiKey?: string
): Promise<PageSpeedMetrics> {
  const key = apiKey || process.env.GOOGLE_PAGESPEED_API_KEY;

  const defaultMetrics: PageSpeedMetrics = {
    performanceScore: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    speedIndex: null,
  };

  if (!key) {
    log.warn('GOOGLE_PAGESPEED_API_KEY not configured');
    return defaultMetrics;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const params = new URLSearchParams({
      url,
      key,
      category: 'performance',
      strategy: 'mobile',
    });

    log.debug({ url }, 'Fetching PageSpeed metrics');

    const response = await fetch(`${PAGESPEED_API_URL}?${params}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      log.warn({ url, status: response.status }, 'PageSpeed API error');
      return defaultMetrics;
    }

    const data = await response.json() as {
      lighthouseResult?: {
        categories?: { performance?: { score?: number } };
        audits?: Record<string, { numericValue?: number }>;
      };
    };
    const lighthouse = data.lighthouseResult;

    if (!lighthouse) {
      log.warn({ url }, 'No Lighthouse data in response');
      return defaultMetrics;
    }

    const metrics: PageSpeedMetrics = {
      performanceScore: Math.round((lighthouse.categories?.performance?.score || 0) * 100),
      lcp: lighthouse.audits?.['largest-contentful-paint']?.numericValue || null,
      fid: lighthouse.audits?.['max-potential-fid']?.numericValue || null,
      cls: lighthouse.audits?.['cumulative-layout-shift']?.numericValue || null,
      tti: lighthouse.audits?.['interactive']?.numericValue || null,
      speedIndex: lighthouse.audits?.['speed-index']?.numericValue || null,
    };

    log.info({ url, performanceScore: metrics.performanceScore }, 'PageSpeed metrics retrieved');

    return metrics;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      log.warn({ url }, 'PageSpeed request timed out');
    } else {
      log.error({ url, error: error.message }, 'PageSpeed fetch failed');
    }
    return defaultMetrics;
  }
}

export function checkPageSpeed(metrics: PageSpeedMetrics): PageSpeedResult {
  const { id, name, category, maxScore } = CHECKS.N1;

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (metrics.performanceScore === null) {
    status = 'partial';
    score = Math.round(maxScore * 0.5);
    details = 'Could not measure — PageSpeed API unavailable';
  } else if (metrics.performanceScore >= 90) {
    status = 'pass';
    score = maxScore;
    const lcp = metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A';
    details = `Excellent performance (${metrics.performanceScore}/100). LCP: ${lcp}`;
  } else if (metrics.performanceScore >= 70) {
    status = 'pass';
    score = Math.round(maxScore * 0.8);
    const lcp = metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A';
    details = `Good performance (${metrics.performanceScore}/100). LCP: ${lcp}`;
  } else if (metrics.performanceScore >= 50) {
    status = 'partial';
    score = Math.round(maxScore * 0.5);
    details = `Moderate performance (${metrics.performanceScore}/100). Agents may timeout.`;
  } else {
    status = 'fail';
    score = Math.round(maxScore * 0.2);
    details = `Poor performance (${metrics.performanceScore}/100). Agents will likely abandon.`;
  }

  log.info({ performanceScore: metrics.performanceScore, score }, 'PageSpeed check complete');

  return {
    check: {
      id,
      name,
      category: category as any,
      status,
      score,
      maxScore,
      details,
      data: {
        performanceScore: metrics.performanceScore,
        lcp: metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : null,
        cls: metrics.cls?.toFixed(3) || null,
        tti: metrics.tti ? `${(metrics.tti / 1000).toFixed(1)}s` : null,
      },
    },
    metrics,
  };
}
