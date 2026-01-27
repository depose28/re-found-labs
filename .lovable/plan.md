
# Plan: Fix Distribution Pillar False Negatives

## Overview

The analysis engine currently only checks the exact URL submitted by the user. When users submit category pages (which is the common case), the tool misses Product schema that exists on individual product pages, causing false negatives and damaging credibility.

This plan implements smart detection that follows category pages to product pages when needed, adds partial credit for category-page schema, improves empty feed detection, enhances platform detection, and refines result messaging.

---

## Architecture

```text
Current Flow:
User submits URL → Scrape URL → Extract schemas → Score based on that page only

New Flow:
User submits URL → Scrape URL → Detect page type
                                    ↓
                    ┌───────────────┴───────────────┐
                    ↓                               ↓
            Category/Collection Page         Product Page
                    ↓                               ↓
            Check for Product schema         Use schemas directly
                    ↓
            If no full Product schema found
                    ↓
            Find product link on page → Scrape product page
                    ↓
            Use best result from either page
```

---

## Changes

### File: `supabase/functions/analyze/index.ts`

#### 1. Add Category Page Detection Helper

Add a new function after the `extractAllSchemas` function (around line 500):

```typescript
// ============================================
// PAGE TYPE DETECTION
// ============================================

interface PageTypeInfo {
  isCategory: boolean;
  isCategoryByUrl: boolean;
  isCategoryBySchema: boolean;
  categoryPatterns: string[];
}

function detectPageType(url: string, schemas: any[]): PageTypeInfo {
  const urlLower = url.toLowerCase();
  const categoryPatterns: string[] = [];
  
  // URL-based detection
  const categoryUrlPatterns = ['/c/', '/category/', '/categories/', '/collection/', '/collections/', '/shop/', '/catalog/'];
  const isCategoryByUrl = categoryUrlPatterns.some(pattern => {
    if (urlLower.includes(pattern)) {
      categoryPatterns.push(`URL contains "${pattern}"`);
      return true;
    }
    return false;
  });
  
  // Schema-based detection
  const hasCollectionPage = schemas.some(s => 
    s["@type"] === "CollectionPage" || 
    s["@type"] === "ItemList" ||
    s["@type"] === "SearchResultsPage"
  );
  
  if (hasCollectionPage) {
    categoryPatterns.push("CollectionPage/ItemList schema detected");
  }
  
  return {
    isCategory: isCategoryByUrl || hasCollectionPage,
    isCategoryByUrl,
    isCategoryBySchema: hasCollectionPage,
    categoryPatterns
  };
}

function findProductLinkOnPage(html: string, baseUrl: string): string | null {
  const urlObj = new URL(baseUrl);
  const domain = urlObj.origin;
  
  // Product URL patterns
  const productPatterns = [
    /href=["']([^"']*\/p\/[^"']+)["']/gi,
    /href=["']([^"']*\/product\/[^"']+)["']/gi,
    /href=["']([^"']*\/products\/[^"']+)["']/gi,
    /href=["']([^"']*\/item\/[^"']+)["']/gi,
    /href=["']([^"']*\/pd\/[^"']+)["']/gi,
    /href=["']([^"']*-p-\d+[^"']*)["']/gi,
  ];
  
  for (const pattern of productPatterns) {
    const match = pattern.exec(html);
    if (match && match[1]) {
      let productUrl = match[1];
      
      // Make absolute URL
      if (productUrl.startsWith('/')) {
        productUrl = domain + productUrl;
      } else if (!productUrl.startsWith('http')) {
        productUrl = domain + '/' + productUrl;
      }
      
      // Validate it's on the same domain
      try {
        const productUrlObj = new URL(productUrl);
        if (productUrlObj.hostname === urlObj.hostname) {
          return productUrl;
        }
      } catch {
        continue;
      }
    }
  }
  
  return null;
}
```

#### 2. Add Schema Quality Assessment Helper

Add after the above functions:

```typescript
interface SchemaQuality {
  level: 'full' | 'partial' | 'none';
  hasProduct: boolean;
  hasOffer: boolean;
  hasGtin: boolean;
  hasAggregateOffer: boolean;
  hasItemList: boolean;
  productCount?: number;
}

function assessSchemaQuality(schemas: any[]): SchemaQuality {
  const productSchema = findSchemaByType(schemas, "Product");
  const offerSchema = findSchemaByType(schemas, "Offer");
  const aggregateOffer = findSchemaByType(schemas, "AggregateOffer");
  const itemList = findSchemaByType(schemas, "ItemList");
  
  const hasProduct = !!productSchema;
  const hasOffer = !!(offerSchema || productSchema?.offers);
  const hasGtin = !!(productSchema?.gtin || productSchema?.sku || productSchema?.mpn);
  const hasAggregateOffer = !!aggregateOffer;
  const hasItemList = !!itemList;
  
  // Count products in ItemList
  let productCount = 0;
  if (itemList?.itemListElement) {
    productCount = Array.isArray(itemList.itemListElement) 
      ? itemList.itemListElement.length 
      : 1;
  }
  
  // Determine quality level
  let level: 'full' | 'partial' | 'none' = 'none';
  if (hasProduct && hasOffer) {
    level = 'full';
  } else if (hasAggregateOffer || hasItemList || hasProduct) {
    level = 'partial';
  }
  
  return { level, hasProduct, hasOffer, hasGtin, hasAggregateOffer, hasItemList, productCount };
}
```

#### 3. Add Smart Schema Extraction Function

Add a new function that orchestrates the category-to-product page flow:

```typescript
interface SmartSchemaResult {
  schemas: any[];
  schemaQuality: SchemaQuality;
  productValidation: SchemaValidation;
  sourceUrl: string;
  checkedProductPage: boolean;
  productPageUrl?: string;
  categoryPageSchemas?: any[];
  message: string;
}

async function extractSchemasSmartly(
  html: string, 
  url: string, 
  domain: string
): Promise<SmartSchemaResult> {
  // Extract schemas from submitted URL
  const schemas = extractAllSchemas(html);
  const pageType = detectPageType(url, schemas);
  const schemaQuality = assessSchemaQuality(schemas);
  
  console.log(`[SmartSchema] Page type: ${pageType.isCategory ? 'Category' : 'Product'}, Schema quality: ${schemaQuality.level}`);
  
  // If we have full Product + Offer schema, use it
  if (schemaQuality.level === 'full') {
    const productValidation = validateProductSchema(schemas);
    return {
      schemas,
      schemaQuality,
      productValidation,
      sourceUrl: url,
      checkedProductPage: false,
      message: "Product schema found on submitted page"
    };
  }
  
  // If it's a category page without full schema, try to find a product page
  if (pageType.isCategory && schemaQuality.level !== 'full') {
    console.log(`[SmartSchema] Category page detected with ${schemaQuality.level} schema, looking for product link...`);
    
    const productLink = findProductLinkOnPage(html, url);
    
    if (productLink) {
      console.log(`[SmartSchema] Found product link: ${productLink}`);
      
      try {
        // Scrape the product page
        const productPageResult = await withTimeout(
          scrapeWithFirecrawl(productLink),
          CHECK_TIMEOUT_MS,
          { html: "", metadata: {} },
          "Product page scrape"
        );
        
        if (productPageResult.html && productPageResult.html.length > 0) {
          const productPageSchemas = extractAllSchemas(productPageResult.html);
          const productPageQuality = assessSchemaQuality(productPageSchemas);
          
          console.log(`[SmartSchema] Product page schema quality: ${productPageQuality.level}`);
          
          // Use product page schemas if they're better
          if (productPageQuality.level === 'full' || 
              (productPageQuality.level === 'partial' && schemaQuality.level === 'none')) {
            const productValidation = validateProductSchema(productPageSchemas);
            return {
              schemas: productPageSchemas,
              schemaQuality: productPageQuality,
              productValidation,
              sourceUrl: productLink,
              checkedProductPage: true,
              productPageUrl: productLink,
              categoryPageSchemas: schemas,
              message: schemaQuality.level === 'none' 
                ? "Product schema found on product pages"
                : "Full Product schema found on product pages (category page has partial data)"
            };
          }
        }
      } catch (error) {
        console.log(`[SmartSchema] Failed to scrape product page: ${error}`);
      }
    }
    
    // Couldn't find better schema on product page
    const productValidation = validateProductSchema(schemas);
    return {
      schemas,
      schemaQuality,
      productValidation,
      sourceUrl: url,
      checkedProductPage: !!productLink,
      productPageUrl: productLink || undefined,
      message: schemaQuality.level === 'partial'
        ? "Category page has partial schema. Product pages may have complete data."
        : "No structured data found on category or product pages"
    };
  }
  
  // Not a category page, use what we have
  const productValidation = validateProductSchema(schemas);
  return {
    schemas,
    schemaQuality,
    productValidation,
    sourceUrl: url,
    checkedProductPage: false,
    message: schemaQuality.level === 'none' 
      ? "No structured product data found"
      : "Partial schema found on page"
  };
}
```

#### 4. Update Platform Detection (Lines 728-827)

Enhance the `detectPlatform` function to add eobuwie detection and improve fallback logic:

```typescript
function detectPlatform(html: string, domain: string): PlatformDetection {
  const result: PlatformDetection = {
    detected: false,
    platform: null,
    confidence: "low",
    indicators: []
  };

  const lowerHtml = html.toLowerCase();

  // eobuwie/MODIVO detection (add before Shopify)
  if (lowerHtml.includes("img.eobuwie.cloud") || 
      lowerHtml.includes("eobuwie.") ||
      lowerHtml.includes("modivo.")) {
    result.detected = true;
    result.platform = "eobuwie/MODIVO";
    result.confidence = "high";
    result.indicators.push("eobuwie platform assets detected");
    return result;
  }

  // Shopify detection
  if (lowerHtml.includes("shopify.") || 
      lowerHtml.includes("cdn.shopify.com") ||
      lowerHtml.includes("myshopify.com") ||
      lowerHtml.includes("shopify_analytics") ||
      lowerHtml.includes('"shopify"')) {
    result.detected = true;
    result.platform = "Shopify";
    result.confidence = "high";
    result.indicators.push("Shopify CDN/scripts detected");
    return result;
  }

  // ... (keep existing WooCommerce, Magento, BigCommerce, etc. detection)

  // Enhanced fallback: If no platform but good e-commerce signals
  const ecommerceSignals = [
    lowerHtml.includes("add-to-cart"),
    lowerHtml.includes("add_to_cart"),
    lowerHtml.includes("checkout"),
    lowerHtml.includes("shopping-cart"),
    lowerHtml.includes("product-price"),
    lowerHtml.includes("buy-now"),
    lowerHtml.includes("cart-button")
  ].filter(Boolean).length;

  if (ecommerceSignals >= 2) {
    result.detected = true;
    result.platform = "Custom";
    result.confidence = ecommerceSignals >= 4 ? "medium" : "low";
    result.indicators.push(`${ecommerceSignals} e-commerce patterns detected`);
  }

  return result;
}
```

#### 5. Update Feed Validation for Empty Feeds (Lines 853-919)

Enhance the `checkFeedUrl` helper to detect empty feeds:

```typescript
async function checkFeedUrl(url: string, type: "json" | "xml" | "rss" | "unknown", source: FeedInfo["source"]): Promise<FeedInfo | null> {
  // ... existing URL setup code ...

  try {
    // ... existing fetch code ...

    const content = await response.text();
    const feedInfo: FeedInfo = {
      url: url.startsWith("http") ? url : url,
      type,
      source,
      accessible: true,
      productCount: 0,  // Default to 0
      hasRequiredFields: false  // Default to false
    };

    // Validate JSON feed
    if (type === "json" || content.trim().startsWith("{") || content.trim().startsWith("[")) {
      try {
        const json = JSON.parse(content);
        
        // Check for empty feed
        if (Object.keys(json).length === 0) {
          feedInfo.productCount = 0;
          feedInfo.hasRequiredFields = false;
          feedInfo.isEmpty = true;  // New field
          return feedInfo;
        }
        
        if (Array.isArray(json) && json.length === 0) {
          feedInfo.productCount = 0;
          feedInfo.hasRequiredFields = false;
          feedInfo.isEmpty = true;
          return feedInfo;
        }
        
        const products = json.products || json.items || (Array.isArray(json) ? json : null);
        if (products && Array.isArray(products)) {
          feedInfo.type = "json";
          feedInfo.productCount = products.length;
          
          if (products.length === 0) {
            feedInfo.isEmpty = true;
            feedInfo.hasRequiredFields = false;
            return feedInfo;
          }
          
          // ... rest of existing validation ...
        }
        return feedInfo;
      } catch {
        // Not valid JSON
      }
    }

    // ... rest of existing XML validation ...
  } catch (e) {
    return null;
  }
}
```

Also update the `FeedInfo` interface to include the new field:

```typescript
interface FeedInfo {
  url: string;
  type: "json" | "xml" | "rss" | "unknown";
  source: "native" | "sitemap" | "robots" | "html" | "common-path" | "guessed";
  accessible: boolean;
  productCount?: number;
  hasRequiredFields?: boolean;
  missingFields?: string[];
  isEmpty?: boolean;  // New field
}
```

#### 6. Update P2 Check (Structured Data Complete) for Partial Credit (Lines 1322-1359)

Update the P2 check to use the smart schema result and award partial credit for category page schema:

```typescript
// P2: Structured Data Complete (3 points) - Updated for category page handling
const hasGtin = !!(smartSchemaResult.productValidation.schema?.gtin || 
                   smartSchemaResult.productValidation.schema?.sku || 
                   smartSchemaResult.productValidation.schema?.mpn);
const hasOffer = !!(smartSchemaResult.productValidation.schema?.offers);
const p2: Check = {
  id: "P2",
  name: "Structured Data Complete",
  category: "distribution",
  status: "fail",
  score: 0,
  maxScore: 3,
  details: "",
  data: { 
    hasProduct: smartSchemaResult.productValidation.found,
    hasOffer,
    hasGtin,
    missingFields: smartSchemaResult.productValidation.missingFields,
    schemaSource: smartSchemaResult.sourceUrl,
    checkedProductPage: smartSchemaResult.checkedProductPage,
    schemaQuality: smartSchemaResult.schemaQuality.level
  }
};

if (smartSchemaResult.productValidation.found && hasOffer && hasGtin) {
  p2.status = "pass";
  p2.score = 3;
  p2.details = smartSchemaResult.checkedProductPage 
    ? "Complete: Product + Offer + GTIN/SKU (found on product pages)"
    : "Complete: Product + Offer + GTIN/SKU";
} else if (smartSchemaResult.productValidation.found && hasOffer) {
  p2.status = "partial";
  p2.score = 2;
  p2.details = smartSchemaResult.checkedProductPage
    ? "Product + Offer present on product pages, missing GTIN/SKU"
    : "Product + Offer present, missing GTIN/SKU";
} else if (smartSchemaResult.schemaQuality.hasAggregateOffer || smartSchemaResult.schemaQuality.hasItemList) {
  // Partial credit for category page schema
  p2.status = "partial";
  p2.score = 2;
  p2.details = smartSchemaResult.schemaQuality.hasItemList
    ? `ItemList with ${smartSchemaResult.schemaQuality.productCount || 'multiple'} products detected`
    : "AggregateOffer schema detected (price range data)";
} else if (smartSchemaResult.productValidation.found) {
  p2.status = "partial";
  p2.score = 1;
  p2.details = "Product schema only, missing Offer and identifiers";
} else {
  p2.status = "fail";
  p2.score = 0;
  p2.details = smartSchemaResult.message;
}
```

#### 7. Update P3 Check for Empty Feed Detection (Lines 1361-1391)

```typescript
// P3: Product Feed Exists (3 points) - Updated for empty feed handling
const p3: Check = {
  id: "P3",
  name: "Product Feed Exists",
  category: "distribution",
  status: "fail",
  score: 0,
  maxScore: 3,
  details: "",
  data: { feeds: feeds.map(f => ({ url: f.url, type: f.type, source: f.source, productCount: f.productCount, isEmpty: f.isEmpty })) }
};

// Check for empty feeds
const emptyFeeds = feeds.filter(f => f.isEmpty);
const nonEmptyFeeds = feeds.filter(f => !f.isEmpty && f.productCount && f.productCount > 0);
const nonEmptyPrimaryFeed = nonEmptyFeeds[0];

if (nonEmptyPrimaryFeed && nonEmptyPrimaryFeed.productCount > 0) {
  p3.status = "pass";
  p3.score = 3;
  p3.details = `Feed found (${nonEmptyPrimaryFeed.productCount} products at ${nonEmptyPrimaryFeed.url})`;
} else if (emptyFeeds.length > 0) {
  // Feed exists but is empty
  p3.status = "fail";
  p3.score = 0;
  p3.details = `Feed exists at ${emptyFeeds[0].url} but is empty (0 products)`;
  p3.data.isEmpty = true;
} else if (feeds.length > 0) {
  p3.status = "partial";
  p3.score = 1;
  p3.details = `Feed detected at ${feeds[0].url} but could not verify product count`;
} else if (platform.platform === "Shopify") {
  p3.status = "partial";
  p3.score = 1;
  p3.details = "Shopify detected — native feed should be at /products.json";
} else {
  p3.status = "fail";
  p3.score = 0;
  p3.details = "No product feed detected";
}
```

#### 8. Update P1 Check for Better Platform Messaging (Lines 1294-1319)

```typescript
// P1: Platform Detection (1 point) - Updated messaging
const p1: Check = {
  id: "P1",
  name: "Platform Detected",
  category: "distribution",
  status: "fail",
  score: 0,
  maxScore: 1,
  details: "",
  data: { platform: platform.platform, confidence: platform.confidence, indicators: platform.indicators }
};

if (platform.detected && platform.platform !== "Custom") {
  p1.status = "pass";
  p1.score = 1;
  p1.details = `${platform.platform} platform detected`;
} else if (platform.platform === "Custom" && platform.confidence === "medium") {
  // Good e-commerce signals but unknown platform
  p1.status = "pass";
  p1.score = 1;
  p1.details = "Custom e-commerce platform with good infrastructure";
} else if (platform.platform === "Custom") {
  p1.status = "partial";
  p1.score = 0;
  p1.details = "Custom platform detected (limited e-commerce signals)";
} else {
  p1.status = "fail";
  p1.score = 0;
  p1.details = "No e-commerce platform signals detected";
}
```

#### 9. Update Main Handler to Use Smart Schema Extraction (Lines 2315-2350)

Modify the main analysis flow to use the new smart schema extraction:

```typescript
// After scraping, use smart schema extraction
const smartSchemaResult = await withTimeout(
  extractSchemasSmartly(html, normalizedUrl, domain),
  CHECK_TIMEOUT_MS * 2,  // Allow extra time for potential product page fetch
  {
    schemas: extractAllSchemas(html),
    schemaQuality: assessSchemaQuality(extractAllSchemas(html)),
    productValidation: validateProductSchema(extractAllSchemas(html)),
    sourceUrl: normalizedUrl,
    checkedProductPage: false,
    message: "Schema extraction timed out"
  },
  "Smart schema extraction"
);

console.log(`[Analysis] Smart schema result: ${smartSchemaResult.message}`);

// Use the smart schema result for validation
const schemas = smartSchemaResult.schemas;
const { check: d2, validation: productValidation } = {
  check: checkProductSchemaDeep(schemas).check,
  validation: smartSchemaResult.productValidation
};

// Update D2 check message based on smart schema result
if (smartSchemaResult.checkedProductPage) {
  d2.data.schemaSource = smartSchemaResult.productPageUrl;
  d2.data.checkedProductPage = true;
  if (d2.status === "pass") {
    d2.details = d2.details.replace("Complete", "Complete (from product pages)");
  }
}
```

---

## Summary of Changes

| Area | Change |
|------|--------|
| Page Type Detection | New helpers to identify category vs product pages |
| Smart Schema Extraction | Follow category pages to product pages when needed |
| Schema Quality Assessment | Track partial schema (AggregateOffer, ItemList) |
| P2 (Structured Data) | Award 2/3 points for category page schema |
| P3 (Feed Exists) | Detect and report empty feeds as 0 points |
| P1 (Platform) | Add eobuwie detection, "Custom" with confidence levels |
| Result Messaging | Context-aware messages based on what was checked |

---

## Testing Verification

After implementation, these test cases should produce correct results:

1. **eschuhe.de category page**
   - Should follow to product page and find schema
   - Platform: "eobuwie/MODIVO" 
   - Structured Data: 2-3 points

2. **Shopify store category page**
   - Should follow to product page
   - Platform: "Shopify"
   - Structured Data: Based on product pages

3. **Site with genuinely no schema**
   - Message: "No structured data found on category or product pages"
   - Structured Data: 0 points

4. **Empty /products.json feed**
   - Message: "Feed exists but is empty (0 products)"
   - Feed Exists: 0 points
