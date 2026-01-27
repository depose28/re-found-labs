# Agent Pulse by Re:found Labs

**AI Shopping Bot Readiness Analyzer for E-commerce**

Agent Pulse is a free diagnostic tool that evaluates how well your e-commerce store is optimized for AI shopping agents like ChatGPT, Claude, Perplexity, and other LLM-powered assistants that increasingly drive product discovery and purchasing decisions.

📧 **Contact**: hello@refoundlabs.com  
🌐 **Live App**: [ai-commerce-audit.lovable.app](https://ai-commerce-audit.lovable.app)

---

## Table of Contents

1. [What is Agent Pulse?](#what-is-agent-pulse)
2. [Architecture Overview](#architecture-overview)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [The 5-Pillar Analysis Framework](#the-5-pillar-analysis-framework)
6. [Edge Functions](#edge-functions)
7. [External API Integrations](#external-api-integrations)
8. [Database Schema](#database-schema)
9. [Security Features](#security-features)
10. [User Flow](#user-flow)
11. [Scoring System](#scoring-system)
12. [Local Development](#local-development)
13. [Environment Variables](#environment-variables)
14. [Deployment](#deployment)

---

## What is Agent Pulse?

AI shopping agents are fundamentally changing how consumers discover and purchase products. These agents crawl websites, extract product data, and make recommendations to users. If your store isn't optimized for these agents, you're invisible to a growing segment of buyers.

**The Reality**: 73% of e-commerce stores fail basic AI agent readiness checks. Most sites were built for human browsers, not machine readers.

Agent Pulse analyzes your store across **five critical dimensions** and provides:
- A **0-100 score** with letter grade (Agent-Native, Optimized, Needs Work, Invisible)
- **Category-by-category breakdown** with specific issues identified
- **Prioritized recommendations** with code snippets to fix problems
- **Downloadable PDF report** for stakeholder sharing

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + Vite)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  Pages:                                                                  │
│  ├── Index.tsx          → Landing page with ConversionHeroSection       │
│  ├── Analyzing.tsx      → Interstitial progress UI (5 steps)            │
│  ├── Results.tsx        → Full analysis results display                 │
│  ├── Services.tsx       → Agency service tiers                          │
│  ├── Products.tsx       → Stealth product roadmap                       │
│  ├── About.tsx          → Company thesis & mission                      │
│  └── Blog.tsx           → Blog listing & posts                          │
│                                                                          │
│  Key Components:                                                         │
│  ├── landing/           → Hero, CTAs, social proof                      │
│  ├── results/           → Score display, recommendations, charts        │
│  └── ui/                → shadcn/ui components                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    SUPABASE EDGE FUNCTIONS (Deno)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  /analyze                                                        │    │
│  │  ════════════════════════════════════════════════════════════    │    │
│  │  Main analysis engine (~2900 lines)                              │    │
│  │                                                                   │    │
│  │  1. SSRF Protection & Rate Limiting                              │    │
│  │  2. Firecrawl API scraping (JS rendering)                        │    │
│  │  3. Smart Schema Extraction (category→product page follow)       │    │
│  │  4. PageSpeed Insights API integration                           │    │
│  │  5. robots.txt parsing (10 AI bots)                              │    │
│  │  6. Distribution/Protocol checks (UCP, ACP, MCP)                 │    │
│  │  7. Feed discovery & validation                                  │    │
│  │  8. Scoring engine (5 pillars, 100 points)                       │    │
│  │  9. Recommendation generation                                    │    │
│  │  10. Database persistence                                        │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │  /generate-report                                                │    │
│  │  ════════════════════════════════════════════════════════════    │    │
│  │  PDF report generation & email delivery (~700 lines)             │    │
│  │                                                                   │    │
│  │  1. Fetch analysis from database                                 │    │
│  │  2. Generate jsPDF document (5 pages)                            │    │
│  │  3. Send via Resend API                                          │    │
│  │  4. Track delivery status in email_captures table                │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE DATABASE                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Tables:                                                                 │
│  ├── analyses          → Stores all analysis results                    │
│  ├── email_captures    → Tracks report requests & delivery              │
│  └── rate_limits       → IP-based rate limiting                         │
│                                                                          │
│  RLS Policies: Strict access controls (see Security section)            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL API INTEGRATIONS                          │
├─────────────────────────────────────────────────────────────────────────┤
│  ├── Firecrawl API     → JavaScript-rendered page scraping              │
│  ├── PageSpeed API     → Google Core Web Vitals data                    │
│  └── Resend API        → Transactional email delivery                   │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 18 + TypeScript | UI components and state management |
| **Build Tool** | Vite | Fast development and optimized builds |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui | Pre-built accessible components |
| **Routing** | React Router DOM | Client-side navigation |
| **State/Data** | TanStack Query | Server state management |
| **Backend** | Supabase Edge Functions | Serverless Deno runtime |
| **Database** | Supabase PostgreSQL | Data persistence with RLS |
| **Scraping** | Firecrawl API | JavaScript-rendered content extraction |
| **Performance Data** | Google PageSpeed Insights API | Core Web Vitals metrics |
| **PDF Generation** | jsPDF | Client-side PDF creation |
| **Email Delivery** | Resend | Transactional email API |
| **Charts** | Recharts | Data visualization |
| **Markdown** | react-markdown | Blog content rendering |

---

## Project Structure

```
├── src/
│   ├── components/
│   │   ├── landing/                    # Homepage sections
│   │   │   ├── AgencyHeroSection.tsx   # Re:found Labs intro
│   │   │   ├── AgentPulseSection.tsx   # Live audit counter
│   │   │   ├── ConversionHeroSection.tsx # URL input form
│   │   │   ├── CTASection.tsx          # Final call-to-action
│   │   │   ├── HowItWorksSection.tsx   # 3-step process
│   │   │   ├── ProblemSection.tsx      # "The Shift" narrative
│   │   │   ├── PulseRadar.tsx          # Animated radar visual
│   │   │   ├── ServicesOverviewSection.tsx
│   │   │   ├── SocialProofSection.tsx  # Dynamic audit counter
│   │   │   ├── WhatWeCheckSection.tsx  # 5-pillar breakdown
│   │   │   └── WhoWeWorkWithSection.tsx
│   │   │
│   │   ├── results/                    # Results page components
│   │   │   ├── ScoreHeader.tsx         # Main score display
│   │   │   ├── CategoryBreakdown.tsx   # 5-pillar scores
│   │   │   ├── ChecksAccordion.tsx     # Detailed check results
│   │   │   ├── RecommendationsSection.tsx
│   │   │   ├── PriorityFixSpotlight.tsx # #1 priority highlight
│   │   │   ├── RevenueAtRiskCard.tsx   # Loss aversion element
│   │   │   ├── IndustryComparisonBars.tsx
│   │   │   ├── MarketContextCard.tsx
│   │   │   ├── EmailCapture.tsx        # Report request form
│   │   │   ├── TimelineGraphic.tsx
│   │   │   ├── WhatUnlocksSection.tsx
│   │   │   ├── StickyBottomCTA.tsx
│   │   │   ├── SocialProofBanner.tsx
│   │   │   └── CTASection.tsx
│   │   │
│   │   ├── ui/                         # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── accordion.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── PulseDot.tsx            # Animated status indicator
│   │   │   └── ... (40+ components)
│   │   │
│   │   ├── Header.tsx                  # Global navigation
│   │   ├── Footer.tsx                  # Global footer
│   │   └── NavLink.tsx
│   │
│   ├── pages/
│   │   ├── Index.tsx                   # Homepage (landing)
│   │   ├── Analyzing.tsx               # Interstitial loading page
│   │   ├── Results.tsx                 # Analysis results display
│   │   ├── Services.tsx                # Service tiers page
│   │   ├── Products.tsx                # Product roadmap teaser
│   │   ├── About.tsx                   # Company mission/thesis
│   │   ├── Blog.tsx                    # Blog listing
│   │   ├── BlogPost.tsx                # Individual blog post
│   │   └── NotFound.tsx                # 404 page
│   │
│   ├── data/
│   │   └── blogPosts.ts                # Static blog content
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx              # Responsive detection
│   │   └── use-toast.ts                # Toast notifications
│   │
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts               # Supabase client (auto-generated)
│   │       └── types.ts                # Database types (auto-generated)
│   │
│   ├── lib/
│   │   └── utils.ts                    # Utility functions (cn, etc.)
│   │
│   ├── App.tsx                         # Root component with routes
│   ├── App.css                         # Global styles
│   ├── index.css                       # Tailwind base + design tokens
│   └── main.tsx                        # React entry point
│
├── supabase/
│   ├── functions/
│   │   ├── analyze/
│   │   │   └── index.ts                # Main analysis engine (~2900 lines)
│   │   └── generate-report/
│   │       └── index.ts                # PDF generation & email (~700 lines)
│   └── config.toml                     # Supabase configuration
│
├── public/
│   ├── favicon.ico
│   ├── favicon.svg
│   ├── placeholder.svg
│   └── robots.txt
│
├── .env                                # Environment variables
├── tailwind.config.ts                  # Tailwind configuration
├── vite.config.ts                      # Vite configuration
├── tsconfig.json                       # TypeScript configuration
└── package.json                        # Dependencies
```

---

## The 5-Pillar Analysis Framework

Agent Pulse evaluates e-commerce sites across five weighted pillars totaling 100 points:

### 1. 🔍 Discovery (35 points) — "Can AI Agents Find You?"

**AI Bot Access (12 points)**

We verify your site explicitly allows these 10 critical AI crawlers via `robots.txt`:

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

**Product Schema (18 points)**

We validate structured data (JSON-LD, Microdata, RDFa) for:
- Product name, description, brand
- SKU/GTIN/MPN identifiers
- Product images
- Availability status

**Sitemap (5 points)**

We check for `sitemap.xml` presence and accessibility.

---

### 2. ⚡ Performance (15 points) — "Is Your Site Fast?"

We pull real performance data from **Google PageSpeed Insights API** (Chrome User Experience Report):

| Metric | Target | Weight |
|--------|--------|--------|
| LCP (Largest Contentful Paint) | < 2.5s | Loading performance |
| FID (First Input Delay) | < 100ms | Interactivity |
| CLS (Cumulative Layout Shift) | < 0.1 | Visual stability |
| Overall Performance Score | 0-100 | Combined metric |

**Why this matters**: AI agents operate with strict timeouts (5-10 seconds). Slow pages get abandoned.

---

### 3. 💳 Transaction (20 points) — "Can Agents Buy?"

**Offer Schema (18 points)**

| Field | Validation |
|-------|------------|
| `price` | Numeric value present |
| `priceCurrency` | Valid ISO 4217 code (USD, EUR, GBP, etc.) |
| `availability` | Valid schema.org enum |
| `priceValidUntil` | Valid date format |
| `itemCondition` | Valid condition type |
| `seller` | Organization/Person data |

**Valid Availability Values**:
- `https://schema.org/InStock`
- `https://schema.org/OutOfStock`
- `https://schema.org/PreOrder`
- `https://schema.org/BackOrder`
- `https://schema.org/SoldOut`
- `https://schema.org/LimitedAvailability`

**HTTPS (2 points)**

Secure connection verification.

---

### 4. 📡 Distribution (15 points) — "Protocol Ready?"

This pillar evaluates readiness across a **three-layer protocol stack**:

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

**Distribution Checks**:

| Check ID | Name | Points | Pass Condition |
|----------|------|--------|----------------|
| P1 | Platform Detected | 1 | Known e-commerce platform identified |
| P2 | Structured Data Complete | 3 | Product + Offer + GTIN/SKU present |
| P3 | Product Feed Exists | 3 | At least one feed URL found |
| P4 | Feed Discoverable | 2 | Feed in sitemap, robots.txt, or HTML |
| P5 | Feed Accessible + Valid | 2 | Feed returns 200 with valid content |
| P6 | Commerce API Indicators | 2 | Stripe/Shopify/payment rails detected |
| P7 | Protocol Manifest | 2 | UCP or MCP well-known endpoint found |

**Platform Detection**:

| Platform | Detection Method |
|----------|------------------|
| Shopify | `cdn.shopify.com`, `/products.json` |
| WooCommerce | `woocommerce` classes, `/wp-json/wc/` |
| Magento | `Mage.`, `/rest/V1/` patterns |
| BigCommerce | `bigcommerce` scripts |
| eobuwie/MODIVO | `img.eobuwie.cloud` assets |
| Custom | Fallback with e-commerce signal detection |

**Feed Discovery Sources**:
- Shopify native: `/products.json`, `/collections/all/products.json`
- robots.txt references
- sitemap.xml entries
- HTML `<link rel="alternate">` tags
- Common paths: `/feed.xml`, `/products.xml`, `/catalog.xml`
- JSON-LD `DataFeed` or `ItemList` schemas

**Smart Schema Detection**:

When users submit category pages, the engine:
1. Detects page type via URL patterns (`/c/`, `/category/`, `/collection/`, `/shop/`)
2. Checks for CollectionPage/ItemList schemas
3. If no full Product schema found, finds a product link on the page
4. Scrapes the product page via Firecrawl
5. Uses the best schema from either page

---

### 5. 🛡️ Trust (15 points) — "Will Agents Recommend?"

**Organization Schema (10 points)**

| Field | What We Check |
|-------|---------------|
| `name` | Legal business name |
| `logo` | Valid logo URL |
| `contactPoint` | Customer service contact |
| `sameAs` | Social media profiles |
| `address` | Physical location |

**MerchantReturnPolicy (5 points)**

| Field | What We Check |
|-------|---------------|
| `returnPolicyType` | Refund/exchange/credit |
| `merchantReturnDays` | Return window |
| `returnFees` | Free or paid returns |
| `returnMethod` | How to return |

---

## Edge Functions

### `/analyze` — Main Analysis Engine

**Location**: `supabase/functions/analyze/index.ts` (~2900 lines)

**Request**:
```json
POST /functions/v1/analyze
{
  "url": "https://example.com/products/widget"
}
```

**Response**:
```json
{
  "success": true,
  "analysisId": "uuid-here"
}
```

**Internal Flow**:

```
1. URL Validation
   ├── Normalize URL (add https:// if missing)
   ├── SSRF protection (block localhost, private IPs, metadata endpoints)
   └── Rate limit check (10/hour per IP)

2. Parallel Data Collection (with individual timeouts)
   ├── Firecrawl API scrape (5s JS rendering wait)
   ├── PageSpeed Insights API call
   ├── robots.txt fetch and parse
   └── sitemap.xml check

3. Smart Schema Extraction
   ├── Extract JSON-LD, Microdata, RDFa from HTML
   ├── Detect page type (category vs product)
   ├── If category page with incomplete schema:
   │   ├── Find product link on page
   │   ├── Scrape product page via Firecrawl
   │   └── Use best schema from either page
   └── Assess schema quality (full/partial/none)

4. Check Execution
   ├── D1: AI Bot Access (parse robots.txt for 10 bots)
   ├── D2: Product Schema Deep Validation
   ├── D3: Sitemap Exists
   ├── N1: PageSpeed Performance
   ├── T1: Offer Schema Deep Validation
   ├── T2: HTTPS Check
   ├── P1-P7: Distribution Checks (feeds, protocols, payments)
   ├── R1: Organization Schema
   └── R2: Return Policy Schema

5. Scoring
   ├── Calculate category scores
   ├── Sum to total (0-100)
   └── Assign grade (Agent-Native/Optimized/Needs Work/Invisible)

6. Recommendations
   ├── Generate prioritized fix list
   ├── Include code snippets
   └── Map to affected checks

7. Persistence
   └── Insert into analyses table
```

**Key Functions**:

| Function | Purpose |
|----------|---------|
| `decideScrapingStrategy()` | **NEW** - Determines if Firecrawl is needed or basic fetch suffices |
| `scrapeWithFirecrawl()` | JS-rendered page scraping via Firecrawl API (3s wait, rawHtml only) |
| `basicFetch()` | Static HTML fetch (tried first to save credits) |
| `extractAllSchemas()` | Parse JSON-LD, Microdata, RDFa |
| `extractSchemasSmartly()` | Category→product page following (conservative mode) |
| `detectPageType()` | Identify category vs product pages |
| `findProductLinkOnPage()` | Extract product URLs from HTML |
| `assessSchemaQuality()` | Rate schema as full/partial/none |
| `checkAiBotAccess()` | Parse robots.txt for 10 AI bots |
| `getPageSpeedMetrics()` | Fetch Google PageSpeed data |
| `performDistributionChecks()` | Run all P1-P7 checks |
| `detectPlatform()` | Identify Shopify/WooCommerce/etc |
| `discoverFeeds()` | Find product feeds |
| `checkFeedUrl()` | Validate feed content |
| `assessProtocolReadiness()` | Check UCP/ACP/MCP |
| `generateRecommendations()` | Create fix suggestions |

---

### `/generate-report` — PDF Report & Email

**Location**: `supabase/functions/generate-report/index.ts` (~700 lines)

**Request**:
```json
POST /functions/v1/generate-report
{
  "email": "user@example.com",
  "analysisId": "uuid-here"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Report sent successfully"
}
```

**Internal Flow**:

```
1. Fetch analysis data from database
2. Generate PDF (5 pages):
   ├── Page 1: Executive Summary (score, grade, impact statement)
   ├── Page 2: #1 Priority Fix spotlight
   ├── Page 3: Detailed check results by category
   ├── Page 4: All recommendations with code snippets
   └── Page 5: Next steps & service tiers
3. Build HTML email with:
   ├── Dynamic subject line based on score
   ├── Protocol readiness matrix
   ├── Category score breakdown
   └── CTA to book consultation
4. Send via Resend API
5. Update email_captures table with delivery status
```

**Dynamic Email Subject Lines**:
- Score < 50: `⚠️ Your store is invisible to AI agents (Score: X/100)`
- Score 50-69: `Your store scored X/100 for AI visibility — here's what to fix`
- Score 70-84: `Good news: X/100 AI readiness — here's how to reach 85+`
- Score 85+: `🏆 Excellent! X/100 — you're a market leader`

---

## External API Integrations

### 1. Firecrawl API

**Purpose**: JavaScript-rendered page scraping (with credit optimization)

**Endpoint**: `https://api.firecrawl.dev/v1/scrape`

**Configuration**:
```typescript
{
  url: targetUrl,
  formats: ["rawHtml"],        // Optimized: only request needed format
  onlyMainContent: false,
  waitFor: 3000                // Optimized: reduced from 5s to 3s
}
```

**Why Firecrawl**:
- Handles SPAs and client-side rendered content
- Preserves JSON-LD script tags in `rawHtml`
- Returns rendered DOM after JavaScript execution

**Credit Optimization Strategy**:

Agent Pulse uses a **tiered scraping approach** to minimize Firecrawl API costs:

```
User submits URL
       │
       ▼
┌─────────────────────────────────────┐
│  1. basicFetch(url)                 │  ← FREE (no credits)
│     - Check HTML size               │
│     - Extract schemas               │
│     - Detect platform               │
└─────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│  2. decideScrapingStrategy()        │
│     - Schema found with offers?     │
│     - Static platform detected?     │
│     - JS-only rendering signals?    │
└─────────────────────────────────────┘
       │
    NO │                    YES (static)
       ▼                     ▼
┌───────────────────┐  ┌─────────────────────────┐
│ scrapeWithFire-   │  │ Use basic fetch result  │
│ crawl(url)        │  │ (0 Firecrawl credits)   │
│ (1 credit)        │  │                         │
└───────────────────┘  └─────────────────────────┘
```

**When Firecrawl is Skipped**:
- Full Product schema with `offers` found in static HTML
- Static platforms detected (WooCommerce, PrestaShop, Magento) with schema
- Shopify pages with Product schema in server-rendered HTML

**When Firecrawl is Required**:
- JS-only rendering signals (`id="__next"`, empty `<body>`, noscript warnings)
- Basic fetch returns < 500 bytes of HTML
- Shopify category pages without Product schema
- Unknown platforms where static rendering can't be confirmed

**JS-Only Rendering Detection**:
```typescript
const jsOnlySignals = [
  html.includes('id="__next"') && !html.includes('application/ld+json'),
  html.includes('id="app"') && html.length < 5000,
  html.includes('noscript') && html.includes('enable JavaScript'),
  html.match(/<body[^>]*>\s*<div[^>]*><\/div>\s*<script/i),
].filter(Boolean).length;

if (jsOnlySignals >= 2) {
  // Use Firecrawl
}
```

**Product Page Follow Optimization**:

For category pages, the engine is conservative about secondary scrapes:
- **No schema**: Follow product link and scrape via Firecrawl (1 credit)
- **Partial schema** (ItemList, AggregateOffer): Use what we have, skip secondary scrape
- **Full schema**: Use directly, no secondary scrape needed

**Expected Credit Savings**:

| Scenario | Before | After |
|----------|--------|-------|
| Static site with schema | 1 credit | 0 credits |
| Shopify product page | 1 credit | 0-1 credits |
| Shopify category page | 2 credits | 1 credit |
| SPA with no static content | 1-2 credits | 1-2 credits |
| WooCommerce store | 1 credit | 0 credits |

**Estimated savings: 30-50% reduction in Firecrawl credits**

**Fallback**: Basic `fetch()` for static HTML when Firecrawl unavailable or unnecessary.

---

### 2. Google PageSpeed Insights API

**Purpose**: Core Web Vitals metrics from real Chrome users

**Endpoint**: `https://www.googleapis.com/pagespeedonline/v5/runPagespeed`

**Parameters**:
```
?url={encoded_url}
&key={API_KEY}
&category=performance
&strategy=mobile
```

**Response Parsing**:
```typescript
{
  lcp: audits["largest-contentful-paint"]?.numericValue,
  fid: audits["max-potential-fid"]?.numericValue,
  cls: audits["cumulative-layout-shift"]?.numericValue,
  tti: audits["interactive"]?.numericValue,
  speedIndex: audits["speed-index"]?.numericValue,
  performanceScore: Math.round(categories.performance.score * 100)
}
```

---

### 3. Resend API

**Purpose**: Transactional email delivery for PDF reports

**Endpoint**: Via `resend` npm package

**Configuration**:
```typescript
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

await resend.emails.send({
  from: "Agent Pulse <reports@yourdomain.com>",
  to: userEmail,
  subject: dynamicSubject,
  html: emailHtml,
  attachments: [{
    filename: "agent-pulse-report.pdf",
    content: pdfBase64
  }]
});
```

---

## Database Schema

### Table: `analyses`

Stores all analysis results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `url` | TEXT | Analyzed URL |
| `domain` | TEXT | Domain hostname |
| `total_score` | INTEGER | 0-100 score |
| `grade` | TEXT | Agent-Native/Optimized/Needs Work/Invisible |
| `discovery_score` | INTEGER | Discovery pillar score |
| `discovery_max` | INTEGER | Max possible (35) |
| `performance_score` | INTEGER | Performance pillar score |
| `performance_max` | INTEGER | Max possible (15) |
| `transaction_score` | INTEGER | Transaction pillar score |
| `transaction_max` | INTEGER | Max possible (20) |
| `distribution_score` | INTEGER | Distribution pillar score |
| `distribution_max` | INTEGER | Max possible (15) |
| `trust_score` | INTEGER | Trust pillar score |
| `trust_max` | INTEGER | Max possible (15) |
| `platform_detected` | TEXT | Shopify/WooCommerce/etc |
| `platform_name` | TEXT | Platform display name |
| `feeds_found` | JSONB | Array of discovered feeds |
| `protocol_compatibility` | JSONB | UCP/ACP/MCP readiness |
| `checks` | JSONB | All individual check results |
| `recommendations` | JSONB | Generated recommendations |
| `analysis_duration_ms` | INTEGER | Processing time |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Table: `email_captures`

Tracks report requests and delivery.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | User email address |
| `analysis_id` | UUID | FK to analyses |
| `source` | TEXT | Capture source |
| `report_sent_at` | TIMESTAMPTZ | Delivery timestamp |
| `report_error` | TEXT | Error message if failed |
| `created_at` | TIMESTAMPTZ | Request timestamp |

### Table: `rate_limits`

IP-based rate limiting for the analyze endpoint.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `ip` | TEXT | Client IP address |
| `endpoint` | TEXT | Rate-limited endpoint |
| `count` | INTEGER | Request count in window |
| `window_start` | TIMESTAMPTZ | Current window start |
| `created_at` | TIMESTAMPTZ | Record creation |

---

## Security Features

### SSRF Protection

The analyze endpoint blocks requests to:
- Localhost (`127.0.0.1`, `localhost`, `::1`)
- Private IPs (`10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`)
- Link-local (`169.254.x.x`)
- Cloud metadata (`169.254.169.254`, `metadata.google.internal`)
- Internal hostnames (`*internal*`, `*intranet*`, `*corp*`)

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/analyze` (single-page) | 10 requests | 1 hour |
| `/analyze` (deep crawl) | 3 requests | 1 hour |

Rate limit headers returned:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Requests remaining
- `Retry-After`: Seconds until reset (on 429)

### Row Level Security (RLS)

| Table | Policy | Effect |
|-------|--------|--------|
| `analyses` | Public SELECT, INSERT only | No UPDATE/DELETE |
| `email_captures` | Service role only | No public access |
| `rate_limits` | Service role only | No public access |

---

## User Flow

```
1. LANDING PAGE (Index.tsx)
   └── User enters URL in ConversionHeroSection
   └── Navigates to /analyzing?url={encoded_url}

2. ANALYZING PAGE (Analyzing.tsx)
   ├── 5-step progress animation:
   │   ├── "Checking AI bot access..."
   │   ├── "Analyzing structured data..."
   │   ├── "Testing page performance..."
   │   ├── "Discovering product feeds..."
   │   └── "Verifying trust signals..."
   ├── Calls /analyze edge function
   └── Redirects to /results?id={analysisId}

3. RESULTS PAGE (Results.tsx)
   ├── ScoreHeader: Main score + grade
   ├── RevenueAtRiskCard: Loss aversion messaging
   ├── PriorityFixSpotlight: #1 recommendation
   ├── CategoryBreakdown: 5-pillar scores
   ├── ChecksAccordion: Detailed pass/fail list
   ├── IndustryComparisonBars: Benchmarking
   ├── RecommendationsSection: All fixes
   ├── EmailCapture: PDF report form
   └── StickyBottomCTA: Persistent action button

4. REPORT DELIVERY
   ├── User enters email
   ├── Calls /generate-report edge function
   ├── PDF generated with jsPDF
   └── Sent via Resend
```

---

## Scoring System

| Grade | Score Range | Label | Meaning |
|-------|-------------|-------|---------|
| Agent-Native | 85-100 | MARKET LEADER | Fully optimized for AI agents |
| Optimized | 70-84 | COMPETITIVE | Minor improvements possible |
| Needs Work | 50-69 | LOSING GROUND | Some gaps to address |
| Invisible | 0-49 | INVISIBLE TO AI | Critical issues, largely invisible |

**Category Weights**:
- Discovery: 35 points (35%)
- Performance: 15 points (15%)
- Transaction: 20 points (20%)
- Distribution: 15 points (15%)
- Trust: 15 points (15%)

**Color Coding**:
- Green (success): ≥ 70%
- Orange (warning): 40-69%
- Red (destructive): < 40%

---

## Local Development

```bash
# Clone the repository
git clone <repository-url>
cd agent-pulse

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test
```

### Supabase Local Development

```bash
# Install Supabase CLI
brew install supabase/tap/supabase

# Start local Supabase
supabase start

# Deploy edge functions locally
supabase functions serve analyze --env-file .env.local
supabase functions serve generate-report --env-file .env.local
```

---

## Environment Variables

### Frontend (Vite)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Yes |
| `VITE_SUPABASE_PROJECT_ID` | Project ID | Yes |
| `VITE_CALENDLY_URL` | Booking link for CTAs | No |

### Edge Functions (Supabase Secrets)

| Secret | Purpose | Required |
|--------|---------|----------|
| `SUPABASE_URL` | Database connection | Yes (auto) |
| `SUPABASE_ANON_KEY` | API authentication | Yes (auto) |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin operations | Yes (auto) |
| `FIRECRAWL_API_KEY` | JS-rendered scraping | Yes |
| `GOOGLE_PAGESPEED_API_KEY` | Performance metrics | Yes |
| `RESEND_API_KEY` | Email delivery | Yes |

---

## Deployment

### Frontend

The frontend is deployed via Lovable's built-in deployment:
- **Preview URL**: `https://id-preview--{project-id}.lovable.app`
- **Published URL**: `https://ai-commerce-audit.lovable.app`

### Edge Functions

Edge functions are auto-deployed when files in `supabase/functions/` change.

Manual deployment:
```bash
supabase functions deploy analyze
supabase functions deploy generate-report
```

### Database Migrations

Migrations are managed via Lovable Cloud UI or Supabase CLI:
```bash
supabase db push
```

---

## What We Don't Test

To maintain transparency about scope:

| Category | Excluded | Reason |
|----------|----------|--------|
| Content Quality | Product descriptions, copy | Subjective |
| Image Recognition | Photo quality | Requires CV |
| Competitive Pricing | Market comparison | No market data |
| Inventory Accuracy | Stock levels | Needs backend |
| Deep Crawling | Multi-page audits | Speed constraint |
| Mobile-specific | Separate mobile sites | Single URL focus |
| Checkout Flow | Purchase completion | E2E testing |
| Review Schema | AggregateRating | Not core commerce |
| FAQ Schema | FAQPage | Not AI shopping |
| Security Headers | HTTPS, CSP, HSTS | Different domain |
| Accessibility | WCAG | Separate audit |

---

## User-Agent Identification

When Agent Pulse crawls your site:

```
Mozilla/5.0 (compatible; AgentPulseBot/1.0; +https://refoundlabs.com) AppleWebKit/537.36
```

---

## Service Tiers

Agent Pulse is the free entry point for Re:found Labs' AI optimization services:

| Tier | Price | Includes |
|------|-------|----------|
| **Free Audit** | €0 | Self-serve Agent Pulse scan, PDF report |
| **Deep Audit + Simulation** | From €750 | Expert review, real AI agent testing with screen recordings |
| **Implementation** | From €2,500 | Done-for-you optimization, +20 point score guarantee in 60 days |

---

## License

Proprietary — Re:found Labs

---

## Contact

- **Email**: hello@refoundlabs.com
- **Website**: [refoundlabs.com](https://refoundlabs.com)
- **Book a Call**: Available via the Services page
