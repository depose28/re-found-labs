# re:found Labs - Agent Pulse

**AI Shopping Bot Readiness Analyzer for E-commerce**

Agent Pulse is a free diagnostic tool that evaluates how well your e-commerce store is optimized for AI shopping agents like ChatGPT, Claude, Perplexity, and other LLM-powered assistants that increasingly drive product discovery and purchasing decisions.

🔗 **Live Tool**: [ai-commerce-audit.lovable.app](https://ai-commerce-audit.lovable.app)

---

## What is Agent Pulse?

AI shopping agents are changing how consumers discover and purchase products. These agents crawl websites, extract product data, and make recommendations to users. If your store isn't optimized for these agents, you're invisible to a growing segment of buyers.

Agent Pulse analyzes your store across **four critical dimensions** and provides:
- A **0-100 score** with letter grade (A+ to F)
- **Category-by-category breakdown** with specific issues
- **Prioritized recommendations** with code snippets to fix problems
- **Downloadable PDF report** for stakeholder sharing

---

## The Four Analysis Categories

### 1. 🔍 Discovery (Bot Access & Product Data)
**What it checks:**
- **AI Bot Access via robots.txt** — Verifies your site allows critical AI crawlers:
  - GPTBot (OpenAI/ChatGPT)
  - OAI-SearchBot (OpenAI Search)
  - ChatGPT-User (ChatGPT Browser)
  - ClaudeBot (Anthropic)
  - Anthropic-AI (Anthropic)
  - PerplexityBot
  - Google-Extended
  - Amazonbot
  - Applebot-Extended
  - Bytespider (TikTok)
  
- **Product Schema (schema.org/Product)** — Validates structured data including:
  - Product name and description
  - SKU/GTIN identifiers
  - Brand information
  - Product images
  - Availability status

**Why it matters:** If bots can't crawl your site or extract product data, AI agents will skip your store entirely and recommend competitors.

---

### 2. ⚡ Performance (Speed & Core Web Vitals)
**What it checks:**
- **Google PageSpeed Insights score** (0-100)
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint) — Loading performance
  - FID (First Input Delay) — Interactivity
  - CLS (Cumulative Layout Shift) — Visual stability
  - FCP (First Contentful Paint)
  - TTFB (Time to First Byte)

**Why it matters:** AI agents operate under strict timeouts. Slow pages get abandoned, and agents move on to faster competitors. Google's PageSpeed data reflects real-world user experience that agents also consider.

---

### 3. 💳 Transaction (Purchasability Signals)
**What it checks:**
- **Offer Schema (schema.org/Offer)** — Validates pricing data:
  - Price value and currency (ISO 4217 format: USD, EUR, GBP, etc.)
  - Price validity dates
  - Availability status using schema.org enums:
    - `InStock`, `OutOfStock`, `PreOrder`, `BackOrder`, etc.
  - Item condition (NewCondition, UsedCondition, etc.)
  - Seller information

**Why it matters:** AI agents need machine-readable pricing and availability to make purchase recommendations. Missing or malformed Offer data means agents can't confirm if products are actually buyable.

---

### 4. 🛡️ Trust (Brand Verification)
**What it checks:**
- **Organization Schema (schema.org/Organization)** — Validates:
  - Legal business name
  - Logo URL
  - Contact information
  - Social media profiles (sameAs links)
  - Address/location data

- **MerchantReturnPolicy Schema** — Validates:
  - Return policy type (refund, exchange, credit)
  - Return window duration
  - Return fees/costs
  - Return methods

**Why it matters:** AI agents verify merchant legitimacy before recommending stores. Missing trust signals trigger agent warnings like "unverified seller" that kill conversions.

---

## Scoring System

| Grade | Score Range | Meaning |
|-------|-------------|---------|
| A+ | 95-100 | Excellent — Fully agent-optimized |
| A | 90-94 | Great — Minor improvements possible |
| B+ | 85-89 | Good — Some gaps to address |
| B | 80-84 | Above Average — Notable issues |
| C+ | 75-79 | Average — Significant optimization needed |
| C | 70-74 | Below Average — Major gaps |
| D | 60-69 | Poor — Critical issues present |
| F | 0-59 | Failing — Largely invisible to AI agents |

Each check contributes points to category scores, which roll up to the total score.

---

## Technical Architecture

### Stack
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Lovable Cloud)
- **Edge Functions**: Deno (Supabase Edge Functions)
- **Scraping**: Firecrawl API (with basic fetch fallback)
- **Performance Data**: Google PageSpeed Insights API
- **PDF Generation**: jsPDF
- **Email Delivery**: Resend

### Security Features
- **SSRF Protection**: Blocks requests to localhost, private IPs (10.x, 172.16-31.x, 192.168.x), and cloud metadata endpoints
- **Rate Limiting**: 10 analyses per hour per IP address
- **RLS Policies**: Strict database access controls protecting email captures and rate limit data

### Edge Function: `analyze`
The core analysis engine that:
1. Validates URL security (SSRF protection)
2. Checks rate limits
3. Scrapes the target URL (Firecrawl or basic fetch)
4. Parses robots.txt for AI bot access rules
5. Extracts and validates schema.org structured data
6. Fetches PageSpeed Insights metrics
7. Checks for sitemap.xml presence
8. Calculates scores and generates recommendations
9. Persists results to database

### Edge Function: `generate-report`
Generates PDF reports and emails them via Resend when users submit their email address.

---

## Environment Variables

### Required Secrets (Lovable Cloud)
| Secret | Purpose |
|--------|---------|
| `GOOGLE_PAGESPEED_API_KEY` | PageSpeed Insights API access |
| `RESEND_API_KEY` | Email delivery for PDF reports |
| `FIRECRAWL_API_KEY` | JavaScript-rendered page scraping |

### Auto-configured (Lovable Cloud)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## Database Schema

### `analyses`
Stores completed analysis results including scores, checks, and recommendations.

### `email_captures`
Stores email addresses for PDF report delivery (protected by RLS — no public read access).

### `rate_limits`
Tracks API usage per IP address (protected by RLS — service role only).

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

---

## Service Tiers

Agent Pulse is the free entry point for re:found Labs' AI optimization services:

| Tier | Description |
|------|-------------|
| **Free Audit** | Self-serve Agent Pulse scan |
| **Deep Audit** | Expert review + real AI agent simulation with screen recordings |
| **Implementation** | Done-for-you optimization with +20 point score guarantee |

---

## Contributing

This project is built with [Lovable](https://lovable.dev). Changes can be made via:
- The Lovable editor (recommended)
- Direct GitHub commits
- Local development with git push

---

## License

Proprietary — re:found Labs

---

## Contact

For enterprise inquiries or partnership opportunities, visit [refoundlabs.com](https://refoundlabs.com) or book a consultation via the Services page.
