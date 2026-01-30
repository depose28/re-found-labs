import { Check, Recommendation } from '@agent-pulse/shared';
import { ValidationResult } from '../schema/validate';

// Recommendation templates for each check (v2 3-layer model)
const recTemplates: Record<string, Omit<Recommendation, 'checkId' | 'checkName'>> = {
  D1: {
    priority: 'critical',
    effort: 'quick',
    affects: ['ChatGPT Shopping', 'Google AI Mode', 'Perplexity', 'Claude', 'Amazon Rufus'],
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
  D11: {
    priority: 'low',
    effort: 'quick',
    affects: ['ChatGPT', 'Claude', 'Perplexity', 'Google AI Mode'],
    title: 'Add an llms.txt file',
    description: 'llms.txt is an emerging standard that tells AI agents how to interact with your site content. Adding one signals AI-readiness.',
    howToFix: `Create a file called llms.txt at your site root (e.g., yourstore.com/llms.txt).

Include:
- A brief description of your business
- Key product categories
- Links to important pages (products, policies, FAQ)
- Any usage guidelines for AI agents

Example:
# YourStore
> Online store for premium outdoor gear

## Key Pages
- /products - Full product catalog
- /faq - Frequently asked questions
- /policies/returns - Return policy
- /policies/shipping - Shipping information

## Usage Guidelines
AI agents may reference our product information and pricing.

Learn more: https://llmstxt.org`,
  },
  D2: {
    priority: 'medium',
    effort: 'quick',
    affects: ['Google AI Mode', 'Perplexity'],
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
    affects: ['All AI platforms'],
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
    affects: ['ChatGPT Shopping', 'Google AI Mode', 'Perplexity', 'Klarna APP'],
    title: 'Add structured product data',
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
  D6: {
    priority: 'medium',
    effort: 'quick',
    affects: ['ChatGPT', 'Google AI Mode', 'Perplexity'],
    title: 'Add FAQ structured data',
    description: 'AI agents match user questions directly to FAQ answers when deciding what to cite. Sites with FAQ structured data get cited more often in AI-generated responses.',
    howToFix: `Add FAQPage JSON-LD to pages where you answer common questions:

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is your return policy?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "We accept returns within 30 days of purchase. Items must be unused and in original packaging. Free return shipping is included."
      }
    },
    {
      "@type": "Question",
      "name": "How long does shipping take?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Standard shipping takes 3-5 business days. Express shipping is available for next-day delivery."
      }
    }
  ]
}
</script>

Tips:
- Include 5+ questions for full score
- Cover return policy, shipping, product care, sizing
- Use real questions your customers actually ask
- Place on product pages, FAQ pages, or homepage`,
  },
  D5: {
    priority: 'low',
    effort: 'quick',
    affects: ['Google AI Mode'],
    title: 'Add site structure data',
    description: 'Site structure data helps search engines and AI agents understand your site layout and enables sitelinks search box.',
    howToFix: `Add this JSON-LD to your homepage:

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
    affects: ['Google AI Mode', 'Klarna APP', 'ChatGPT Shopping'],
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
    affects: ['ChatGPT Shopping', 'Klarna APP'],
    title: 'Enable AI checkout integration',
    description: 'AI agents need a way to complete purchases on your site.',
    howToFix: `Options to enable agent commerce:

1. Create /.well-known/ucp.json:
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
    affects: ['All AI platforms'],
    title: 'Add business identity data',
    description: 'Helps AI agents verify your business identity and build trust for purchase recommendations.',
    howToFix: `Add this JSON-LD to your homepage:

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
  // T2 is handled dynamically in generateRecommendations — see getT2Template()
  X1: {
    priority: 'high',
    effort: 'technical',
    affects: ['ChatGPT Shopping', 'Google AI Mode', 'Klarna APP'],
    title: 'Complete your product checkout data (shipping & returns)',
    description: 'AI checkout protocols require complete product pricing, shipping details, and country-specific return policies.',
    howToFix: `Ensure your product pages include:

1. Product pricing data:
{
  "@type": "Offer",
  "price": "29.99",
  "priceCurrency": "USD",
  "availability": "https://schema.org/InStock"
}

2. Shipping details:
{
  "@type": "OfferShippingDetails",
  "shippingDestination": { "@type": "DefinedRegion", "addressCountry": "US" },
  "deliveryTime": {
    "@type": "ShippingDeliveryTime",
    "transitTime": { "@type": "QuantitativeValue", "minValue": 3, "maxValue": 7 }
  },
  "shippingRate": { "@type": "MonetaryAmount", "value": "5.99", "currency": "USD" }
}

3. Add "applicableCountry" to your return policy data.`,
  },
  X4: {
    priority: 'medium',
    effort: 'technical',
    affects: ['ChatGPT Shopping', 'Klarna APP'],
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

// T2 template varies based on what actually failed (HTTPS vs return policy vs both)
function getT2Template(check: Check): Omit<Recommendation, 'checkId' | 'checkName'> {
  const isHttps = check.data?.isHttps as boolean | undefined;
  const returnPolicyFound = check.data?.returnPolicyFound as boolean | undefined;

  const httpsHowToFix = `Install an SSL certificate:
- Many hosts offer free SSL (Let's Encrypt)
- Shopify/Squarespace include SSL by default
- Use Cloudflare for free SSL on any site`;

  const returnPolicyHowToFix = `Add return policy data to your site using JSON-LD:

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
</script>`;

  if (!isHttps && !returnPolicyFound) {
    return {
      priority: 'high',
      effort: 'quick',
      affects: ['ChatGPT Shopping', 'Google AI Mode', 'Klarna APP'],
      title: 'Add HTTPS and return policy information',
      description: 'AI agents verify HTTPS and return policies before recommending purchases. Sites without both lose significant trust.',
      howToFix: `Two actions needed:\n\n1. HTTPS:\n${httpsHowToFix}\n\n2. Return Policy:\n${returnPolicyHowToFix}`,
    };
  }

  if (!isHttps) {
    return {
      priority: 'high',
      effort: 'quick',
      affects: ['ChatGPT Shopping', 'Google AI Mode', 'Klarna APP'],
      title: 'Enable HTTPS for your site',
      description: 'AI agents require HTTPS before recommending purchases. Your site is not using a secure connection.',
      howToFix: httpsHowToFix,
    };
  }

  // HTTPS passes but return policy missing/incomplete
  return {
    priority: 'high',
    effort: 'quick',
    affects: ['ChatGPT Shopping', 'Google AI Mode', 'Klarna APP'],
    title: 'Add return policy information',
    description: 'AI agents check return policies before recommending purchases. Adding this data increases trust significantly.',
    howToFix: returnPolicyHowToFix,
  };
}

export function generateRecommendations(
  checks: Check[],
  validations: Record<string, ValidationResult>
): Recommendation[] {
  const recommendations: Recommendation[] = [];

  for (const check of checks) {
    if (check.status === 'pass') continue;

    // T2 uses dynamic template based on what actually failed
    const template = check.id === 'T2'
      ? getT2Template(check)
      : recTemplates[check.id];
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
