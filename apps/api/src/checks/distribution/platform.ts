import { createLogger } from '../../lib/logger';

const log = createLogger('check:platform');

export interface PlatformDetection {
  detected: boolean;
  platform: string;
  confidence: 'high' | 'medium' | 'low';
  indicators: string[];
}

// Detect e-commerce platform from HTML and domain
export function detectPlatform(html: string, domain: string): PlatformDetection {
  const lowerHtml = html.toLowerCase();
  const lowerDomain = domain.toLowerCase();
  const indicators: string[] = [];

  // Shopify
  if (
    lowerHtml.includes('cdn.shopify.com') ||
    lowerHtml.includes('shopify.com/s/') ||
    lowerHtml.includes('myshopify.com') ||
    lowerHtml.includes('shopify-section')
  ) {
    indicators.push('Shopify CDN/assets');
    return { detected: true, platform: 'Shopify', confidence: 'high', indicators };
  }

  // WooCommerce
  if (
    lowerHtml.includes('woocommerce') ||
    lowerHtml.includes('wc-block') ||
    lowerHtml.includes('/wp-content/plugins/woocommerce')
  ) {
    indicators.push('WooCommerce markers');
    return { detected: true, platform: 'WooCommerce', confidence: 'high', indicators };
  }

  // Magento
  if (
    lowerHtml.includes('mage/') ||
    lowerHtml.includes('magento') ||
    lowerHtml.includes('varien') ||
    lowerHtml.includes('/static/frontend/')
  ) {
    indicators.push('Magento markers');
    return { detected: true, platform: 'Magento', confidence: 'high', indicators };
  }

  // BigCommerce
  if (
    lowerHtml.includes('bigcommerce') ||
    lowerHtml.includes('cdn11.bigcommerce') ||
    lowerHtml.includes('stencil-utils')
  ) {
    indicators.push('BigCommerce markers');
    return { detected: true, platform: 'BigCommerce', confidence: 'high', indicators };
  }

  // Salesforce Commerce Cloud (Demandware)
  if (
    lowerHtml.includes('demandware') ||
    lowerHtml.includes('dwanalytics') ||
    lowerHtml.includes('salesforce-commerce-cloud') ||
    lowerHtml.includes('sfcc')
  ) {
    indicators.push('SFCC markers');
    return { detected: true, platform: 'Salesforce Commerce Cloud', confidence: 'high', indicators };
  }

  // SAP Commerce (Hybris)
  if (
    lowerHtml.includes('hybris') ||
    lowerHtml.includes('/yacceleratorstorefront') ||
    lowerHtml.includes('sap-commerce') ||
    lowerHtml.includes('/occ/v2/')
  ) {
    indicators.push('SAP Commerce markers');
    return { detected: true, platform: 'SAP Commerce', confidence: 'high', indicators };
  }

  // Shopware
  if (lowerHtml.includes('shopware') || lowerHtml.includes('/shopware/')) {
    indicators.push('Shopware markers');
    return { detected: true, platform: 'Shopware', confidence: 'high', indicators };
  }

  // PrestaShop
  if (lowerHtml.includes('prestashop') || lowerHtml.includes('/modules/prestashop')) {
    indicators.push('PrestaShop markers');
    return { detected: true, platform: 'PrestaShop', confidence: 'high', indicators };
  }

  // Squarespace
  if (lowerHtml.includes('squarespace') || lowerDomain.includes('squarespace')) {
    indicators.push('Squarespace markers');
    return { detected: true, platform: 'Squarespace', confidence: 'high', indicators };
  }

  // Wix
  if (
    lowerHtml.includes('wix.com') ||
    lowerHtml.includes('wixsite.com') ||
    lowerHtml.includes('parastorage.com')
  ) {
    indicators.push('Wix markers');
    return { detected: true, platform: 'Wix', confidence: 'high', indicators };
  }

  // Custom platform with e-commerce signals
  const hasEcommerceSignals =
    lowerHtml.includes('add-to-cart') ||
    lowerHtml.includes('add to cart') ||
    lowerHtml.includes('product-price') ||
    lowerHtml.includes('buy-now') ||
    lowerHtml.includes('checkout');

  if (hasEcommerceSignals) {
    indicators.push('E-commerce patterns detected');
    return { detected: true, platform: 'Custom', confidence: 'medium', indicators };
  }

  return { detected: false, platform: 'Unknown', confidence: 'low', indicators: [] };
}
