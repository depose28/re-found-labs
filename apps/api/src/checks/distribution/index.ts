import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { detectPlatform, PlatformDetection } from './platform';
import { discoverFeeds, FeedInfo } from './feeds';
import {
  calculateProtocolReadiness,
  detectCheckoutInfrastructure,
  detectAPIPatterns,
  ProtocolReadiness,
} from './protocols';
import { SchemaQuality } from '../../schema/extract';
import { ValidationResult } from '../../schema/validate';

const log = createLogger('check:distribution');

export interface DistributionResult {
  checks: Check[];
  totalScore: number;
  maxScore: number;
  platformDetection: PlatformDetection;
  feeds: FeedInfo[];
  protocolReadiness: ProtocolReadiness;
  paymentRails: string[];
  checkoutApis: string[];
}

export async function performDistributionChecks(
  domain: string,
  html: string,
  robotsTxt: string | null,
  productValidation: ValidationResult,
  schemaQuality: SchemaQuality
): Promise<DistributionResult> {
  log.info({ domain }, 'Starting distribution checks');

  // Platform detection
  const platform = detectPlatform(html, domain);

  // Feed discovery
  const { feeds, primaryFeed } = await discoverFeeds(domain, html, robotsTxt, platform);

  // Payment/API detection
  const paymentRails = detectCheckoutInfrastructure(html);
  const checkoutApis = detectAPIPatterns(html);

  // Extract schema info for protocol readiness
  const hasGtin = !!(
    productValidation.schema?.gtin ||
    productValidation.schema?.sku ||
    productValidation.schema?.mpn
  );
  const hasOffer = !!(productValidation.schema?.offers);
  const hasFeed = feeds.length > 0 && feeds.some((f) => f.accessible);

  // Protocol readiness
  const protocolReadiness = await calculateProtocolReadiness(
    domain,
    hasFeed,
    primaryFeed?.hasRequiredFields || false,
    productValidation.found,
    hasOffer,
    hasGtin,
    html
  );

  const checks: Check[] = [];
  let totalScore = 0;
  const maxScore = 15;

  // P1: Platform Detection (1 point)
  const p1: Check = {
    id: CHECKS.P1.id,
    name: CHECKS.P1.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P1.maxScore,
    details: '',
    data: { platform: platform.platform, confidence: platform.confidence, indicators: platform.indicators },
  };

  if (platform.detected && platform.platform !== 'Custom') {
    p1.status = 'pass';
    p1.score = 1;
    p1.details = `${platform.platform} platform detected`;
  } else if (platform.platform === 'Custom' && platform.confidence === 'medium') {
    p1.status = 'pass';
    p1.score = 1;
    p1.details = 'Custom e-commerce platform with good infrastructure';
  } else if (platform.platform === 'Custom') {
    p1.status = 'partial';
    p1.score = 0;
    p1.details = 'Custom platform detected (limited e-commerce signals)';
  } else {
    p1.details = 'No e-commerce platform signals detected';
  }
  checks.push(p1);
  totalScore += p1.score;

  // P2: Structured Data Complete (3 points)
  const p2: Check = {
    id: CHECKS.P2.id,
    name: CHECKS.P2.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P2.maxScore,
    details: '',
    data: {
      hasProduct: productValidation.found,
      hasOffer,
      hasGtin,
      schemaQuality: schemaQuality.level,
    },
  };

  if (productValidation.found && hasOffer && hasGtin) {
    p2.status = 'pass';
    p2.score = 3;
    p2.details = 'Complete: Product + Offer + GTIN/SKU';
  } else if (productValidation.found && hasOffer) {
    p2.status = 'partial';
    p2.score = 2;
    p2.details = 'Product + Offer present, missing GTIN/SKU';
  } else if (schemaQuality.hasAggregateOffer || schemaQuality.hasItemList) {
    p2.status = 'partial';
    p2.score = 2;
    p2.details = schemaQuality.hasItemList
      ? `ItemList with ${schemaQuality.productCount || 'multiple'} products detected`
      : 'AggregateOffer schema detected (price range data)';
  } else if (productValidation.found) {
    p2.status = 'partial';
    p2.score = 1;
    p2.details = 'Product schema only, missing Offer and identifiers';
  } else {
    p2.details = 'No structured product data found';
  }
  checks.push(p2);
  totalScore += p2.score;

  // P3: Product Feed Exists (3 points)
  const nonEmptyFeeds = feeds.filter((f) => !f.isEmpty && f.productCount && f.productCount > 0);
  const emptyFeeds = feeds.filter((f) => f.isEmpty);
  const nonEmptyPrimaryFeed = nonEmptyFeeds[0];

  const p3: Check = {
    id: CHECKS.P3.id,
    name: CHECKS.P3.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P3.maxScore,
    details: '',
    data: { feeds: feeds.map((f) => ({ url: f.url, type: f.type, productCount: f.productCount })) },
  };

  if (nonEmptyPrimaryFeed) {
    p3.status = 'pass';
    p3.score = 3;
    p3.details = `Feed found (${nonEmptyPrimaryFeed.productCount} products at ${nonEmptyPrimaryFeed.url})`;
  } else if (emptyFeeds.length > 0) {
    p3.status = 'fail';
    p3.score = 0;
    p3.details = `Feed exists at ${emptyFeeds[0].url} but is empty (0 products)`;
  } else if (feeds.length > 0) {
    p3.status = 'partial';
    p3.score = 1;
    p3.details = `Feed detected at ${feeds[0].url} but could not verify product count`;
  } else if (platform.platform === 'Shopify') {
    p3.status = 'partial';
    p3.score = 1;
    p3.details = 'Shopify detected — native feed should be at /products.json';
  } else {
    p3.details = 'No product feed detected';
  }
  checks.push(p3);
  totalScore += p3.score;

  // P4: Feed Discoverable (2 points)
  const discoverableSources = ['robots', 'sitemap', 'html', 'native'];
  const discoverableFeeds = feeds.filter((f) => discoverableSources.includes(f.source));

  const p4: Check = {
    id: CHECKS.P4.id,
    name: CHECKS.P4.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P4.maxScore,
    details: '',
    data: {},
  };

  if (discoverableFeeds.length > 0) {
    p4.status = 'pass';
    p4.score = 2;
    p4.details = `Feed linked via ${discoverableFeeds[0].source}`;
    p4.data = { source: discoverableFeeds[0].source };
  } else if (feeds.length > 0) {
    p4.status = 'partial';
    p4.score = 1;
    p4.details = 'Feed exists but not in sitemap/robots.txt/HTML';
  } else {
    p4.details = 'No discoverable feed reference';
  }
  checks.push(p4);
  totalScore += p4.score;

  // P5: Feed Accessible (2 points)
  const accessibleFeeds = feeds.filter((f) => f.accessible);

  const p5: Check = {
    id: CHECKS.P5.id,
    name: CHECKS.P5.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P5.maxScore,
    details: '',
    data: {},
  };

  if (accessibleFeeds.length > 0 && primaryFeed?.hasRequiredFields) {
    p5.status = 'pass';
    p5.score = 2;
    p5.details = `Feed accessible (${primaryFeed.type.toUpperCase()} format)`;
    p5.data = { format: primaryFeed.type, url: primaryFeed.url };
  } else if (accessibleFeeds.length > 0) {
    p5.status = 'partial';
    p5.score = 1;
    p5.details = `Feed accessible but ${primaryFeed?.missingFields?.join(', ') || 'incomplete'}`;
  } else if (feeds.length > 0) {
    p5.details = 'Feed URLs found but not accessible';
  } else {
    p5.details = 'No feed to test';
  }
  checks.push(p5);
  totalScore += p5.score;

  // P6: Commerce API Indicators (2 points)
  const hasStripe = paymentRails.includes('stripe');
  const hasShopifyCheckout = paymentRails.includes('shopifyCheckout');

  const p6: Check = {
    id: CHECKS.P6.id,
    name: CHECKS.P6.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P6.maxScore,
    details: '',
    data: { checkoutApis, paymentRails },
  };

  if (hasStripe || hasShopifyCheckout) {
    p6.status = 'pass';
    p6.score = 2;
    p6.details = `Checkout infrastructure: ${paymentRails.join(', ')}`;
  } else if (paymentRails.length > 0) {
    p6.status = 'partial';
    p6.score = 1;
    p6.details = `Payment rails: ${paymentRails.join(', ')}`;
  } else if (checkoutApis.length > 0) {
    p6.status = 'partial';
    p6.score = 1;
    p6.details = `API patterns: ${checkoutApis.join(', ')}`;
  } else {
    p6.details = 'No checkout infrastructure detected';
  }
  checks.push(p6);
  totalScore += p6.score;

  // P7: Protocol Manifest (2 points)
  const ucpReady = protocolReadiness.commerce.ucp.status === 'ready';
  const mcpReady = protocolReadiness.commerce.mcp.status === 'ready';

  const p7: Check = {
    id: CHECKS.P7.id,
    name: CHECKS.P7.name,
    category: 'distribution',
    status: 'fail',
    score: 0,
    maxScore: CHECKS.P7.maxScore,
    details: '',
    data: { protocolReadiness, ucpReady, mcpReady },
  };

  if (ucpReady || mcpReady) {
    p7.status = 'pass';
    p7.score = 2;
    const protocols = [];
    if (ucpReady) protocols.push('UCP');
    if (mcpReady) protocols.push('MCP');
    p7.details = `Protocol manifest: ${protocols.join(', ')}`;
  } else if (
    protocolReadiness.commerce.ucp.status === 'partial' ||
    protocolReadiness.commerce.mcp.status === 'partial'
  ) {
    p7.status = 'partial';
    p7.score = 1;
    p7.details = 'Commerce patterns detected, no manifest';
  } else {
    p7.details = 'No UCP or MCP manifest detected';
  }
  checks.push(p7);
  totalScore += p7.score;

  log.info({ totalScore, maxScore, checksCount: checks.length }, 'Distribution checks complete');

  return {
    checks,
    totalScore,
    maxScore,
    platformDetection: platform,
    feeds,
    protocolReadiness,
    paymentRails,
    checkoutApis,
  };
}

export { detectPlatform, type PlatformDetection } from './platform';
export { discoverFeeds, type FeedInfo } from './feeds';
export {
  calculateProtocolReadiness,
  detectCheckoutInfrastructure,
  type ProtocolReadiness,
  type ProtocolStatus,
} from './protocols';
