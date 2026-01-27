import { createLogger } from '../../lib/logger';

const log = createLogger('check:protocols');

export interface ProtocolStatus {
  status: 'ready' | 'partial' | 'not_ready';
  reason: string;
}

export interface ProtocolReadiness {
  discovery: {
    googleShopping: ProtocolStatus;
    klarnaApp: ProtocolStatus;
    answerEngines: ProtocolStatus;
  };
  commerce: {
    ucp: ProtocolStatus;
    acp: ProtocolStatus;
    mcp: ProtocolStatus;
  };
  payments: {
    rails: string[];
  };
  readyCount: number;
  partialCount: number;
}

// Check for UCP manifest
export async function checkUCPManifest(
  domain: string
): Promise<{ found: boolean; version?: string; capabilities?: string[] }> {
  const paths = [
    '/.well-known/ucp.json',
    '/.well-known/commerce.json',
    '/api/commerce/manifest',
  ];

  for (const path of paths) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${domain}${path}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AgentPulseBot/1.0' },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const manifest = await response.json() as { version?: string; capabilities?: string[] };
        return {
          found: true,
          version: manifest.version,
          capabilities: manifest.capabilities || [],
        };
      }
    } catch {
      // Continue to next path
    }
  }

  return { found: false };
}

// Check for MCP server
export async function checkMCPServer(
  domain: string,
  html: string
): Promise<{ found: boolean; type?: string }> {
  const paths = [
    '/.well-known/mcp.json',
    '/mcp/capabilities',
    '/.well-known/ai-plugin.json',
  ];

  // Check for SAP Commerce indicators
  const sapIndicators = ['/occ/v2/', '/rest/v2/', 'sap-commerce', 'spartacus'];
  const hasSAPCommerce = sapIndicators.some((ind) =>
    html.toLowerCase().includes(ind)
  );

  if (hasSAPCommerce) {
    return { found: true, type: 'sap-commerce' };
  }

  for (const path of paths) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${domain}${path}`, {
        signal: controller.signal,
        headers: { 'User-Agent': 'AgentPulseBot/1.0' },
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return {
          found: true,
          type: path.includes('ai-plugin') ? 'openai-plugin' : 'mcp',
        };
      }
    } catch {
      // Continue to next path
    }
  }

  return { found: false };
}

// Detect payment/checkout infrastructure
export function detectCheckoutInfrastructure(html: string): string[] {
  const detectedRails: string[] = [];

  const indicators: Record<string, RegExp> = {
    stripe: /stripe\.js|js\.stripe\.com|stripe-button|stripe\.com\/v3/i,
    shopifyCheckout: /checkout\.shopify\.com|shopify.*checkout|shopify_pay/i,
    paypal: /paypal\.com\/sdk|paypalobjects\.com|braintree/i,
    klarna: /klarna.*payments|x\.klarnacdn\.net|klarna-checkout/i,
    googlePay: /pay\.google\.com|gpay|google-pay/i,
    applePay: /apple-pay-button|applepaysession|apple\.com\/apple-pay/i,
  };

  for (const [name, regex] of Object.entries(indicators)) {
    if (regex.test(html)) {
      detectedRails.push(name);
    }
  }

  return detectedRails;
}

// Detect API patterns
export function detectAPIPatterns(html: string): string[] {
  const patterns: string[] = [];

  if (/graphql|\/graphql/i.test(html)) patterns.push('graphql');
  if (/\/api\/v\d|\/rest\/v\d/i.test(html)) patterns.push('rest');
  if (/headless|storefront-api|commerce-api/i.test(html.toLowerCase())) {
    patterns.push('headless');
  }

  return patterns;
}

// Calculate full protocol readiness
export async function calculateProtocolReadiness(
  domain: string,
  hasFeed: boolean,
  hasRequiredFields: boolean,
  hasProduct: boolean,
  hasOffer: boolean,
  hasGtin: boolean,
  html: string
): Promise<ProtocolReadiness> {
  const paymentRails = detectCheckoutInfrastructure(html);
  const apiPatterns = detectAPIPatterns(html);
  const hasStripe = paymentRails.includes('stripe');

  // Check manifests in parallel
  const [ucpResult, mcpResult] = await Promise.all([
    checkUCPManifest(domain),
    checkMCPServer(domain, html),
  ]);

  const gtinCoverage = hasGtin ? 0.9 : hasRequiredFields ? 0.5 : 0;

  const result: ProtocolReadiness = {
    discovery: {
      googleShopping: { status: 'not_ready', reason: '' },
      klarnaApp: { status: 'not_ready', reason: '' },
      answerEngines: { status: 'not_ready', reason: '' },
    },
    commerce: {
      ucp: { status: 'not_ready', reason: '' },
      acp: { status: 'not_ready', reason: '' },
      mcp: { status: 'not_ready', reason: '' },
    },
    payments: { rails: paymentRails },
    readyCount: 0,
    partialCount: 0,
  };

  // Discovery Layer
  if (hasFeed && hasRequiredFields && hasGtin) {
    result.discovery.googleShopping = { status: 'ready', reason: 'Feed with required fields + GTIN' };
    result.readyCount++;
  } else if (hasFeed && hasRequiredFields) {
    result.discovery.googleShopping = { status: 'partial', reason: 'Feed valid but missing GTIN' };
    result.partialCount++;
  } else if (hasFeed) {
    result.discovery.googleShopping = { status: 'partial', reason: 'Feed missing required fields' };
    result.partialCount++;
  } else {
    result.discovery.googleShopping = { status: 'not_ready', reason: 'No product feed detected' };
  }

  if (hasFeed && gtinCoverage >= 0.8) {
    result.discovery.klarnaApp = { status: 'ready', reason: 'Feed + GTIN identifiers present' };
    result.readyCount++;
  } else if (hasFeed && gtinCoverage >= 0.5) {
    result.discovery.klarnaApp = { status: 'partial', reason: 'Feed found, GTIN coverage <80%' };
    result.partialCount++;
  } else if (hasFeed) {
    result.discovery.klarnaApp = { status: 'partial', reason: 'Feed exists but missing GTIN/SKU' };
    result.partialCount++;
  } else {
    result.discovery.klarnaApp = { status: 'not_ready', reason: 'No feed or product identifiers' };
  }

  if (hasProduct && hasOffer) {
    result.discovery.answerEngines = { status: 'ready', reason: 'Complete Product + Offer schema' };
    result.readyCount++;
  } else if (hasProduct) {
    result.discovery.answerEngines = { status: 'partial', reason: 'Product schema but no Offer' };
    result.partialCount++;
  } else {
    result.discovery.answerEngines = { status: 'not_ready', reason: 'No structured data detected' };
  }

  // Commerce Layer
  if (ucpResult.found) {
    result.commerce.ucp = { status: 'ready', reason: `UCP manifest v${ucpResult.version || '?'} detected` };
    result.readyCount++;
  } else if (apiPatterns.length > 0) {
    result.commerce.ucp = { status: 'partial', reason: `Commerce API patterns: ${apiPatterns.join(', ')}` };
    result.partialCount++;
  } else {
    result.commerce.ucp = { status: 'not_ready', reason: 'No UCP manifest detected' };
  }

  const hasOpenAIPlugin = mcpResult.type === 'openai-plugin';
  if (hasStripe && hasOpenAIPlugin) {
    result.commerce.acp = { status: 'ready', reason: 'Stripe + OpenAI plugin detected' };
    result.readyCount++;
  } else if (hasStripe) {
    result.commerce.acp = { status: 'partial', reason: 'Stripe detected, no AI plugin' };
    result.partialCount++;
  } else if (paymentRails.length > 0) {
    result.commerce.acp = { status: 'partial', reason: 'Payment rails detected, needs Stripe' };
    result.partialCount++;
  } else {
    result.commerce.acp = { status: 'not_ready', reason: 'No Stripe or payment integration' };
  }

  if (mcpResult.found && mcpResult.type !== 'openai-plugin') {
    result.commerce.mcp = { status: 'ready', reason: `MCP server detected (${mcpResult.type})` };
    result.readyCount++;
  } else if (apiPatterns.includes('headless') || apiPatterns.includes('graphql')) {
    result.commerce.mcp = { status: 'partial', reason: 'Headless commerce patterns detected' };
    result.partialCount++;
  } else {
    result.commerce.mcp = { status: 'not_ready', reason: 'No MCP server detected' };
  }

  return result;
}
