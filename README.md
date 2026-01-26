# Agent Pulse by Re:found Labs

**AI Shopping Bot Readiness Analyzer for E-commerce**

Agent Pulse is a free diagnostic tool that evaluates how well your e-commerce store is optimized for AI shopping agents like ChatGPT, Claude, Perplexity, and other LLM-powered assistants that increasingly drive product discovery and purchasing decisions.

📧 **Contact**: hello@refoundlabs.com

---

## What is Agent Pulse?

AI shopping agents are fundamentally changing how consumers discover and purchase products. These agents crawl websites, extract product data, and make recommendations to users. If your store isn't optimized for these agents, you're invisible to a growing segment of buyers.

**The Reality**: 73% of e-commerce stores fail basic AI agent readiness checks. Most sites were built for human browsers, not machine readers.

Agent Pulse analyzes your store across **five critical dimensions** and provides:
- A **0-100 score** with letter grade (A+ to F)
- **Category-by-category breakdown** with specific issues identified
- **Prioritized recommendations** with code snippets to fix problems
- **Downloadable PDF report** for stakeholder sharing

---

## What We Test

### 1. 🔍 Discovery (Bot Access & Product Data) — 35 pts

**AI Bot Access via robots.txt**

We verify your site explicitly allows these critical AI crawlers:

| Bot | Owner | Purpose |
|-----|-------|---------|
| GPTBot | OpenAI | ChatGPT's primary crawler |
| OAI-SearchBot | OpenAI | OpenAI's search functionality |
| ChatGPT-User | OpenAI | ChatGPT browser mode |
| ClaudeBot | Anthropic | Claude's web access |
| Anthropic-AI | Anthropic | Anthropic's general crawler |
| PerplexityBot | Perplexity | Perplexity AI search |
| Google-Extended | Google | Gemini/Bard training data |
| Amazonbot | Amazon | Alexa and Amazon search |
| Applebot-Extended | Apple | Siri and Apple Intelligence |
| Bytespider | ByteDance/TikTok | TikTok's product discovery |

**How we check**: We fetch your `/robots.txt` file and parse the User-agent rules to determine if each bot is explicitly allowed, disallowed, or not mentioned (implicit allow).

**Product Schema (schema.org/Product)**

We validate your structured data includes:
- ✅ Product name (`name`)
- ✅ Description (`description`)
- ✅ SKU/GTIN identifiers (`sku`, `gtin`, `gtin13`, `gtin14`)
- ✅ Brand information (`brand.name`)
- ✅ Product images (`image`)
- ✅ Availability status (`availability`)

**How we check**: We scrape your page and extract JSON-LD, Microdata, and RDFa structured data, then validate against schema.org Product specifications.

---

### 2. ⚡ Performance (Speed & Core Web Vitals) — 15 pts

We pull real performance data from **Google PageSpeed Insights API**, which reflects actual Chrome User Experience Report (CrUX) data from real users.

**Metrics we measure**:

| Metric | Full Name | What It Measures |
|--------|-----------|------------------|
| LCP | Largest Contentful Paint | Loading performance (target: < 2.5s) |
| FID | First Input Delay | Interactivity (target: < 100ms) |
| CLS | Cumulative Layout Shift | Visual stability (target: < 0.1) |
| FCP | First Contentful Paint | Initial render speed |
| TTFB | Time to First Byte | Server response time |

**Overall Performance Score**: 0-100 from PageSpeed Insights, weighted across all Core Web Vitals.

**Why this matters for AI agents**: Most AI agents operate with strict timeouts (often 5-10 seconds). If your page takes too long to load or render, agents abandon the request and recommend faster competitors.

---

### 3. 💳 Transaction (Purchasability Signals) — 20 pts

**Offer Schema (schema.org/Offer)**

We validate your pricing and availability data:

| Field | Validation |
|-------|------------|
| `price` | Numeric value present |
| `priceCurrency` | Valid ISO 4217 code (USD, EUR, GBP, JPY, etc.) |
| `priceValidUntil` | Valid date format if present |
| `availability` | Valid schema.org enum value |
| `itemCondition` | Valid condition type if present |
| `seller` | Organization or Person data if present |

**Valid Availability Values**:
- `https://schema.org/InStock`
- `https://schema.org/OutOfStock`
- `https://schema.org/PreOrder`
- `https://schema.org/BackOrder`
- `https://schema.org/SoldOut`
- `https://schema.org/LimitedAvailability`
- `https://schema.org/OnlineOnly`
- `https://schema.org/InStoreOnly`

**How we check**: We parse structured data and validate each field against schema.org specifications and ISO standards.

---

### 4. 📡 Distribution (Protocol Readiness) — 15 pts

AI agents use a layered protocol stack to discover products, complete transactions, and process payments. We evaluate readiness across **three protocol layers** using a protocol-centric approach.

**Protocol Layer Architecture**

```
DISCOVERY LAYER (Can agents find products?)
├── Google Shopping    ✓/⚠️/✗
├── Klarna APP         ✓/⚠️/✗
└── Answer Engines     ✓/⚠️/✗

COMMERCE LAYER (Can agents transact?)
├── UCP (Universal Commerce Protocol)  ✓/⚠️/✗
├── ACP (ChatGPT Shopping)             ✓/⚠️/✗
└── MCP (Model Context Protocol)       ✓/⚠️/✗

PAYMENT LAYER (What rails exist?)
└── Stripe · Google Pay · Apple Pay · Klarna · PayPal
```

**Platform Detection**

We identify your e-commerce platform:

| Platform | Detection Method |
|----------|------------------|
| Shopify | `Shopify.` in source, `cdn.shopify.com` assets, `/products.json` endpoint |
| WooCommerce | `woocommerce` classes, `/wp-json/wc/` API |
| Magento | `Mage.` or `magento` in source, `/rest/V1/` patterns |
| BigCommerce | `bigcommerce` scripts, stencil indicators |
| Custom | Fallback when none detected |

**Feed Discovery**

We search for product feeds from multiple sources:
- **Shopify Native**: `/products.json`, `/collections/all/products.json`
- **Robots.txt**: Feed URLs or Sitemap references
- **Sitemap.xml**: "product" or "feed" entries
- **Common Paths**: `/feed.xml`, `/products.xml`, `/catalog.xml`
- **HTML**: `<link rel="alternate">` with product/feed keywords
- **JSON-LD**: `DataFeed` or `ItemList` schema types

**Protocol Readiness Matrix**

| Layer | Protocol | Ready | Partial | Not Ready |
|-------|----------|-------|---------|-----------|
| Discovery | Google Shopping | Feed + title/price/availability + GTIN | Feed exists, missing fields | No feed |
| Discovery | Klarna APP | Feed + GTIN on >80% products | Feed + GTIN on <80% | No GTIN |
| Discovery | Answer Engines | Complete Product + Offer schema | Partial schema | No schema |
| Commerce | UCP | `/.well-known/ucp.json` manifest detected | Commerce patterns detected | Nothing found |
| Commerce | ACP (ChatGPT) | Stripe + `/.well-known/ai-plugin.json` | Stripe detected, no plugin | No Stripe |
| Commerce | MCP | `/.well-known/mcp.json` or SAP indicators | API patterns detected | Nothing found |

**New Protocol Detection**

| Protocol | What We Check |
|----------|---------------|
| **UCP (Universal Commerce Protocol)** | `/.well-known/ucp.json`, `/.well-known/commerce.json`, `/api/commerce/manifest` |
| **ACP (ChatGPT Shopping)** | Stripe integration + `/.well-known/ai-plugin.json` plugin manifest |
| **MCP (Model Context Protocol)** | `/.well-known/mcp.json`, `/mcp/capabilities`, SAP Commerce indicators (`/occ/v2/`, `/rest/v2/`) |

**Payment Rails Detection**

We detect checkout infrastructure:
- **Stripe**: `stripe.js`, `js.stripe.com`
- **Google Pay**: `pay.google.com`
- **Apple Pay**: `ApplePaySession`, `apple-pay-button`
- **Klarna**: `klarna.*payments`, `klarnacdn.net`
- **PayPal**: `paypal.com/sdk`
- **Shopify Checkout**: `checkout.shopify.com`

**Distribution Checks (15 points)**:

| Check | Points | Pass Condition |
|-------|--------|----------------|
| Platform Detected | 1 | Known e-commerce platform identified |
| Structured Data Complete | 3 | Product + Offer + GTIN/SKU present |
| Product Feed Exists | 3 | At least one feed URL found or native feed available |
| Feed Discoverable | 2 | Feed linked in sitemap, robots.txt, or HTML |
| Feed Accessible + Valid | 2 | Feed URL returns 200 and valid content |
| Commerce API Indicators | 2 | Stripe/Shopify Checkout/payment rails detected |
| Protocol Manifest | 2 | UCP or MCP well-known endpoint found |

---

### 5. 🛡️ Trust (Brand Verification) — 15 pts

**Organization Schema (schema.org/Organization)**

| Field | What We Check |
|-------|---------------|
| `name` | Legal business name present |
| `logo` | Valid logo URL |
| `contactPoint` | Customer service contact info |
| `sameAs` | Social media profile links |
| `address` | Physical address/location |

**MerchantReturnPolicy Schema**

| Field | What We Check |
|-------|---------------|
| `returnPolicyType` | Refund, exchange, or store credit |
| `merchantReturnDays` | Return window length |
| `returnFees` | Whether returns are free or paid |
| `returnMethod` | How customers return items |

**Why this matters**: AI agents verify merchant legitimacy before recommending stores. Missing trust signals trigger warnings like "unverified seller" that kill conversions.

---

## What We Don't Test

To be transparent about our scope, here's what Agent Pulse **does not** currently analyze:

### ❌ Not Tested

| Category | What's Excluded | Why |
|----------|-----------------|-----|
| **Content Quality** | Product descriptions, copywriting, keyword optimization | Subjective and requires human judgment |
| **Image Recognition** | Whether product images are high-quality or well-composed | Requires computer vision analysis |
| **Competitive Pricing** | Whether your prices are competitive in the market | Requires market data we don't collect |
| **Inventory Accuracy** | Whether your availability data matches actual stock | Requires backend integration |
| **Multi-page Crawling** | Deep site audits beyond the submitted URL | We analyze single pages for speed |
| **JavaScript-heavy SPAs** | Sites requiring complex authentication or dynamic loading | Limited by scraping capabilities |
| **Mobile-specific Issues** | Separate mobile site versions | We analyze the primary URL only |
| **Checkout Flow** | Whether purchases can actually complete | Requires end-to-end transaction testing |
| **Review Schema** | AggregateRating and Review structured data | Focus is on core commerce signals |
| **FAQ Schema** | FAQPage and Question/Answer markup | Not critical for AI shopping agents |
| **Local Business** | LocalBusiness schema and location-specific data | Focused on e-commerce, not local SEO |
| **Security Headers** | HTTPS validation, CSP, HSTS | Not directly relevant to AI agents |
| **Accessibility** | WCAG compliance, screen reader compatibility | Separate audit domain |

### ⚠️ Limitations

- **Single-page analysis**: We test the URL you provide, not your entire site
- **Point-in-time snapshot**: Results reflect the page state at analysis time
- **Public content only**: We can't analyze content behind logins or paywalls
- **robots.txt focus**: We check your rules but can't verify actual bot behavior
- **PageSpeed API dependency**: Performance data requires Google to have CrUX data for your domain

---

## Scoring System

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| Agent-Native | 85-100 | Excellent — Fully agent-optimized |
| Optimized | 70-84 | Great — Minor improvements possible |
| Needs Work | 50-69 | Some gaps to address |
| Invisible | 0-49 | Failing — Largely invisible to AI agents |

**Scoring Weight Distribution**:
- Discovery: 35 points (35%)
- Performance: 15 points (15%)
- Transaction: 20 points (20%)
- Distribution: 15 points (15%) **NEW**
- Trust: 15 points (15%)

Each check contributes points to category scores, which roll up to the total score.

---

## Technical Implementation

### Analysis Flow

```
1. URL Submission
   └─> SSRF Protection (block localhost, private IPs, metadata endpoints)
   └─> Rate Limit Check (10/hour per IP)

2. Page Scraping
   └─> Firecrawl API (JavaScript-rendered content)
   └─> Fallback: Basic fetch (static HTML only)

3. Parallel Analysis
   ├─> robots.txt parsing (AI bot rules)
   ├─> Schema.org extraction (JSON-LD, Microdata, RDFa)
   ├─> PageSpeed Insights API call
   ├─> sitemap.xml presence check
   └─> Feed discovery & platform detection **NEW**

4. Scoring Engine
   └─> Calculate category scores (5 pillars)
   └─> Calculate protocol compatibility
   └─> Generate prioritized recommendations
   └─> Assign letter grade

5. Result Persistence
   └─> Store in database
   └─> Return analysis ID for results page
```

### Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Edge Functions (Deno runtime)
- **Scraping**: Firecrawl API with basic fetch fallback
- **Performance Data**: Google PageSpeed Insights API
- **PDF Generation**: jsPDF
- **Email Delivery**: Resend

### Security Features

- **SSRF Protection**: Blocks requests to localhost, private IPs (10.x, 172.16-31.x, 192.168.x), and cloud metadata endpoints
- **Rate Limiting**: 10 analyses per hour per IP address
- **RLS Policies**: Strict database access controls protecting email captures and rate limit data

---

## Service Tiers

Agent Pulse is the free entry point for Re:found Labs' AI optimization services:

| Tier | What's Included | Best For |
|------|-----------------|----------|
| **Free Audit** | Self-serve Agent Pulse scan, PDF report | Quick health check |
| **Deep Audit** | Expert review + real AI agent simulation with screen recordings | Brands wanting proof |
| **Implementation** | Done-for-you optimization with +20 point score guarantee in 60 days | Serious about results |

---

## User-Agent Identification

When Agent Pulse crawls your site, it identifies as:

```
AgentPulseBot/1.0 (+https://refoundlabs.com)
```

This allows you to identify our requests in your server logs if needed.

---

## Local Development

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

### Required Environment Variables

| Variable | Purpose |
|----------|---------|
| `GOOGLE_PAGESPEED_API_KEY` | PageSpeed Insights API access |
| `RESEND_API_KEY` | Email delivery for PDF reports |
| `FIRECRAWL_API_KEY` | JavaScript-rendered page scraping + feed discovery |
| `VITE_CALENDLY_URL` | Booking link for strategy calls |

---

## License

Proprietary — Re:found Labs

---

## Contact

- **Email**: hello@refoundlabs.com
- **Website**: [refoundlabs.com](https://refoundlabs.com)
- **Book a Call**: Available via the Services page
