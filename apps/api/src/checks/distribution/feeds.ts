import { createLogger } from '../../lib/logger';
import { PlatformDetection } from './platform';

const log = createLogger('check:feeds');

export interface FeedInfo {
  url: string;
  type: 'json' | 'xml' | 'csv' | 'unknown';
  source: 'native' | 'robots' | 'sitemap' | 'html' | 'common-path' | 'guessed';
  accessible: boolean;
  productCount?: number;
  hasRequiredFields?: boolean;
  missingFields?: string[];
  isEmpty?: boolean;
}

// Check if a feed URL is accessible and parse product count
async function checkFeedUrl(url: string, timeoutMs = 5000): Promise<FeedInfo | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AgentPulseBot/1.0' },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type') || '';
    const text = await response.text();

    // Determine feed type
    let type: FeedInfo['type'] = 'unknown';
    if (contentType.includes('json') || text.trim().startsWith('{') || text.trim().startsWith('[')) {
      type = 'json';
    } else if (contentType.includes('xml') || text.includes('<?xml')) {
      type = 'xml';
    } else if (contentType.includes('csv')) {
      type = 'csv';
    }

    // Count products
    let productCount = 0;
    let hasRequiredFields = false;
    let missingFields: string[] = [];

    if (type === 'json') {
      try {
        const data = JSON.parse(text);
        const products = data.products || data.items || (Array.isArray(data) ? data : []);
        productCount = products.length;

        // Check for required fields in first product
        if (products.length > 0) {
          const sample = products[0];
          const hasTitle = !!(sample.title || sample.name);
          const hasPrice = sample.price !== undefined || sample.variants?.[0]?.price !== undefined;
          hasRequiredFields = hasTitle && hasPrice;

          if (!hasTitle) missingFields.push('title/name');
          if (!hasPrice) missingFields.push('price');
        }
      } catch {
        // JSON parse failed
      }
    } else if (type === 'xml') {
      // Count <item> or <product> or <url> tags
      const itemMatches = text.match(/<item[\s>]/gi) || [];
      const productMatches = text.match(/<product[\s>]/gi) || [];
      const entryMatches = text.match(/<entry[\s>]/gi) || [];
      productCount = Math.max(itemMatches.length, productMatches.length, entryMatches.length);

      // Check for price fields
      hasRequiredFields = text.includes('<g:price') || text.includes('<price');
      if (!hasRequiredFields) missingFields.push('price');
    }

    const isEmpty = productCount === 0;

    log.debug({ url, type, productCount, isEmpty }, 'Feed checked');

    return {
      url,
      type,
      source: 'common-path', // Will be overwritten by caller
      accessible: true,
      productCount,
      hasRequiredFields,
      missingFields: missingFields.length > 0 ? missingFields : undefined,
      isEmpty,
    };
  } catch (error) {
    log.debug({ url, error }, 'Feed check failed');
    return null;
  }
}

// Discover product feeds
export async function discoverFeeds(
  domain: string,
  html: string,
  robotsTxt: string | null,
  platform: PlatformDetection
): Promise<{ feeds: FeedInfo[]; primaryFeed: FeedInfo | null }> {
  const feeds: FeedInfo[] = [];
  const checkedUrls = new Set<string>();

  // Platform-specific native feeds
  if (platform.platform === 'Shopify') {
    const nativeUrl = `${domain}/products.json`;
    if (!checkedUrls.has(nativeUrl)) {
      checkedUrls.add(nativeUrl);
      const feed = await checkFeedUrl(nativeUrl);
      if (feed) {
        feeds.push({ ...feed, source: 'native' });
      }
    }
  }

  // Check robots.txt for feed references
  if (robotsTxt) {
    const feedPatterns = [
      /sitemap:\s*(.*?\.xml)/gi,
      /sitemap:\s*(.*?products.*?)/gi,
      /sitemap:\s*(.*?feed.*?)/gi,
    ];

    for (const pattern of feedPatterns) {
      let match;
      while ((match = pattern.exec(robotsTxt)) !== null) {
        let feedUrl = match[1].trim();
        try {
          feedUrl = new URL(feedUrl, domain).href;
          if (!checkedUrls.has(feedUrl)) {
            checkedUrls.add(feedUrl);
            const feed = await checkFeedUrl(feedUrl);
            if (feed) {
              feeds.push({ ...feed, source: 'robots' });
            }
          }
        } catch {
          // Invalid URL
        }
      }
    }
  }

  // Check HTML for feed links
  const htmlFeedPatterns = [
    /href=["']([^"']*products\.json[^"']*)["']/gi,
    /href=["']([^"']*feed[^"']*\.xml[^"']*)["']/gi,
    /href=["']([^"']*products[^"']*\.xml[^"']*)["']/gi,
    /type=["']application\/rss\+xml["'][^>]*href=["']([^"']+)["']/gi,
    /type=["']application\/atom\+xml["'][^>]*href=["']([^"']+)["']/gi,
  ];

  for (const pattern of htmlFeedPatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      try {
        const feedUrl = new URL(match[1], domain).href;
        if (!checkedUrls.has(feedUrl)) {
          checkedUrls.add(feedUrl);
          const feed = await checkFeedUrl(feedUrl);
          if (feed) {
            feeds.push({ ...feed, source: 'html' });
          }
        }
      } catch {
        // Invalid URL
      }
    }
  }

  // Common feed paths
  const commonPaths = [
    '/products.xml',
    '/feed/products',
    '/feed.xml',
    '/google-shopping.xml',
    '/google-merchant.xml',
    '/product-feed.xml',
  ];

  for (const path of commonPaths) {
    const feedUrl = `${domain}${path}`;
    if (!checkedUrls.has(feedUrl)) {
      checkedUrls.add(feedUrl);
      const feed = await checkFeedUrl(feedUrl);
      if (feed) {
        feeds.push({ ...feed, source: 'common-path' });
      }
    }
  }

  // Sort feeds by quality
  const sortedFeeds = feeds.sort((a, b) => {
    // Prefer accessible feeds with products
    if (a.accessible !== b.accessible) return a.accessible ? -1 : 1;
    if (a.isEmpty !== b.isEmpty) return a.isEmpty ? 1 : -1;
    if (a.productCount && b.productCount) return b.productCount - a.productCount;

    // Prefer native over discovered
    const sourceOrder = ['native', 'html', 'robots', 'sitemap', 'common-path', 'guessed'];
    return sourceOrder.indexOf(a.source) - sourceOrder.indexOf(b.source);
  });

  const primaryFeed = sortedFeeds.find(f => f.accessible && !f.isEmpty) || sortedFeeds[0] || null;

  log.info({ feedCount: feeds.length, primaryFeed: primaryFeed?.url }, 'Feed discovery complete');

  return { feeds: sortedFeeds, primaryFeed };
}
