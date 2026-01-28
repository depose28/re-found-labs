import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { supabase } from '../../lib/supabase';

const log = createLogger('check:pageSpeed');

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

export interface PageSpeedMetrics {
  performanceScore: number | null;
  lcp: number | null; // Largest Contentful Paint (ms)
  fid: number | null; // First Input Delay (ms)
  cls: number | null; // Cumulative Layout Shift
  tti: number | null; // Time to Interactive (ms)
  speedIndex: number | null;
  cached?: boolean; // Whether this result came from cache
  cacheAge?: number; // Age of cached result in hours
}

export interface PageSpeedResult {
  check: Check;
  metrics: PageSpeedMetrics;
}

const PAGESPEED_API_URL = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';

/**
 * Check cache for recent PageSpeed results for this domain.
 * Returns cached metrics if found within CACHE_DURATION_MS.
 */
async function getCachedPageSpeedMetrics(domain: string): Promise<PageSpeedMetrics | null> {
  try {
    const cutoffTime = new Date(Date.now() - CACHE_DURATION_MS).toISOString();

    const { data: recentAnalyses } = await supabase
      .from('analyses')
      .select('checks, created_at')
      .eq('domain', domain)
      .gte('created_at', cutoffTime)
      .order('created_at', { ascending: false })
      .limit(1);

    if (recentAnalyses && recentAnalyses.length > 0) {
      const checks = recentAnalyses[0].checks as Check[] | null;
      const n1Check = checks?.find((c) => c.id === 'N1');

      // Only use cache if the previous check actually measured performance
      // (status !== 'skipped' means it was measured)
      if (n1Check && n1Check.status !== 'skipped' && n1Check.data?.performanceScore !== null) {
        const cacheAgeMs = Date.now() - new Date(recentAnalyses[0].created_at).getTime();
        const cacheAgeHours = Math.round(cacheAgeMs / (60 * 60 * 1000));

        log.info(
          { domain, cachedScore: n1Check.data.performanceScore, cacheAgeHours },
          'Using cached PageSpeed result'
        );

        return {
          performanceScore: n1Check.data.performanceScore as number,
          lcp: n1Check.data.lcp ? parseFloat(n1Check.data.lcp as string) * 1000 : null,
          cls: n1Check.data.cls ? parseFloat(n1Check.data.cls as string) : null,
          tti: n1Check.data.tti ? parseFloat(n1Check.data.tti as string) * 1000 : null,
          fid: null,
          speedIndex: null,
          cached: true,
          cacheAge: cacheAgeHours,
        };
      }
    }

    return null;
  } catch (error) {
    log.warn({ domain, error }, 'Failed to check PageSpeed cache');
    return null;
  }
}

export async function getPageSpeedMetrics(
  url: string,
  apiKey?: string,
  skipCache?: boolean
): Promise<PageSpeedMetrics> {
  const key = apiKey || process.env.GOOGLE_PAGESPEED_API_KEY;
  const domain = new URL(url).hostname;

  const defaultMetrics: PageSpeedMetrics = {
    performanceScore: null,
    lcp: null,
    fid: null,
    cls: null,
    tti: null,
    speedIndex: null,
  };

  // Check cache first (unless explicitly skipped)
  if (!skipCache) {
    const cachedMetrics = await getCachedPageSpeedMetrics(domain);
    if (cachedMetrics) {
      return cachedMetrics;
    }
  }

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

    const data = (await response.json()) as {
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
      cached: false,
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

/**
 * Evaluate PageSpeed metrics and return a check result.
 *
 * IMPORTANT: When PageSpeed cannot be measured (API unavailable, no cache),
 * we set both score=0 AND maxScore=0 with status='skipped'.
 * This excludes the check from the total score calculation, ensuring:
 * - API failure doesn't give "free points"
 * - API failure doesn't penalize the site unfairly
 * - Scores are consistent across runs (via caching)
 */
export function checkPageSpeed(metrics: PageSpeedMetrics): PageSpeedResult {
  const { id, name, category, maxScore: defaultMaxScore } = CHECKS.N1;

  let status: CheckStatus;
  let score: number;
  let maxScore: number;
  let details: string;

  if (metrics.performanceScore === null) {
    // API unavailable and no cache - exclude from scoring entirely
    // This is the fairest approach: API failure shouldn't help or hurt the site
    status = 'skipped';
    score = 0;
    maxScore = 0; // KEY: Setting maxScore to 0 excludes this check from the total
    details = 'Could not measure — PageSpeed API unavailable. Check excluded from total score.';
    log.info({ status, score, maxScore }, 'PageSpeed check skipped - API unavailable');
  } else if (metrics.performanceScore >= 90) {
    status = 'pass';
    score = defaultMaxScore;
    maxScore = defaultMaxScore;
    const lcp = metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A';
    details = `Excellent performance (${metrics.performanceScore}/100). LCP: ${lcp}`;
    if (metrics.cached) {
      details += ` (cached ${metrics.cacheAge}h ago)`;
    }
  } else if (metrics.performanceScore >= 70) {
    status = 'pass';
    score = Math.round(defaultMaxScore * 0.8);
    maxScore = defaultMaxScore;
    const lcp = metrics.lcp ? `${(metrics.lcp / 1000).toFixed(1)}s` : 'N/A';
    details = `Good performance (${metrics.performanceScore}/100). LCP: ${lcp}`;
    if (metrics.cached) {
      details += ` (cached ${metrics.cacheAge}h ago)`;
    }
  } else if (metrics.performanceScore >= 50) {
    status = 'partial';
    score = Math.round(defaultMaxScore * 0.5);
    maxScore = defaultMaxScore;
    details = `Moderate performance (${metrics.performanceScore}/100). Agents may timeout.`;
    if (metrics.cached) {
      details += ` (cached ${metrics.cacheAge}h ago)`;
    }
  } else {
    status = 'fail';
    score = Math.round(defaultMaxScore * 0.2);
    maxScore = defaultMaxScore;
    details = `Poor performance (${metrics.performanceScore}/100). Agents will likely abandon.`;
    if (metrics.cached) {
      details += ` (cached ${metrics.cacheAge}h ago)`;
    }
  }

  log.info({ performanceScore: metrics.performanceScore, score, maxScore, cached: metrics.cached }, 'PageSpeed check complete');

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
        cached: metrics.cached || false,
        cacheAge: metrics.cacheAge || null,
      },
    },
    metrics,
  };
}
