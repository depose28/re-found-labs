import { Check, Recommendation } from '@agent-pulse/shared';
import { ValidationResult } from '../schema/validate';

// Recommendation templates for each check (v2 3-layer model)
const recTemplates: Record<string, Omit<Recommendation, 'checkId' | 'checkName'>> = {
  D1: {
    priority: 'critical',
    effort: 'quick',
    title: 'Allow AI shopping bots in robots.txt',
    description: 'Your robots.txt is blocking critical AI shopping agents like GPTBot and ClaudeBot.',
    howToFix: `Add these rules to your robots.txt file:

User-agent: GPTBot
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Anthropic-AI
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Amazonbot
Allow: /`,
  },
  D2: {
    priority: 'medium',
    effort: 'quick',
    title: 'Create an XML sitemap',
    description: 'A sitemap helps AI agents efficiently discover all your products.',
    howToFix: `Create a sitemap.xml at your root domain:

1. For Shopify: Settings → Files → Create sitemap (automatic)
2. For WordPress: Install Yoast SEO or RankMath
3. For custom sites: Generate using tools like screaming frog or xml-sitemaps.com

Submit to Google Search Console for faster indexing.`,
  },
  D3: {
    priority: 'high',
    effort: 'technical',
    title: 'Improve server response time (TTFB)',
    description: 'Sites with <400ms TTFB get 3x more AI agent citations. Slow servers cause agents to skip your site entirely.',
    howToFix: `Key optimizations to reduce TTFB:

1. Use a CDN (Cloudflare, Fastly, Vercel Edge)
2. Enable server-side caching (Redis, Memcached)
3. Optimize database queries
4. Use HTTP/2 or HTTP/3
5. Ensure your hosting is geographically close to users
6. Consider edge computing for dynamic content

Target: Under 400ms for optimal AI agent crawling.`,
  },
  D4: {
    priority: 'high',
    effort: 'quick',
    title: 'Add complete Product schema markup',
    description: 'AI agents need structured product data to understand and recommend your products.',
    howToFix: `Add this JSON-LD to your product pages:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Your Product Name",
  "description": "Detailed product description",
  "image": "https://yoursite.com/image.jpg",
  "sku": "SKU123",
  "brand": {
    "@type": "Brand",
    "name": "Your Brand"
  },
  "offers": {
    "@type": "Offer",
    "price": "29.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "seller": {
      "@type": "Organization",
      "name": "Your Store"
    }
  }
}
</script>`,
  },
  D5: {
    priority: 'low',
    effort: 'quick',
    title: 'Add WebSite schema with SearchAction',
    description: 'WebSite schema helps search engines understand your site structure and enables sitelinks search box.',
    howToFix: `Add to your homepage:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Your Store Name",
  "url": "https://yoursite.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://yoursite.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
</script>

This enables Google's sitelinks search box in search results.`,
  },
  D7: {
    priority: 'critical',
    effort: 'technical',
    title: 'Create a product feed for AI shopping protocols',
    description: 'Your products are invisible to AI shopping protocols without a feed.',
    howToFix: `Create a product feed:

For Shopify:
- Native feed at /products.json (already available)
- Ensure it's not blocked in robots.txt

For WooCommerce:
- Install "Product Feed PRO for WooCommerce" plugin
- Configure Google Merchant Center feed

For Custom Sites:
- Create a JSON or XML feed at /products.json or /feed.xml
- Include: title, price, currency, availability, SKU/GTIN, images

Link your feed in robots.txt or sitemap.xml for agent discovery.`,
  },
  D9: {
    priority: 'high',
    effort: 'technical',
    title: 'Add commerce API for agent transactions',
    description: 'AI agents need programmatic access to complete purchases via UCP or MCP protocols.',
    howToFix: `Options to enable agent commerce:

1. UCP Manifest: Create /.well-known/ucp.json:
{
  "version": "1.0",
  "name": "Your Store",
  "capabilities": ["product-catalog", "checkout", "inventory"],
  "endpoints": { "products": "/api/products", "checkout": "/api/checkout" }
}

2. MCP Server: Expose product data via MCP protocol

3. Shopify Storefront API: Enable headless commerce access

4. For ChatGPT Shopping (ACP): Create /.well-known/ai-plugin.json`,
  },
  T1: {
    priority: 'medium',
    effort: 'quick',
    title: 'Add Organization schema',
    description: 'Helps AI agents verify your business identity and build trust for purchase recommendations.',
    howToFix: `Add to your homepage:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Your Company Name",
  "url": "https://yoursite.com",
  "logo": "https://yoursite.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-800-555-1234",
    "contactType": "customer service"
  }
}
</script>`,
  },
  T2: {
    priority: 'high',
    effort: 'quick',
    title: 'Enable HTTPS and add return policy schema',
    description: "AI agents verify HTTPS and return policies before recommending purchases. Sites without both lose significant trust.",
    howToFix: `Two actions needed:

1. HTTPS: Install an SSL certificate
   - Many hosts offer free SSL (Let's Encrypt)
   - Shopify/Squarespace include SSL by default
   - Use Cloudflare for free SSL on any site

2. Return Policy: Add MerchantReturnPolicy schema:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "MerchantReturnPolicy",
  "applicableCountry": "US",
  "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
  "merchantReturnDays": 30,
  "returnMethod": "https://schema.org/ReturnByMail",
  "returnFees": "https://schema.org/FreeReturn"
}
</script>

Note: UCP 2026 requires "applicableCountry" on return policies.`,
  },
  X1: {
    priority: 'high',
    effort: 'technical',
    title: 'Achieve UCP compliance with offer and shipping schemas',
    description: 'UCP 2026 requires complete Offer, shipping details, and country-specific return policies for agent transactions.',
    howToFix: `Ensure your product pages include:

1. Offer schema with pricing:
{
  "@type": "Offer",
  "price": "29.99",
  "priceCurrency": "USD",
  "availability": "https://schema.org/InStock"
}

2. Shipping details (UCP 2026 requirement):
{
  "@type": "OfferShippingDetails",
  "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7 }
  },
  "shippingRate": { "@type": "MonetaryAmount", "value": "5.99", "currency": "USD" }
}

3. Add "applicableCountry" to your MerchantReturnPolicy schema.`,
  },
  X4: {
    priority: 'medium',
    effort: 'technical',
    title: 'Add payment method integrations',
    description: 'Multiple payment methods (Stripe, PayPal, Apple Pay, Google Pay) increase agent transaction success rates.',
    howToFix: `Integrate checkout infrastructure:

Recommended options:
1. Stripe - Powers ChatGPT Shopping (ACP protocol)
2. Shopify Checkout - Native for Shopify stores
3. PayPal Checkout
4. Apple Pay / Google Pay for mobile agents

Sites with 3+ payment methods score highest. Ensure payment scripts are present in page HTML for agent detection.`,
  },
};

export function generateRecommendations(
  checks: Check[],
  validations: Record<string, ValidationResult>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const check of checks) {
    if (check.status === 'pass') continue;

    const template = recTemplates[check.id];
    if (!template) continue;

    const rec: Recommendation = {
      checkId: check.id,
      checkName: check.name,
      ...template,
    };

    // Customize based on validation details
    const validation = validations[check.id];
    if (validation) {
      if (validation.missingFields.length > 0) {
        rec.description += ` Missing: ${validation.missingFields.join(', ')}.`;
      }
      if (validation.invalidFields.length > 0) {
        rec.description += ` Invalid: ${validation.invalidFields.join(', ')}.`;
      }
    }

    recommendations.push(rec);
  }

  // Sort by priority
  const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  recommendations.sort(
    (a, b) =>
      (priorityOrder[a.priority] ?? 3) - (priorityOrder[b.priority] ?? 3)
  );

  return recommendations;
}
