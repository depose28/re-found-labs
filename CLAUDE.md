# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Agent Pulse is an AI shopping bot readiness analyzer for e-commerce. It's a free diagnostic tool that evaluates how well e-commerce stores are optimized for AI shopping agents (ChatGPT, Claude, Perplexity, etc.). The app analyzes stores across 3 layers (Find / Trust / Buy) and provides a 0-100 score with detailed recommendations.

**Live URL**: https://ai-commerce-audit.lovable.app
**Contact**: hello@refoundlabs.com

## Monorepo Structure

This is a **Turborepo monorepo** with pnpm workspaces:

```
agent-pulse/
├── apps/
│   ├── web/              # React frontend (Vite + shadcn/ui)
│   └── api/              # Hono backend (Node.js + Trigger.dev)
├── packages/
│   ├── shared/           # Shared types, constants, scoring logic
│   └── db/               # Database types and migrations
├── supabase/
│   └── functions/        # Legacy edge functions (being migrated)
├── turbo.json            # Turborepo configuration
└── pnpm-workspace.yaml   # Workspace definition
```

## Development Commands

```bash
# Monorepo commands (from root)
pnpm install             # Install all dependencies
pnpm dev                 # Start all apps in dev mode
pnpm dev:web             # Start only frontend
pnpm dev:api             # Start only backend
pnpm build               # Build all packages
pnpm typecheck           # Typecheck all packages
pnpm test                # Run all tests

# Individual app commands
pnpm --filter @agent-pulse/web dev      # Frontend dev server
pnpm --filter @agent-pulse/api dev      # Backend dev server
pnpm --filter @agent-pulse/shared build # Build shared package

# Legacy Supabase Edge Functions (still active during migration)
supabase functions serve analyze --env-file .env.local
supabase functions deploy analyze
```

## Architecture

### Current State (Hybrid)

During migration, both systems run in parallel:

```
Frontend (React) ─┬─► New API (Hono on Railway) ─► Trigger.dev Jobs
                  │                                      │
                  └─► Legacy Edge Functions (Supabase) ◄─┘
                                   │
                             Supabase PostgreSQL
```

### Target State (Post-Migration)

```
Frontend (React) ──► Hono API (Railway) ──► Trigger.dev
                              │                   │
                              ▼                   ▼
                        Supabase PostgreSQL ◄─────┘
```

## Apps

### `apps/web/` - Frontend

React 18 + Vite + TypeScript + shadcn/ui

**Key files:**
- `src/pages/` - Route components (Index, Analyzing, Results)
- `src/components/` - UI components
- `src/integrations/supabase/` - Auto-generated Supabase client

**Environment variables:**
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

### `apps/api/` - Backend

Hono + TypeScript + Trigger.dev

**Key files:**
- `src/index.ts` - Hono app entry point
- `src/routes/` - API route handlers
- `src/jobs/` - Trigger.dev job definitions
- `src/checks/` - Modular check implementations
- `src/scrapers/` - Scraping utilities (basic, Firecrawl)
- `src/lib/` - Shared utilities (logger, supabase, security)

**API Endpoints:**
- `POST /api/analyze` - Start analysis job
- `GET /api/jobs/:id` - Get job status/progress
- `POST /api/reports` - Generate and send PDF report
- `GET /health` - Health check

**Environment variables:**
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FIRECRAWL_API_KEY`
- `GOOGLE_PAGESPEED_API_KEY`
- `RESEND_API_KEY`
- `TRIGGER_SECRET_KEY` (optional)

## Packages

### `packages/shared/`

Shared constants and types used by both frontend and backend:
- Scoring configuration (weights, thresholds)
- Check definitions (IDs, names, max scores)
- Grade calculation
- TypeScript interfaces

### `packages/db/`

Database types and migrations:
- `src/types.ts` - TypeScript types matching Supabase schema
- `migrations/` - SQL migration files

## The 3-Layer Scoring Model (v2)

Phase 1 implements 13 automated checks (102 points, normalized to 0-100).

| Layer | Max | Subcategory | Phase 1 Checks |
|-------|-----|-------------|----------------|
| Find | 37 | Crawl Architecture | D1 AI Bot Access (7), D2 Sitemap (5), D3 Server Response Time (3), D11 LLMs.txt (2) |
| | | Semantic Data | D4 Product Schema (10), D5 WebSite Schema (3), D6 FAQ Content (3) |
| | | Distribution Signals | D7 Product Feed (4) |
| Trust | 20 | Brand Identity | T1 Organization Schema (12), T2 Trust Signals (8) |
| | | Community Signals | T3 Social Proof (manual), T4 Platform Presence (manual) |
| Buy | 45 | Protocol Support | X1 Checkout Data Completeness (20), D9 Checkout Integration (10) |
| | | Payment Infrastructure | X4 Payment Methods (15) |

**Phase 2 Stubs**: D8 Channel Detection, D10 SSR Detection, X2 MCP/ACP Detection, X3 Payment Protocol, X5 Checkout API

**Grading Scale:**
- 85-100: Agent-Native (MARKET LEADER)
- 70-84: Optimized (COMPETITIVE)
- 50-69: Needs Work (LOSING GROUND)
- 0-49: Invisible (INVISIBLE TO AI)

## Database Tables

- `analyses` - Analysis results
- `analysis_jobs` - Job queue with progress tracking (NEW)
- `email_captures` - Report request tracking
- `rate_limits` - IP-based rate limiting

## External APIs

1. **Firecrawl** - JS-rendered page scraping
2. **Resend** - Transactional email
3. **Trigger.dev** - Background job queue

## Migration Status

### Completed
- [x] Monorepo structure setup
- [x] Frontend moved to `apps/web/`
- [x] API scaffolding in `apps/api/`
- [x] Shared package with types/constants
- [x] Database migration SQL ready

### In Progress
- [ ] Port analysis checks to modular files
- [ ] Integrate Trigger.dev for job queue
- [ ] Update frontend to use new API

### Pending
- [ ] Deploy API to Railway
- [ ] Run parallel testing
- [ ] Full cutover from edge functions

## Key Patterns

### Smart Schema Extraction
Category page detection → Find product link → Scrape product page for full schema

### Firecrawl Cost Optimization
Try basic fetch first → Only use Firecrawl if JS rendering needed

### Job Queue Flow
Create job → Queue in Trigger.dev → Update progress → Complete/Fail with retry

## Security

- SSRF protection (block private IPs, metadata endpoints)
- Rate limiting (10 req/hour per IP)
- URL validation before scraping
- RLS policies on all tables

## AI Bot List

Checks robots.txt for 10 crawlers:
GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Anthropic-AI,
PerplexityBot, Google-Extended, Amazonbot, Applebot-Extended, Bytespider
