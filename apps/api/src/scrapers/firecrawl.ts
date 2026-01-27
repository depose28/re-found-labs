import { createLogger } from '../lib/logger';

const log = createLogger('scraper:firecrawl');

const FIRECRAWL_API_URL = 'https://api.firecrawl.dev/v1/scrape';

export interface FirecrawlResult {
  html: string;
  metadata: {
    title?: string;
    description?: string;
    ogImage?: string;
    firecrawlUsed: true;
  };
}

export async function scrapeWithFirecrawl(
  url: string,
  apiKey?: string,
  timeoutMs = 30000
): Promise<FirecrawlResult> {
  const key = apiKey || process.env.FIRECRAWL_API_KEY;

  if (!key) {
    throw new Error('FIRECRAWL_API_KEY not configured');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    log.info({ url }, 'Starting Firecrawl scrape');

    const response = await fetch(FIRECRAWL_API_URL, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['rawHtml'],
        waitFor: 3000, // Wait 3s for JS to render
        timeout: 25000,
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      log.error({ url, status: response.status, error: errorText }, 'Firecrawl API error');
      throw new Error(`Firecrawl API error: ${response.status}`);
    }

    const data = await response.json() as {
      success: boolean;
      data?: {
        rawHtml?: string;
        metadata?: {
          title?: string;
          description?: string;
          ogImage?: string;
        };
      };
    };

    if (!data.success || !data.data?.rawHtml) {
      log.error({ url }, 'Firecrawl returned no HTML');
      throw new Error('Firecrawl returned no HTML content');
    }

    log.info({
      url,
      htmlLength: data.data.rawHtml.length,
      title: data.data.metadata?.title,
    }, 'Firecrawl scrape completed');

    return {
      html: data.data.rawHtml,
      metadata: {
        title: data.data.metadata?.title,
        description: data.data.metadata?.description,
        ogImage: data.data.metadata?.ogImage,
        firecrawlUsed: true,
      },
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      log.warn({ url, timeoutMs }, 'Firecrawl request timed out');
      throw new Error(`Firecrawl timed out after ${timeoutMs}ms`);
    }

    log.error({ url, error: error.message }, 'Firecrawl scrape failed');
    throw error;
  }
}

// Smart scraping: try basic first, use Firecrawl if needed
export async function smartScrape(
  url: string,
  options: {
    forceFirecrawl?: boolean;
    firecrawlApiKey?: string;
  } = {}
): Promise<{ html: string; metadata: Record<string, any>; firecrawlUsed: boolean }> {
  const { forceFirecrawl = false, firecrawlApiKey } = options;

  // If forced, go straight to Firecrawl
  if (forceFirecrawl) {
    const result = await scrapeWithFirecrawl(url, firecrawlApiKey);
    return { html: result.html, metadata: result.metadata, firecrawlUsed: true };
  }

  // Try basic fetch first
  const { basicFetch, needsJsRendering } = await import('./basic');

  try {
    const basicResult = await basicFetch(url);

    // Check if we got enough content
    const jsCheck = needsJsRendering(basicResult.html);

    if (!jsCheck.needed) {
      log.info({ url, reason: jsCheck.reason }, 'Using basic fetch result (saved Firecrawl credit)');
      return {
        html: basicResult.html,
        metadata: { ...basicResult.metadata, firecrawlSkipped: true },
        firecrawlUsed: false,
      };
    }

    log.info({ url, reason: jsCheck.reason }, 'Falling back to Firecrawl');
  } catch (error) {
    log.warn({ url, error }, 'Basic fetch failed, trying Firecrawl');
  }

  // Fall back to Firecrawl
  const result = await scrapeWithFirecrawl(url, firecrawlApiKey);
  return { html: result.html, metadata: result.metadata, firecrawlUsed: true };
}
