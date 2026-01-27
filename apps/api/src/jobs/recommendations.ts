import { Check, Recommendation } from '@agent-pulse/shared';
import { ValidationResult } from '../schema/validate';

// Recommendation templates for each check
const recTemplates: Record<string, Omit<Recommendation, 'checkId' | 'checkName'>> = {
  D1: {
    priority: 'critical',
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
    priority: 'high',
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
  D3: {
    priority: 'medium',
    title: 'Create an XML sitemap',
    description: 'A sitemap helps AI agents efficiently discover all your products.',
    howToFix: `Create a sitemap.xml at your root domain:

1. For Shopify: Settings → Files → Create sitemap (automatic)
2. For WordPress: Install Yoast SEO or RankMath
3. For custom sites: Generate using tools like screaming frog or xml-sitemaps.com

Submit to Google Search Console for faster indexing.`,
  },
  N1: {
    priority: 'high',
    title: 'Improve page load speed',
    description: 'Slow pages cause AI agents to timeout before completing analysis.',
    howToFix: `Key optimizations:

1. Compress images (use WebP format, <100KB for thumbnails)
2. Enable browser caching
3. Minify CSS and JavaScript
4. Use a CDN (Cloudflare, Fastly)
5. Lazy load images below the fold
6. Reduce third-party scripts

Test with: pagespeed.web.dev`,
  },
  T1: {
    priority: 'high',
    title: 'Add complete Offer schema with pricing',
    description: 'AI agents need structured pricing data to make purchase recommendations.',
    howToFix: `Ensure your Offer schema includes:

{
  "@type": "Offer",
  "price": "29.99",
  "priceCurrency": "USD",
  "availability": "https://schema.org/InStock",
  "priceValidUntil": "2025-12-31",
  "seller": {
    "@type": "Organization",
    "name": "Your Store Name"
  }
}

Valid availability values:
- https://schema.org/InStock
- https://schema.org/OutOfStock
- https://schema.org/PreOrder`,
  },
  T2: {
    priority: 'critical',
    title: 'Enable HTTPS',
    description: 'AI agents will not complete transactions on insecure sites.',
    howToFix: `Install an SSL certificate:

1. Many hosts offer free SSL (Let's Encrypt)
2. Shopify/Squarespace include SSL by default
3. Use Cloudflare for free SSL on any site

After installing, redirect all HTTP to HTTPS.`,
  },
  R1: {
    priority: 'medium',
    title: 'Add Organization schema',
    description: 'Helps AI agents verify your business identity and build trust.',
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
  R2: {
    priority: 'high',
    title: 'Add MerchantReturnPolicy schema',
    description: 'AI agents verify return policies before recommending purchases.',
    howToFix: `Add to your product or policy pages:

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
</script>`,
  },
  P3: {
    priority: 'critical',
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
- Include: title, price, currency, availability, SKU/GTIN, images`,
  },
  P6: {
    priority: 'high',
    title: 'Add checkout infrastructure for AI commerce',
    description: 'AI agents need programmatic checkout access to complete purchases.',
    howToFix: `Integrate a checkout API:

Recommended options:
1. Stripe - Powers ChatGPT Shopping (ACP protocol)
2. Shopify Checkout - Native for Shopify stores
3. PayPal Checkout

For headless commerce:
- Expose checkout APIs via REST or GraphQL
- Document endpoints for agent discovery`,
  },
  P7: {
    priority: 'high',
    title: 'Add protocol manifest for agent commerce',
    description: 'UCP and MCP manifests allow AI agents to discover your commerce capabilities.',
    howToFix: `Add a commerce protocol manifest:

UCP (Universal Commerce Protocol):
Create /.well-known/ucp.json:
{
  "version": "1.0",
  "name": "Your Store",
  "capabilities": ["product-catalog", "checkout", "inventory"],
  "endpoints": {
    "products": "/api/products",
    "checkout": "/api/checkout"
  }
}

For ChatGPT Shopping (ACP):
Create /.well-known/ai-plugin.json following OpenAI plugin spec`,
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
