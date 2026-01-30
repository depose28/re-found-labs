# Agent Pulse by re:found Labs

**AI Agent Readiness Analyzer for E-commerce**

Agent Pulse is a free diagnostic tool that evaluates how well your e-commerce store is prepared for the agentic commerce era. AI shopping agents — ChatGPT, Claude, Perplexity, Google AI Mode, and others — are rapidly changing how consumers discover and purchase products. If your store isn't optimized for these agents, you're invisible to a growing segment of buyers.

**Live App**: [agent-pulse-web.vercel.app](https://agent-pulse-web.vercel.app)
**Contact**: hello@refoundlabs.com

---

## Table of Contents

1. [How Agent Pulse Works](#how-agent-pulse-works)
2. [What We Test and Why](#what-we-test-and-why)
3. [The 3-Layer Scoring Model](#the-3-layer-scoring-model)
4. [Architecture](#architecture)
5. [Tech Stack](#tech-stack)
6. [Monorepo Structure](#monorepo-structure)
7. [API Reference](#api-reference)
8. [Analysis Pipeline](#analysis-pipeline)
9. [Database Schema](#database-schema)
10. [External Services](#external-services)
11. [Security](#security)
12. [Local Development](#local-development)
13. [Environment Variables](#environment-variables)
14. [Deployment](#deployment)

---

## How Agent Pulse Works

### For Customers

Agent Pulse answers one question: **Is your online store ready for the age of AI shopping agents?**

AI agents like ChatGPT, Claude, and Google Gemini are becoming the new storefront. Instead of browsing websites, consumers ask AI assistants to find, compare, and buy products for them. These agents crawl the web, read your product data, and decide whether to recommend your store — or your competitor's.

**Here's what happens when you run an Agent Pulse audit:**

1. **Enter your store URL** — paste any product page or homepage
2. **We analyze your site** — our engine checks 11 critical signals across 3 layers
3. **Get your score** — a 0-100 readiness score with a clear grade
4. **See what to fix** — prioritized recommendations split into quick wins and technical fixes

Your score tells you where you stand:

| Score | Grade | What It Means |
|-------|-------|---------------|
| 85-100 | **Agent-Native** | Market leader. AI agents can fully discover, understand, and transact on your site. |
| 70-84 | **Optimized** | Competitive. Solid foundation with room for improvement. |
| 50-69 | **Needs Work** | Losing ground. Significant gaps are costing you AI-referred traffic. |
| 0-49 | **Invisible** | Invisible to AI agents. They can't find or recommend your products. |

### What Makes This Different

Most SEO tools optimize for search engine rankings. Agent Pulse optimizes for **AI agent readiness** — a fundamentally different problem. AI agents don't just read meta tags; they need:

- **Machine-readable product data** so they can understand what you sell
- **Crawl access** so they can reach your pages at all
- **Complete checkout information** so they can guide purchases
- **Trust signals** so they'll recommend you over competitors

---

## What We Test and Why

### Layer 1: Discovery — "Can AI Agents Find You?"

AI agents need to crawl your site, understand your products, and find you through distribution channels. If they can't discover you, nothing else matters.

| Check | What We Test | Why It Matters |
|-------|-------------|----------------|
| **AI Bot Access** | Whether your robots.txt allows 10 major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, etc.) | Many sites accidentally block AI bots, making them invisible to agents |
| **Sitemap** | Whether an XML sitemap exists and is valid | Sitemaps help agents efficiently discover all your pages |
| **Server Response Time** | Time-to-first-byte (TTFB) | AI agents have strict timeouts (5-10s). Slow pages get skipped |
| **Product Information** | Completeness of structured product data (name, price, images, identifiers) | Agents parse structured data to understand products — without it, they can't recommend you |
| **Site Structure** | Whether your site publishes a WebSite schema with search capability | Enables direct search integration (e.g., Google sitelinks search box) |
| **Product Feed** | Whether product feeds (JSON, XML) are discoverable and accessible | Feeds are how shopping platforms and agents bulk-import your catalog |
| **Checkout Integration** | Whether commerce APIs or protocols (UCP, MCP, Shopify Storefront) are detected | Agents need programmatic access to facilitate purchases |

### Layer 2: Trust — "Will AI Agents Recommend You?"

Even if agents can find you, they need signals that you're a legitimate, trustworthy business before recommending you to their users.

| Check | What We Test | Why It Matters |
|-------|-------------|----------------|
| **Business Identity** | Organization data: legal name, logo, contact info, social profiles | Agents verify business legitimacy before making recommendations |
| **Trust Indicators** | HTTPS encryption + return policy information | Secure connections and clear policies are baseline trust requirements |

### Layer 3: Transaction — "Can Agents Complete Purchases?"

The ultimate goal: can an AI agent help a customer actually buy from you?

| Check | What We Test | Why It Matters |
|-------|-------------|----------------|
| **Checkout Data** | Product pricing, shipping details, and return policy coverage | AI checkout protocols require complete pricing and fulfillment data |
| **Payment Methods** | Detection of payment providers (Stripe, PayPal, Klarna, Apple Pay, etc.) | More payment options = more ways agents can facilitate transactions |

### Manual Verification Checklist

Some signals can't be automated. After your scan, we provide a checklist for manual verification:

- Klarna Agent Purchase Protocol enrollment
- Google AI Mode shopping presence
- ChatGPT shopping integration
- Reddit brand presence
- Trustpilot profile status

---

## The 3-Layer Scoring Model

Phase 1 implements **11 automated checks** worth 67 raw points, normalized to a 0-100 scale.

```
Discovery (45 pts)
├── Crawl Architecture
│   ├── D1  AI Bot Access ............... 7 pts
│   ├── D2  Sitemap Available ........... 5 pts
│   └── D3  Server Response Time ........ 3 pts
├── Semantic Data
│   ├── D4  Product Information ......... 10 pts
│   └── D5  Site Structure .............. 5 pts
└── Distribution Signals
    ├── D7  Product Feed ................ 4 pts
    └── D9  Checkout Integration ........ 3 pts

Trust (25 pts)
├── Brand Identity
│   ├── T1  Business Identity ........... 8 pts
│   └── T2  Trust Indicators ............ 7 pts
└── Community Signals
    ├── T3  Social Proof ................ (manual)
    └── T4  Platform Presence ........... (manual)

Transaction (30 pts)
├── Protocol Support
│   └── X1  Checkout Data Completeness .. 10 pts
└── Payment Infrastructure
    └── X4  Payment Methods ............. 5 pts
```

**Normalization formula**: `(rawScore / maxPossibleScore) * 100`

Phase 1 max possible = 67 points. A site scoring 67/67 raw = 100 normalized.

### Phase 2 (Planned)

| ID | Check | Points | Layer |
|----|-------|--------|-------|
| D6 | Attribute Completeness | 5 | Discovery |
| D8 | Channel Detection | 3 | Discovery |
| D10 | SSR Detection | 3 | Discovery |
| X2 | MCP/ACP Detection | 5 | Transaction |
| X3 | Payment Protocol | 5 | Transaction |
| X5 | Checkout API | 5 | Transaction |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                       │
│                     Deployed on Vercel                            │
│                                                                   │
│  Pages: / → /analyzing → /results                                │
│  Also: /blog, /services, /products, /about                       │
└──────────────────────────┬───────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                     Backend API (Hono)                            │
│                     Node.js + TypeScript                          │
│                                                                   │
│  POST /api/analyze ──► Trigger.dev Job ──► 11 checks             │
│  GET  /api/jobs/:id ──► Poll job status + results                │
│  POST /api/reports  ──► PDF generation + Resend email            │
└───────┬──────────────────┬───────────────────┬───────────────────┘
        │                  │                   │
        ▼                  ▼                   ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│  Supabase    │  │  Trigger.dev │  │  External APIs           │
│  PostgreSQL  │  │  Job Queue   │  │  ├── Firecrawl (scrape)  │
│              │  │              │  │  └── Resend (email)       │
│  - analyses  │  │  - analyze   │  └──────────────────────────┘
│  - jobs      │  │    task      │
│  - emails    │  │  - retries   │
│  - rates     │  │  - progress  │
└──────────────┘  └──────────────┘
```

### Request Flow

1. User submits URL on the frontend
2. Frontend calls `POST /api/analyze` → receives a `jobId`
3. Backend queues a Trigger.dev job (`analyze-ecommerce-site`)
4. Frontend polls `GET /api/jobs/:id` for progress updates
5. Trigger.dev job executes: scrape → extract schemas → run 11 checks → score → recommend
6. Results stored in Supabase `analyses` table
7. Frontend redirects to `/results?id={analysisId}`

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Monorepo** | Turborepo + pnpm workspaces | Build orchestration and dependency management |
| **Frontend** | React 18 + TypeScript | UI components and state management |
| **Build Tool** | Vite | Fast development and optimized builds |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | shadcn/ui (Radix primitives) | Pre-built accessible components |
| **Routing** | React Router DOM | Client-side navigation |
| **Data Fetching** | TanStack Query | Server state management with polling |
| **Charts** | Recharts | Data visualization |
| **Backend** | Hono | Lightweight TypeScript web framework |
| **Job Queue** | Trigger.dev | Background job orchestration with retries |
| **Database** | Supabase PostgreSQL | Data persistence with Row Level Security |
| **Scraping** | Firecrawl API | JavaScript-rendered content extraction |
| **Email** | Resend | Transactional email delivery |
| **Validation** | Zod | Runtime schema validation |
| **Logging** | Pino | Structured JSON logging |

---

## Monorepo Structure

```
re-found-labs/
├── apps/
│   ├── web/                          # React frontend
│   │   ├── src/
│   │   │   ├── pages/                # Route components
│   │   │   │   ├── Index.tsx         # Landing page + URL input
│   │   │   │   ├── Analyzing.tsx     # Real-time job progress
│   │   │   │   ├── Results.tsx       # Score, checks, recommendations
│   │   │   │   ├── Services.tsx      # Service tiers
│   │   │   │   ├── Products.tsx      # Product roadmap
│   │   │   │   ├── About.tsx         # Company mission
│   │   │   │   ├── Blog.tsx          # Blog listing
│   │   │   │   └── BlogPost.tsx      # Individual posts
│   │   │   ├── components/
│   │   │   │   ├── landing/          # Homepage sections
│   │   │   │   ├── results/          # Results page components
│   │   │   │   │   ├── ScoreHeader.tsx
│   │   │   │   │   ├── LayerBreakdown.tsx
│   │   │   │   │   ├── ChecksAccordion.tsx
│   │   │   │   │   ├── RecommendationsSection.tsx
│   │   │   │   │   └── ManualVerificationChecklist.tsx
│   │   │   │   └── ui/               # shadcn/ui components (40+)
│   │   │   └── integrations/
│   │   │       └── supabase/         # Auto-generated client + types
│   │   ├── public/
│   │   │   ├── og-image.png          # Open Graph preview image
│   │   │   └── favicon.svg
│   │   └── index.html
│   │
│   └── api/                          # Hono backend
│       └── src/
│           ├── index.ts              # Hono app entry point + routes
│           ├── checks/
│           │   ├── discovery/        # D1-D9 check implementations
│           │   │   ├── botAccess.ts
│           │   │   ├── sitemap.ts
│           │   │   ├── serverResponseTime.ts
│           │   │   ├── productSchema.ts
│           │   │   ├── websiteSchema.ts
│           │   │   ├── productFeed.ts
│           │   │   └── commerceApi.ts
│           │   ├── trust/            # T1-T2 check implementations
│           │   │   ├── organization.ts
│           │   │   └── trustSignals.ts
│           │   └── transaction/      # X1, X4 check implementations
│           │       ├── ucpCompliance.ts
│           │       └── paymentMethods.ts
│           ├── jobs/
│           │   ├── analyze.job.ts    # Main analysis orchestration
│           │   └── recommendations.ts # Recommendation generation
│           ├── routes/
│           │   ├── analyze.ts        # POST /api/analyze
│           │   ├── jobs.ts           # GET /api/jobs/:id
│           │   └── reports.ts        # POST /api/reports
│           ├── scrapers/
│           │   ├── firecrawl.ts      # JS-rendered scraping
│           │   └── basic.ts          # Static HTML fetch
│           ├── schema/
│           │   ├── extract.ts        # JSON-LD extraction
│           │   └── validate.ts       # Schema validation
│           ├── trigger/
│           │   └── analyze.ts        # Trigger.dev task definition
│           └── lib/
│               ├── logger.ts         # Pino structured logging
│               ├── security.ts       # SSRF protection + URL validation
│               ├── supabase.ts       # Database client
│               └── timeout.ts        # Timeout utilities
│
├── packages/
│   ├── shared/                       # Shared types and constants
│   │   └── src/
│   │       └── index.ts              # Check definitions, scoring config, grades
│   └── db/                           # Database types and migrations
│       └── src/
│           └── types.ts
│
├── turbo.json                        # Turborepo build config
├── pnpm-workspace.yaml               # Workspace definition
└── package.json                      # Root scripts
```

---

## API Reference

### `POST /api/analyze`

Start an asynchronous analysis job.

**Request:**
```json
{
  "url": "https://example.com/products/widget"
}
```

**Response:**
```json
{
  "success": true,
  "jobId": "uuid-here",
  "message": "Analysis job queued"
}
```

### `POST /api/analyze/sync`

Run analysis synchronously (waits for completion). Used for testing.

### `GET /api/jobs/:id`

Poll job status and retrieve results.

**Response (in progress):**
```json
{
  "status": "running",
  "progress": {
    "step": "Running checks",
    "percentage": 60
  }
}
```

**Response (complete):**
```json
{
  "status": "completed",
  "analysisId": "uuid-here",
  "result": {
    "totalScore": 72.5,
    "grade": "Optimized",
    "layers": {
      "discovery": { "score": 32, "max": 45 },
      "trust": { "score": 15, "max": 25 },
      "transaction": { "score": 10, "max": 30 }
    },
    "checks": [...],
    "recommendations": [...]
  }
}
```

### `POST /api/reports`

Generate a PDF report and email it.

**Request:**
```json
{
  "email": "user@example.com",
  "analysisId": "uuid-here"
}
```

### `GET /health`

Health check endpoint.

---

## Analysis Pipeline

The Trigger.dev job (`analyze-ecommerce-site`) orchestrates the full analysis:

```
Step 1: Scraping
├── Measure TTFB (HEAD request to submitted URL)
├── Scrape submitted URL via Firecrawl (JS rendering, 3s wait)
├── Detect page type (product, category, or homepage)
└── If category page → find product link → scrape product page too

Step 2: Schema Extraction
├── Parse all <script type="application/ld+json"> blocks
├── Handle @graph arrays and nested schemas
├── Separate homepage schemas (WebSite, Organization) from product page schemas
├── Find: Product, Organization, WebSite, Offer, ShippingDetails, ReturnPolicy
└── Assess schema quality (full / partial / none)

Step 3: Run Checks (11 checks in parallel)
├── Discovery: D1 bot access, D2 sitemap, D3 TTFB, D4 product data, D5 site structure
├── Trust: T1 business identity, T2 trust indicators (HTTPS + return policy)
└── Transaction: X1 checkout data completeness, X4 payment methods

Step 4: Distribution Signals
├── D7: Discover product feeds (robots.txt, sitemap, /products.json, HTML links)
├── D9: Check commerce APIs (UCP /.well-known/ucp.json, MCP, Shopify Storefront)
└── Validate feed accessibility and content

Step 5: Scoring + Recommendations
├── Calculate raw scores per layer (Discovery / Trust / Transaction)
├── Normalize to 0-100 scale
├── Assign grade (Agent-Native / Optimized / Needs Work / Invisible)
├── Generate prioritized recommendations (critical → low, quick wins → technical)
└── Store results in database
```

### Smart Scraping Strategy

Agent Pulse minimizes Firecrawl API usage through intelligent scraping:

- **Always uses Firecrawl** for the submitted URL (payment/platform detection requires JS rendering)
- **Homepage fetch**: Separate Firecrawl request if the submitted URL isn't the homepage
- **Product page discovery**: If the submitted page is a category page, the engine finds a product link and scrapes it for full product data
- **Feed/sitemap probing**: Uses basic HTTP fetch (no Firecrawl credits) for robots.txt, sitemaps, and feed URLs

### Page Separation Logic

Different schemas live on different pages:

| Schema | Source Page |
|--------|------------|
| Product, Offer, ShippingDetails | Product page |
| Organization, WebSite | Homepage |
| MerchantReturnPolicy | Either (product page preferred) |

The engine fetches both homepage and product page to get complete data.

---

## Database Schema

### Table: `analyses`

Stores completed analysis results.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `url` | TEXT | Analyzed URL |
| `domain` | TEXT | Domain hostname |
| `total_score` | FLOAT | Normalized 0-100 score |
| `grade` | TEXT | Agent-Native / Optimized / Needs Work / Invisible |
| `discovery_score` | INTEGER | Discovery layer raw score |
| `discovery_max` | INTEGER | Discovery layer max (45) |
| `trust_score` | INTEGER | Trust layer raw score |
| `trust_max` | INTEGER | Trust layer max (25) |
| `transaction_score` | INTEGER | Transaction layer raw score |
| `transaction_max` | INTEGER | Transaction layer max (30) |
| `checks` | JSONB | All individual check results with data |
| `recommendations` | JSONB | Generated recommendations |
| `analysis_duration_ms` | INTEGER | Total processing time |
| `created_at` | TIMESTAMPTZ | Creation timestamp |

### Table: `analysis_jobs`

Tracks job queue status and progress.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key (used as jobId) |
| `url` | TEXT | URL being analyzed |
| `status` | TEXT | queued / running / completed / failed |
| `progress` | JSONB | Current step and percentage |
| `analysis_id` | UUID | FK to analyses (set on completion) |
| `error` | TEXT | Error message if failed |
| `created_at` | TIMESTAMPTZ | Job creation time |

### Table: `email_captures`

Tracks PDF report requests and delivery.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `email` | TEXT | User email address |
| `analysis_id` | UUID | FK to analyses |
| `report_sent_at` | TIMESTAMPTZ | Delivery timestamp |
| `report_error` | TEXT | Error if delivery failed |

### Table: `rate_limits`

IP-based rate limiting.

| Column | Type | Description |
|--------|------|-------------|
| `ip` | TEXT | Client IP address |
| `endpoint` | TEXT | Rate-limited endpoint |
| `count` | INTEGER | Requests in current window |
| `window_start` | TIMESTAMPTZ | Current window start |

---

## External Services

### Firecrawl

JavaScript-rendered page scraping. Handles SPAs and client-side rendered content, preserving JSON-LD structured data in the HTML output.

- **Endpoint**: `https://api.firecrawl.dev/v1/scrape`
- **Config**: `rawHtml` format, 3-second JS rendering wait, 30-second timeout
- **Cost**: Per-page credit model

### Trigger.dev

Background job orchestration. Runs the analysis pipeline asynchronously with retry support.

- **Task**: `analyze-ecommerce-site`
- **Max duration**: 5 minutes
- **Retries**: 2 attempts with exponential backoff
- **Progress**: Real-time status updates via database

### Resend

Transactional email delivery for PDF reports.

- **From**: `reports@refoundlabs.com`
- **Content**: HTML email with score summary + PDF attachment

### Supabase

PostgreSQL database with Row Level Security (RLS). Used for data persistence, not authentication.

---

## Security

### SSRF Protection

All URLs are validated before scraping. Blocked targets:
- Localhost (`127.0.0.1`, `localhost`, `::1`)
- Private IP ranges (`10.x.x.x`, `172.16-31.x.x`, `192.168.x.x`)
- Link-local addresses (`169.254.x.x`)
- Cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`)
- Internal hostnames (`*internal*`, `*intranet*`, `*corp*`)

### Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/analyze` | 10 requests | 1 hour per IP |

Rate limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` (on 429).

### Row Level Security (RLS)

| Table | Policy |
|-------|--------|
| `analyses` | Public SELECT and INSERT only |
| `analysis_jobs` | Public SELECT and INSERT, service role UPDATE |
| `email_captures` | Service role only |
| `rate_limits` | Service role only |

---

## Local Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- A Supabase project (for database)
- Firecrawl API key (for scraping)

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd re-found-labs

# Install dependencies
pnpm install

# Copy environment files
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Fill in your API keys (see Environment Variables section)

# Build shared packages first
pnpm --filter @agent-pulse/shared build

# Start development
pnpm dev           # Start all apps
pnpm dev:web       # Frontend only (http://localhost:5173)
pnpm dev:api       # Backend only (http://localhost:3001)
```

### Build and Typecheck

```bash
pnpm build          # Build all packages and apps
pnpm typecheck      # Typecheck everything
pnpm test           # Run all tests

# Individual packages
pnpm --filter @agent-pulse/shared build
pnpm --filter @agent-pulse/api typecheck
pnpm --filter @agent-pulse/web typecheck
```

---

## Environment Variables

### Backend (`apps/api/.env`)

| Variable | Purpose | Required |
|----------|---------|----------|
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Yes |
| `FIRECRAWL_API_KEY` | Firecrawl scraping API | Yes |
| `RESEND_API_KEY` | Email delivery | Yes |
| `TRIGGER_SECRET_KEY` | Trigger.dev job queue | No (falls back to inline) |
| `PORT` | Server port | No (default: 3001) |
| `NODE_ENV` | Environment | No (default: development) |
| `LOG_LEVEL` | Pino log level | No (default: info) |

### Frontend (`apps/web/.env`)

| Variable | Purpose | Required |
|----------|---------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key | Yes |

---

## Deployment

### Frontend (Vercel)

The frontend deploys to Vercel from the `apps/web` directory.

```bash
cd apps/web
npx vercel --prod
```

**Production URL**: [agent-pulse-web.vercel.app](https://agent-pulse-web.vercel.app)

### Backend (API)

The backend API runs as a Node.js server. Target deployment: Railway or similar.

```bash
cd apps/api
pnpm build
node dist/index.js
```

### Database

Migrations are managed via Supabase CLI:

```bash
supabase db push
```

---

## AI Bot List

Agent Pulse checks `robots.txt` for these 10 AI crawlers:

| Bot | Owner | Purpose |
|-----|-------|---------|
| GPTBot | OpenAI | ChatGPT's primary crawler |
| OAI-SearchBot | OpenAI | OpenAI search functionality |
| ChatGPT-User | OpenAI | ChatGPT browser mode |
| ClaudeBot | Anthropic | Claude's web access |
| Anthropic-AI | Anthropic | Anthropic's general crawler |
| PerplexityBot | Perplexity | Perplexity AI search |
| Google-Extended | Google | Gemini / AI Overviews |
| Amazonbot | Amazon | Alexa and Amazon search |
| Applebot-Extended | Apple | Siri and Apple Intelligence |
| Bytespider | ByteDance | TikTok product discovery |

---

## Service Tiers

Agent Pulse is the free entry point for re:found Labs' AI optimization services:

| Tier | Price | Includes |
|------|-------|----------|
| **Free Audit** | Free | Self-serve Agent Pulse scan with full report |
| **Deep Audit + Simulation** | From EUR 750 | Expert review, real AI agent testing with screen recordings |
| **Implementation** | From EUR 2,500 | Done-for-you optimization, +20 point score guarantee in 60 days |

---

## License

Proprietary — re:found Labs

---

## Contact

- **Email**: hello@refoundlabs.com
- **Website**: [refoundlabs.com](https://refoundlabs.com)
