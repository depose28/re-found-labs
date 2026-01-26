
# Fix Plan: Schema Detection Issues in Agent Pulse

## Problem Summary

Agent Pulse is failing to detect product schema on sites like Allbirds, even when the schema is confirmed present in raw HTML. Testing with Googlebot User-Agent successfully finds the schema, but Agent Pulse does not.

## Root Causes Identified

After analyzing the codebase, I found these issues:

| Issue | Location | Impact |
|-------|----------|--------|
| Custom User-Agent may trigger bot blocking | `basicFetch()` line 219 | Sites return different/stripped content |
| Firecrawl may return processed HTML | `scrapeWithFirecrawl()` line 186 | JSON-LD scripts may be stripped |
| ProductGroup schema not handled | `findSchemaByType()` line 450 | Allbirds-style schemas missed |
| Missing rawHtml format from Firecrawl | `scrapeWithFirecrawl()` line 187 | Processed HTML loses script tags |
| Insufficient debug logging | Various | Hard to diagnose issues |

---

## Implementation Plan

### Phase 1: Fix Firecrawl HTML Fetching

**File:** `supabase/functions/analyze/index.ts`

**Change 1:** Request `rawHtml` format from Firecrawl instead of processed `html`

```typescript
// Current (line 187)
formats: ["html", "markdown"],

// Fixed
formats: ["rawHtml", "html", "markdown"],
```

**Change 2:** Prefer rawHtml over processed html

```typescript
// Current (line 203)
html: data.data?.html || "",

// Fixed - prefer rawHtml for schema extraction
html: data.data?.rawHtml || data.data?.html || "",
```

---

### Phase 2: Improve Basic Fetch User-Agent

**File:** `supabase/functions/analyze/index.ts`

**Change 3:** Use a more standard User-Agent that sites won't block

```typescript
// Current (line 219)
"User-Agent": "AgentPulseBot/1.0 (+https://refoundlabs.com)"

// Fixed - Use Googlebot-compatible UA for better compatibility
"User-Agent": "Mozilla/5.0 (compatible; AgentPulseBot/1.0; +https://refoundlabs.com) AppleWebKit/537.36"
```

This follows the pattern of legitimate crawlers while still identifying as Agent Pulse.

---

### Phase 3: Handle ProductGroup Schema

**File:** `supabase/functions/analyze/index.ts`

**Change 4:** Update `findSchemaByType()` to also find ProductGroup when looking for Product

```typescript
function findSchemaByType(schemas: any[], type: string): any | null {
  // Also check related types
  const typeVariants: Record<string, string[]> = {
    "Product": ["Product", "ProductGroup", "IndividualProduct"],
    "Offer": ["Offer", "AggregateOffer"]
  };
  
  const typesToCheck = typeVariants[type] || [type];
  
  for (const schema of schemas) {
    const schemaType = schema["@type"];
    for (const checkType of typesToCheck) {
      if (schemaType === checkType || 
          (Array.isArray(schemaType) && schemaType.includes(checkType))) {
        return schema;
      }
    }
  }
  return null;
}
```

---

### Phase 4: Enhanced JSON-LD Extraction

**File:** `supabase/functions/analyze/index.ts`

**Change 5:** Improve `extractAllSchemas()` with better parsing and fallback patterns

```typescript
function extractAllSchemas(html: string): any[] {
  const schemas: any[] = [];
  
  // Primary pattern - standard JSON-LD
  const jsonLdRegex = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = jsonLdRegex.exec(html)) !== null) {
    try {
      // Clean up common issues before parsing
      let jsonContent = match[1]
        .trim()
        .replace(/^\s*<!--/, '')  // Remove HTML comments
        .replace(/-->\s*$/, '')
        .replace(/\n/g, ' ')      // Normalize newlines
        .replace(/\t/g, ' ');     // Normalize tabs
      
      const json = JSON.parse(jsonContent);
      
      if (json["@graph"]) {
        schemas.push(...(Array.isArray(json["@graph"]) ? json["@graph"] : [json["@graph"]]));
      } else if (Array.isArray(json)) {
        schemas.push(...json);
      } else {
        schemas.push(json);
      }
    } catch (e) {
      console.log("Failed to parse JSON-LD block:", e);
      // Log the first 200 chars of failed content for debugging
      console.log("Content preview:", match[1].substring(0, 200));
    }
  }

  console.log(`Extracted ${schemas.length} schemas, types: ${schemas.map(s => s["@type"]).join(", ")}`);
  return schemas;
}
```

---

### Phase 5: Add Debug Logging

**File:** `supabase/functions/analyze/index.ts`

**Change 6:** Add detailed logging for schema detection

```typescript
// After line 2245, add:
console.log(`HTML length: ${html.length} chars`);
console.log(`Found ${schemas.length} schema objects`);
if (schemas.length > 0) {
  console.log(`Schema types found: ${schemas.map(s => s["@type"]).join(", ")}`);
}

// In validateProductSchema, add at start:
console.log(`Looking for Product schema among ${schemas.length} schemas`);
console.log(`Available types: ${schemas.map(s => s["@type"]).join(", ")}`);
```

---

## File Changes Summary

| File | Changes |
|------|---------|
| `supabase/functions/analyze/index.ts` | 6 targeted edits to fix schema detection |

---

## Technical Details

### Why rawHtml Matters

Firecrawl's `html` format returns processed/cleaned HTML optimized for readability. The `rawHtml` format returns the original page source including all `<script>` tags.

```text
html format:     Processed, may strip scripts
rawHtml format:  Original source, includes JSON-LD
```

### User-Agent Strategy

Many sites use bot detection. The current custom UA may trigger:
- Cloudflare protection
- Rate limiting
- Simplified/mobile content
- Complete blocking

The new UA format follows browser conventions while still identifying as a bot, which most sites accept.

### ProductGroup vs Product

Allbirds uses `ProductGroup` for products with variants:

```json
{
  "@type": "ProductGroup",
  "name": "Men's Wool Runners",
  "hasVariant": [
    { "@type": "Product", "sku": "variant1" },
    { "@type": "Product", "sku": "variant2" }
  ]
}
```

Our current code only looks for `"@type": "Product"` exactly, missing this pattern.

---

## Testing Plan

After implementation:

1. **Test with Allbirds URL:**
   - `https://www.allbirds.com/products/mens-wool-runners-natural-black`
   - Expected: Product schema detected with name, price, availability

2. **Check edge function logs:**
   - Verify HTML length is reasonable (>10KB suggests full page)
   - Verify schema types are logged
   - Verify no JSON-LD parse errors

3. **Test with other known-good sites:**
   - Nike.com product page
   - Amazon product page
   - Shopify store product page

---

## Expected Outcomes

| Metric | Before | After |
|--------|--------|-------|
| Schema detection on Allbirds | Fails | Passes |
| ProductGroup support | None | Full |
| Debug visibility | Minimal | Detailed |
| Bot-blocked sites | Common | Reduced |
