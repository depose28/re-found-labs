import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';

const log = createLogger('check:sitemap');

export interface SitemapResult {
  check: Check;
  sitemapUrl: string | null;
  urlCount: number;
}

export async function checkSitemap(domain: string): Promise<SitemapResult> {
  const { id, name, category, maxScore } = CHECKS.D3;

  log.info({ domain }, 'Checking sitemap availability');

  const sitemapUrls = [
    `${domain}/sitemap.xml`,
    `${domain}/sitemap_index.xml`,
    `${domain}/sitemap-index.xml`,
  ];

  for (const sitemapUrl of sitemapUrls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(sitemapUrl, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AgentPulseBot/1.0' },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const content = await response.text();

        // Verify it's actually a sitemap
        if (content.includes('<urlset') || content.includes('<sitemapindex')) {
          // Count URLs
          const urlMatches = content.match(/<loc>/g);
          const urlCount = urlMatches ? urlMatches.length : 0;

          log.info({ sitemapUrl, urlCount }, 'Valid sitemap found');

          return {
            check: {
              id,
              name,
              category: category as any,
              status: 'pass',
              score: maxScore,
              maxScore,
              details: `Valid XML sitemap found (${urlCount} URLs indexed)`,
              data: { sitemapUrl, urlCount },
            },
            sitemapUrl,
            urlCount,
          };
        }
      }
    } catch (error) {
      log.debug({ sitemapUrl, error }, 'Sitemap check failed');
    }
  }

  log.info({ domain }, 'No sitemap found');

  return {
    check: {
      id,
      name,
      category: category as any,
      status: 'fail',
      score: 0,
      maxScore,
      details: "No XML sitemap found — agents can't efficiently crawl your catalog",
      data: { checked: sitemapUrls },
    },
    sitemapUrl: null,
    urlCount: 0,
  };
}
