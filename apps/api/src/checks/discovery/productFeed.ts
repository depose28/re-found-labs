import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { discoverFeeds, FeedInfo } from '../distribution/feeds';
import { PlatformDetection } from '../distribution/platform';

const log = createLogger('check:productFeed');

export interface ProductFeedResult {
  check: Check;
  feeds: FeedInfo[];
}

export async function checkProductFeed(
  domain: string,
  html: string,
  robotsTxt: string | null,
  platform: PlatformDetection
): Promise<ProductFeedResult> {
  const { id, name, category, maxScore } = CHECKS.D7;

  log.info({ domain }, 'Checking product feed');

  const { feeds, primaryFeed } = await discoverFeeds(domain, html, robotsTxt, platform);

  const nonEmptyFeeds = feeds.filter((f) => !f.isEmpty && f.productCount && f.productCount > 0);
  const accessibleFeeds = feeds.filter((f) => f.accessible);
  const discoverableSources = ['robots', 'sitemap', 'html', 'native'];
  const discoverableFeeds = feeds.filter((f) => discoverableSources.includes(f.source));

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (nonEmptyFeeds.length > 0 && discoverableFeeds.length > 0 && accessibleFeeds.length > 0) {
    // Full pass: feed exists, is discoverable, accessible, and non-empty
    status = 'pass';
    score = maxScore; // 4
    const feed = nonEmptyFeeds[0];
    details = `Product feed found (${feed.productCount} products, ${feed.type.toUpperCase()} format, discoverable via ${discoverableFeeds[0].source})`;
  } else if (accessibleFeeds.length > 0) {
    // Partial: feed accessible but missing discoverability or content
    status = 'partial';
    score = 2;
    const issues: string[] = [];
    if (discoverableFeeds.length === 0) issues.push('not linked in sitemap/robots.txt');
    if (nonEmptyFeeds.length === 0) issues.push('empty or unknown product count');
    details = `Feed accessible but ${issues.join(', ')}`;
  } else if (feeds.length > 0) {
    // Minimal: feed URLs found but not accessible
    status = 'partial';
    score = 1;
    details = `Feed detected at ${feeds[0].url} but not accessible`;
  } else if (platform.platform === 'Shopify') {
    status = 'partial';
    score = 1;
    details = 'Shopify detected — native feed should be at /products.json';
  } else {
    status = 'fail';
    score = 0;
    details = 'No product feed detected';
  }

  log.info({ domain, feedCount: feeds.length, score }, 'Product feed check complete');

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
        feeds: feeds.map((f) => ({ url: f.url, type: f.type, source: f.source, productCount: f.productCount })),
        primaryFeed: primaryFeed ? { url: primaryFeed.url, type: primaryFeed.type } : null,
      },
    },
    feeds,
  };
}
