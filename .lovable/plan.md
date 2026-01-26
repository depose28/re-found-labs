
# Phase 1: Protocol Awareness - Distribution Pillar

## Overview

This plan adds a new **Distribution** pillar to Agent Pulse that evaluates whether a store is ready for agentic commerce protocols like Klarna's Agentic Product Protocol, Google Merchant, Facebook Catalog, and Amazon feeds. This is critical because AI agents increasingly discover products through centralized feeds and protocols, not just by crawling websites.

## Scoring Weight Adjustments

| Pillar | Current | New | Change |
|--------|---------|-----|--------|
| Discovery | 40 pts | 35 pts | -5 |
| Performance | 15 pts | 15 pts | unchanged |
| Transaction | 20 pts | 20 pts | unchanged |
| Trust | 25 pts | 15 pts | -10 |
| Distribution | - | 15 pts | NEW |
| **Total** | **100 pts** | **100 pts** | - |

---

## Implementation Tasks

### 1. Database Schema Update

Add new columns to the `analyses` table:

```sql
ALTER TABLE analyses
  ADD COLUMN platform_detected text,
  ADD COLUMN platform_name text,
  ADD COLUMN feeds_found jsonb,
  ADD COLUMN feed_validation jsonb,
  ADD COLUMN protocol_compatibility jsonb,
  ADD COLUMN distribution_score integer DEFAULT 0,
  ADD COLUMN distribution_max integer DEFAULT 15;
```

Update existing max columns to reflect new weights:
- `discovery_max`: 40 -> 35
- `trust_max`: 25 -> 15

---

### 2. Edge Function Changes (`supabase/functions/analyze/index.ts`)

#### A. Platform Detection Function

Detects the e-commerce platform powering the site:

| Platform | Detection Method |
|----------|------------------|
| Shopify | `Shopify.` in source, `cdn.shopify.com` assets, `/products.json` endpoint |
| WooCommerce | `woocommerce` classes, `/wp-json/wc/` API |
| Magento | `Mage.` or `magento` in source, `/rest/V1/` patterns |
| BigCommerce | `bigcommerce` scripts, stencil indicators |
| Custom | Fallback when none detected |

#### B. Feed Discovery Function

Discovers product feeds from multiple sources:

1. **Shopify Native**: Check `/products.json` and `/collections/all/products.json`
2. **Robots.txt**: Parse for feed URLs or Sitemap references
3. **Sitemap.xml**: Look for "product" or "feed" entries
4. **Common Paths**: Check `/feed.xml`, `/products.xml`, `/catalog.xml`, `/product-feed/`
5. **HTML**: Look for `<link rel="alternate">` with product/feed keywords
6. **JSON-LD**: Check for `DataFeed` or `ItemList` schema types

#### C. Feed Validation Function

For discovered feeds, perform basic validation:

| Feed Type | Validation |
|-----------|------------|
| JSON (Shopify) | Valid JSON, products array exists, count products, check title/price fields |
| XML | Valid XML, count item/product nodes |

#### D. Protocol Compatibility Calculation

| Protocol | Ready Condition |
|----------|-----------------|
| Google Merchant | Product feed exists with title, price, availability |
| Klarna APP | Feed exists + GTIN/SKU present in schema or feed |
| Facebook Catalog | Facebook pixel detected + product schema present |
| Amazon | Specific Amazon feed format detected |

#### E. Distribution Checks (15 points)

| Check ID | Check Name | Points | Pass Condition |
|----------|------------|--------|----------------|
| P1 | Platform Detection | 2 | Known e-commerce platform identified |
| P2 | Product Feed Exists | 5 | At least one feed URL found or native feed available |
| P3 | Feed Discoverable | 3 | Feed linked in sitemap, robots.txt, or HTML |
| P4 | Feed Accessible | 3 | Feed URL returns 200 and valid content |
| P5 | Protocol Indicators | 2 | Has GTIN/SKU or structured data mapping to protocols |

#### F. Update Scoring Logic

Adjust existing check weights:
- **D1 (AI Bot Access)**: 15 -> 12 pts
- **D2 (Product Schema)**: 15 -> 13 pts
- **D3 (Sitemap)**: 10 -> 10 pts (unchanged)
- **R1 (Organization)**: 15 -> 10 pts
- **R2 (Return Policy)**: 10 -> 5 pts

#### G. Distribution Recommendations

Add new recommendation templates for distribution checks:

| Check | Priority | Recommendation |
|-------|----------|----------------|
| No feed detected | Critical | "Your products are invisible to AI shopping protocols..." |
| Feed missing fields | High | "Your feed is missing GTIN/EAN identifiers..." |
| Feed not discoverable | Medium | "Feed exists but not easily discoverable..." |

---

### 3. Frontend Changes

#### A. `src/components/results/CategoryBreakdown.tsx`

Add Distribution as the 5th category with:
- Icon: `Radio` (from lucide-react, represents broadcasting/distribution)
- Label: "Distribution"
- Description: "Can protocols find your products?"
- Tips: ["Product feed available", "Feed in sitemap/robots.txt", "GTIN/SKU identifiers"]

Update props interface to accept `distribution` prop.

#### B. `src/components/results/ChecksAccordion.tsx`

Add `distribution` to `categoryConfig`:
```typescript
distribution: { 
  icon: Radio, 
  label: "Distribution", 
  description: "Protocol & feed readiness" 
}
```

Add `categoryOrder` entry for "distribution" between "transaction" and "trust".

Add new `CheckDataDisplay` cases for distribution checks:
- Platform badge display
- Feed list with product counts
- Protocol compatibility matrix icons

#### C. `src/pages/Results.tsx`

Update `AnalysisResult` interface to include:
```typescript
distribution_score: number;
distribution_max: number | null;
platform_detected: string | null;
platform_name: string | null;
feeds_found: any;
protocol_compatibility: any;
```

Pass `distribution` prop to `CategoryBreakdown`:
```typescript
distribution={{ 
  score: analysis.distribution_score, 
  max: analysis.distribution_max ?? 15 
}}
```

#### D. `src/components/results/ScoreHeader.tsx`

No changes needed - score calculation already uses total from database.

#### E. `src/components/results/RecommendationsSection.tsx`

Add quick links for distribution recommendations:
- Link to Google Merchant Center docs
- Link to Klarna APP documentation
- Link to Schema.org DataFeed

---

### 4. Update Memory/Documentation

Update `README.md` to reflect:
- 5 pillars instead of 4
- New scoring weights
- Distribution check descriptions
- Protocol compatibility feature

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/analyze/index.ts` | Edit | Add platform detection, feed discovery, distribution checks, update scoring |
| `src/components/results/CategoryBreakdown.tsx` | Edit | Add Distribution category, update props |
| `src/components/results/ChecksAccordion.tsx` | Edit | Add distribution category config, new check displays |
| `src/pages/Results.tsx` | Edit | Update interface, pass distribution props |
| `src/components/results/RecommendationsSection.tsx` | Edit | Add distribution quick links |
| `README.md` | Edit | Update pillar descriptions and scoring |

**Database Migration**: Add new columns via Lovable migration tool

---

## Technical Considerations

### Feed Discovery Performance

The feed discovery logic adds extra HTTP requests:
- `/products.json` (Shopify check)
- Common feed paths (4-5 requests max)

To minimize latency, these will be added to the existing `Promise.all` parallel fetch block and will fail gracefully (no feed found) if endpoints return errors.

### Firecrawl Integration

The existing Firecrawl integration already fetches the full HTML. Platform detection will use the HTML already scraped. Feed discovery requires additional targeted fetches that don't need JavaScript rendering, so basic `fetch()` is sufficient.

### Protocol Compatibility Matrix Display

The UI will show a simple grid:
```
[Google] ✓  [Klarna] ⚠️  [Facebook] ✓  [Amazon] ✗
```

Using color-coded badges:
- Green (✓): Ready
- Orange (⚠️): Partial
- Red (✗): Not detected

---

## Dependencies

- **Firecrawl Connector**: Already available but not linked. Should be connected for optimal scraping (graceful fallback to basic fetch exists).
- No new npm packages required.
