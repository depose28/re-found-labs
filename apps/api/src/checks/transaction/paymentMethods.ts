import { Check, CheckStatus, CHECKS } from '@agent-pulse/shared';
import { createLogger } from '../../lib/logger';
import { detectPlatform, PlatformDetection } from '../distribution/platform';
import { detectCheckoutInfrastructure } from '../distribution/protocols';

const log = createLogger('check:paymentMethods');

export interface PaymentMethodsResult {
  check: Check;
  platformDetection: PlatformDetection;
  paymentRails: string[];
}

export function checkPaymentMethods(
  html: string,
  domain: string
): PaymentMethodsResult {
  const { id, name, category, maxScore } = CHECKS.X4;

  const platform = detectPlatform(html, domain);
  const paymentRails = detectCheckoutInfrastructure(html);

  let status: CheckStatus;
  let score: number;
  let details: string;

  const paymentCount = paymentRails.length;

  if (paymentCount >= 3) {
    status = 'pass';
    score = maxScore; // 5
    details = `${paymentCount} payment methods detected: ${formatRails(paymentRails)}`;
  } else if (paymentCount >= 1) {
    status = 'partial';
    score = 3;
    details = `${paymentCount} payment method(s): ${formatRails(paymentRails)}`;
  } else if (platform.detected && platform.platform !== 'Unknown') {
    status = 'partial';
    score = 1;
    details = `${platform.platform} platform detected but no payment scripts found`;
  } else {
    status = 'fail';
    score = 0;
    details = 'No payment methods or e-commerce platform detected';
  }

  log.info({
    platform: platform.platform,
    paymentCount,
    score,
  }, 'Payment methods check complete');

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
        platform: platform.platform,
        confidence: platform.confidence,
        paymentRails,
        paymentCount,
      },
    },
    platformDetection: platform,
    paymentRails,
  };
}

function formatRails(rails: string[]): string {
  const labels: Record<string, string> = {
    stripe: 'Stripe',
    shopifyCheckout: 'Shopify Checkout',
    paypal: 'PayPal',
    klarna: 'Klarna',
    googlePay: 'Google Pay',
    applePay: 'Apple Pay',
  };
  return rails.map((r) => labels[r] || r).join(', ');
}
