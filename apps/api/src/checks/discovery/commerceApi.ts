import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import {
  calculateProtocolReadiness,
  detectCheckoutInfrastructure,
  detectAPIPatterns,
  ProtocolReadiness,
} from '../distribution/protocols';
import { ValidationResult } from '../../schema/validate';
import { SchemaQuality } from '../../schema/extract';

const log = createLogger('check:commerceApi');

export interface CommerceApiResult {
  check: Check;
  protocolReadiness: ProtocolReadiness;
  paymentRails: string[];
  checkoutApis: string[];
}

export async function checkCommerceApi(
  domain: string,
  html: string,
  productValidation: ValidationResult,
  schemaQuality: SchemaQuality
): Promise<CommerceApiResult> {
  const { id, name, category, maxScore } = CHECKS.D9;

  log.info({ domain }, 'Checking commerce API');

  const paymentRails = detectCheckoutInfrastructure(html);
  const checkoutApis = detectAPIPatterns(html);

  const hasGtin = !!(
    productValidation.schema?.gtin ||
    productValidation.schema?.sku ||
    productValidation.schema?.mpn
  );
  const hasOffer = !!productValidation.schema?.offers;

  const protocolReadiness = await calculateProtocolReadiness(
    domain,
    false, // hasFeed — not relevant for this check
    false, // hasRequiredFields
    productValidation.found,
    hasOffer,
    hasGtin,
    html
  );

  const hasStripe = paymentRails.includes('stripe');
  const hasShopifyCheckout = paymentRails.includes('shopifyCheckout');
  const ucpReady = protocolReadiness.commerce.ucp.status === 'ready';
  const mcpReady = protocolReadiness.commerce.mcp.status === 'ready';
  const shopifyStorefrontReady = protocolReadiness.commerce.shopifyStorefront.status === 'ready';

  let status: CheckStatus;
  let score: number;
  let details: string;

  if (ucpReady || mcpReady || shopifyStorefrontReady) {
    status = 'pass';
    score = maxScore; // 3
    const protocols = [];
    if (ucpReady) protocols.push('UCP');
    if (mcpReady) protocols.push('MCP');
    if (shopifyStorefrontReady) protocols.push('Shopify Storefront API');
    details = `Protocol/API ready: ${protocols.join(', ')}`;
  } else if (hasStripe || hasShopifyCheckout || checkoutApis.length > 0) {
    status = 'partial';
    score = 2;
    const infra = [...(hasStripe ? ['Stripe'] : []), ...(hasShopifyCheckout ? ['Shopify'] : []), ...checkoutApis];
    details = `Commerce infrastructure detected: ${infra.join(', ')}`;
  } else if (paymentRails.length > 0) {
    status = 'partial';
    score = 1;
    details = `Payment rails detected: ${paymentRails.join(', ')}`;
  } else {
    status = 'fail';
    score = 0;
    details = 'No commerce API or protocol manifest detected';
  }

  log.info({ domain, score, ucpReady, mcpReady }, 'Commerce API check complete');

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
        protocolReadiness,
        paymentRails,
        checkoutApis,
        ucpReady,
        mcpReady,
        shopifyStorefrontReady,
      },
    },
    protocolReadiness,
    paymentRails,
    checkoutApis,
  };
}
