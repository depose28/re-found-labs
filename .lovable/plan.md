
# Plan: Optimize Firecrawl Usage for Credit Efficiency

## Overview

This plan optimizes Agent Pulse to minimize Firecrawl API credits while maintaining analysis accuracy. The key insight is that Firecrawl (JS rendering) is only needed for schema extraction from product pages - most other checks can use basic HTTP fetches.

---

## Current State Analysis

### Where Firecrawl Credits Are Used

| Call | Location | When | Credits |
|------|----------|------|---------|
| Main page scrape | Line 756 | Always | 1 |
| Product page scrape | Line 801 | Category pages without schema | 1 |

**Current cost per analysis: 1-2 credits**

### What Actually Needs JavaScript Rendering

| Check | Needs JS Rendering? | Reason |
|-------|---------------------|--------|
| JSON-LD Schema | YES | Often injected by JS frameworks |
| Platform Detection | NO | HTML patterns visible in source |
| robots.txt | NO | Static text file |
| sitemap.xml | NO | Static XML file |
| Product Feeds | NO | Static JSON/XML endpoints |
| Payment Rails | MAYBE | Some payment widgets load via JS |

---

## Proposed Optimization Strategy

### Strategy 1: Tiered Scraping Approach

Try basic fetch first, fall back to Firecrawl only when needed:

```text
User submits URL
       │
       ▼
┌─────────────────────────────────┐
│  1. basicFetch(url)             │  ← FREE (no credits)
│     - Check HTML size           │
│     - Extract schemas           │
│     - Detect platform           │
└─────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│  2. Is schema found AND valid?  │
│     OR is HTML clearly static?  │
└─────────────────────────────────┘
       │
    NO │                    YES
       ▼                     ▼
┌─────────────────────┐  ┌─────────────────────┐
│ 3. scrapeWithFire-  │  │ Continue with basic │
│    crawl(url)       │  │ fetch result        │
│    (1 credit)       │  │ (0 credits)         │
└─────────────────────┘  └─────────────────────┘
```

### Strategy 2: Reduce waitFor Time

Current: 5000ms (5 seconds)
Most sites render JSON-LD within 1-2 seconds.

```typescript
// Current
waitFor: 5000

// Optimized (save 3s per scan, reduce timeout costs)
waitFor: 3000
```

### Strategy 3: Request Only Needed Formats

Current: `["rawHtml", "html", "links"]`
We don't use `links` for anything critical.

```typescript
// Current
formats: ["rawHtml", "html", "links"]

// Optimized (slightly faster response)
formats: ["rawHtml"]
```

### Strategy 4: Skip Product Page Scrape When Possible

Currently, if category page has partial schema (ItemList, AggregateOffer), we still try to scrape a product page. Instead:

- Award partial credit for category-level schema
- Only follow to product page if schema is completely absent

---

## Implementation Details

### File: `supabase/functions/analyze/index.ts`

#### 1. Add Smart Scraping Decision Function

Add after the `basicFetch` function (around line 287):

```typescript
interface ScrapeDecision {
  needsFirecrawl: boolean;
  reason: string;
  html?: string;
  metadata?: any;
}

async function decideScrapingStrategy(url: string): Promise<ScrapeDecision> {
  // First, try basic fetch
  try {
    const basicResult = await basicFetch(url);
    const html = basicResult.html;
    
    // Check if we got meaningful content
    if (!html || html.length < 500) {
      return { needsFirecrawl: true, reason: "HTML too short, likely JS-rendered" };
    }
    
    // Check for signs of JS-only rendering
    const jsOnlySignals = [
      html.includes('id="__next"') && !html.includes('application/ld+json'),
      html.includes('id="app"') && html.length < 5000,
      html.includes('noscript') && html.includes('enable JavaScript'),
      html.match(/<body[^>]*>\s*<div[^>]*><\/div>\s*<script/i),
    ].filter(Boolean).length;
    
    if (jsOnlySignals >= 2) {
      return { needsFirecrawl: true, reason: "JS-only rendering detected" };
    }
    
    // Check if we already have schema
    const schemas = extractAllSchemas(html);
    const productSchema = findSchemaByType(schemas, "Product");
    
    if (productSchema && productSchema.offers) {
      // Full schema found with basic fetch - no Firecrawl needed!
      return { 
        needsFirecrawl: false, 
        reason: "Full Product schema found in static HTML",
        html,
        metadata: basicResult.metadata
      };
    }
    
    // Check for known static platforms
    const staticPlatforms = [
      html.includes('woocommerce'),  // WooCommerce usually server-renders
      html.includes('prestashop'),    // PrestaShop is PHP
      html.includes('magento'),       // Magento server-renders
    ].some(Boolean);
    
    if (staticPlatforms && schemas.length > 0) {
      return {
        needsFirecrawl: false,
        reason: "Static platform with schema detected",
        html,
        metadata: basicResult.metadata
      };
    }
    
    // Check for Shopify (hybrid - sometimes needs JS)
    if (html.includes('shopify')) {
      // Shopify usually has schema in static HTML
      if (productSchema) {
        return { needsFirecrawl: false, reason: "Shopify with Product schema", html, metadata: basicResult.metadata };
      }
      // Shopify category pages need Firecrawl
      return { needsFirecrawl: true, reason: "Shopify page without Product schema" };
    }
    
    // Default: use Firecrawl for safety
    return { needsFirecrawl: true, reason: "Could not confirm static rendering" };
    
  } catch (error) {
    return { needsFirecrawl: true, reason: `Basic fetch failed: ${error}` };
  }
}
```

#### 2. Update Main Handler to Use Smart Strategy

Replace the current scrape call (around line 2756) with:

```typescript
// Smart scraping: try basic first, use Firecrawl only if needed
console.log("[Analysis] Determining scraping strategy...");

const scrapeDecision = await decideScrapingStrategy(normalizedUrl);
console.log(`[Analysis] Scrape decision: ${scrapeDecision.needsFirecrawl ? 'Firecrawl needed' : 'Basic fetch sufficient'} - ${scrapeDecision.reason}`);

let scrapeResult: { html: string; metadata: any };

if (scrapeDecision.needsFirecrawl) {
  scrapeResult = await withTimeout(
    scrapeWithFirecrawl(normalizedUrl), 
    CHECK_TIMEOUT_MS, 
    defaultScrapeResult, 
    "Firecrawl scrape"
  );
} else {
  scrapeResult = {
    html: scrapeDecision.html || "",
    metadata: { ...scrapeDecision.metadata, firecrawlSkipped: true, skipReason: scrapeDecision.reason }
  };
}
```

#### 3. Reduce Firecrawl Wait Time

Update the `scrapeWithFirecrawl` function (line 224):

```typescript
// Before
waitFor: 5000

// After - 3s is enough for most sites
waitFor: 3000
```

#### 4. Simplify Formats Requested

Update the `scrapeWithFirecrawl` function (line 222):

```typescript
// Before
formats: ["rawHtml", "html", "links"]

// After - we only use rawHtml for schema extraction
formats: ["rawHtml"]
```

#### 5. Optimize Product Page Follow Logic

Update `extractSchemasSmartly` (around line 790) to be more conservative:

```typescript
// Only follow to product page if schema is COMPLETELY absent
// Not just partial - partial is still useful
if (pageType.isCategory && schemaQuality.level === 'none') {
  console.log(`[SmartSchema] Category page with NO schema, looking for product link...`);
  
  const productLink = findProductLinkOnPage(html, url);
  
  if (productLink) {
    // Only use Firecrawl if we haven't already used it for main page
    const productPageResult = await withTimeout(
      scrapeWithFirecrawl(productLink),
      CHECK_TIMEOUT_MS,
      { html: "", metadata: {} },
      "Product page scrape"
    );
    // ... rest of logic
  }
}

// If partial schema, DON'T follow - just use what we have
if (pageType.isCategory && schemaQuality.level === 'partial') {
  const productValidation = validateProductSchema(schemas);
  return {
    schemas,
    schemaQuality,
    productValidation,
    sourceUrl: url,
    checkedProductPage: false,
    message: "Using partial schema from category page (conserving API credits)"
  };
}
```

---

## Expected Credit Savings

| Scenario | Current | After Optimization |
|----------|---------|-------------------|
| Static site with schema | 1 credit | 0 credits |
| Shopify product page | 1 credit | 0-1 credits |
| Shopify category page | 2 credits | 1 credit |
| SPA with no static content | 1-2 credits | 1-2 credits |
| WooCommerce store | 1 credit | 0 credits |

**Estimated savings: 30-50% reduction in Firecrawl credits**

---

## Rate Limiting Considerations

The current rate limits are:
- 10 analyses per hour per IP
- 3 deep crawls per hour per IP

These remain unchanged. The optimization is purely about reducing external API costs.

---

## Monitoring and Logging

Add logging to track credit usage:

```typescript
// At end of analysis, log scraping method used
console.log(`[Credits] Analysis completed. Firecrawl used: ${scrapeResult.metadata?.firecrawlUsed ? 'Yes' : 'No'}, Product page scraped: ${smartSchemaResult.checkedProductPage ? 'Yes' : 'No'}`);
```

---

## Summary of Changes

| File | Change | Impact |
|------|--------|--------|
| `analyze/index.ts` | Add `decideScrapingStrategy()` | Try basic fetch first |
| `analyze/index.ts` | Update main handler | Use smart strategy |
| `analyze/index.ts` | Reduce `waitFor` to 3s | Faster responses |
| `analyze/index.ts` | Request only `rawHtml` | Smaller payloads |
| `analyze/index.ts` | Skip product page for partial schema | Fewer API calls |

---

## Testing Plan

After implementation, test with these URL types:

1. **Static WooCommerce site** - Should use 0 Firecrawl credits
2. **Shopify product page** - Should use 0-1 credits
3. **Shopify category page** - Should use 1 credit (not 2)
4. **SPA store (React)** - Should use 1-2 credits (Firecrawl required)
5. **eobuwie.de category** - Should use 1 credit for main + potentially 1 for product

