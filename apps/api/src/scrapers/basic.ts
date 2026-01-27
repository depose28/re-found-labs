import { createLogger } from '../lib/logger';

const log = createLogger('scraper:basic');

const USER_AGENT = 'Mozilla/5.0 (compatible; AgentPulseBot/1.0; +https://refoundlabs.com) AppleWebKit/537.36';

export interface ScrapeResult {
  html: string;
  metadata: {
    statusCode: number;
    contentType: string;
    contentLength: number;
    redirected: boolean;
    finalUrl: string;
  };
}

export async function basicFetch(url: string, timeoutMs = 10000): Promise<ScrapeResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    log.debug({ url }, 'Starting basic fetch');

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    const html = await response.text();
    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10) || html.length;

    log.debug({
      url,
      statusCode: response.status,
      contentLength,
      redirected: response.redirected,
    }, 'Basic fetch completed');

    return {
      html,
      metadata: {
        statusCode: response.status,
        contentType,
        contentLength,
        redirected: response.redirected,
        finalUrl: response.url,
      },
    };
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      log.warn({ url, timeoutMs }, 'Basic fetch timed out');
      throw new Error(`Fetch timed out after ${timeoutMs}ms`);
    }

    log.error({ url, error: error.message }, 'Basic fetch failed');
    throw error;
  }
}

// Check if the HTML suggests we need JS rendering
export function needsJsRendering(html: string): { needed: boolean; reason: string } {
  const lowerHtml = html.toLowerCase();

  // Very short response often means JS-only
  if (html.length < 500) {
    return { needed: true, reason: 'Response too short (likely JS-only)' };
  }

  // Check for common JS framework indicators with empty body
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  const bodyContent = bodyMatch ? bodyMatch[1].trim() : '';

  // Empty or near-empty body with JS framework root
  if (bodyContent.length < 200) {
    if (lowerHtml.includes('id="__next"') || lowerHtml.includes('id="root"') || lowerHtml.includes('id="app"')) {
      return { needed: true, reason: 'JS framework detected with empty body' };
    }
  }

  // Noscript warnings
  if (lowerHtml.includes('enable javascript') || lowerHtml.includes('javascript is required')) {
    return { needed: true, reason: 'JavaScript required warning detected' };
  }

  // No product schema in static HTML for e-commerce-looking sites
  const hasEcommerceSignals = lowerHtml.includes('add to cart') ||
    lowerHtml.includes('add-to-cart') ||
    lowerHtml.includes('buy now') ||
    lowerHtml.includes('price');

  const hasProductSchema = lowerHtml.includes('"@type":"product"') ||
    lowerHtml.includes('"@type": "product"') ||
    lowerHtml.includes("'@type':'product'");

  if (hasEcommerceSignals && !hasProductSchema && bodyContent.length < 5000) {
    return { needed: true, reason: 'E-commerce signals but no schema in static HTML' };
  }

  return { needed: false, reason: 'Static HTML appears sufficient' };
}
