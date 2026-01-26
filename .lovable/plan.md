
# CTO Feedback Implementation: Distribution Pillar Overhaul

## Overview

This plan implements the CTO's recommendations to transform the Distribution pillar from a **feed-centric** approach to a **protocol-centric** approach. The key changes include restructuring into 3 layers (Discovery, Commerce, Payment), removing legacy protocols (Facebook Catalog, Amazon), and adding detection for emerging agentic protocols (UCP, ACP, MCP).

---

## Phase 1.5: Immediate Implementation (Next Sprint)

### 1. Database Schema Update

No schema changes required - existing columns support the new data structures. The `protocol_compatibility` JSONB column will store the new 3-layer format.

---

### 2. Edge Function Changes (`supabase/functions/analyze/index.ts`)

#### A. Remove Outdated Protocols

Remove Facebook Catalog and Amazon from the protocol compatibility matrix:

| Protocol | Status | Reason |
|----------|--------|--------|
| Facebook Catalog | REMOVE | Legacy advertising feed, not agentic |
| Amazon | REMOVE | Walled garden, doesn't use open protocols |

#### B. Restructure Protocol Compatibility into 3 Layers

**New Structure:**

```text
DISCOVERY LAYER (Can agents find products?)
├── Google Shopping    ✓/⚠️/✗
├── Klarna APP         ✓/⚠️/✗
└── Answer Engines     ✓/⚠️/✗

COMMERCE LAYER (Can agents transact?)
├── UCP               ✓/⚠️/✗
├── ACP (ChatGPT)     ✓/⚠️/✗
└── MCP               ✓/⚠️/✗

PAYMENT LAYER (What rails exist?)
└── Stripe · Google Pay · Apple Pay · Klarna · PayPal
```

#### C. New Detection Functions

**1. UCP Manifest Detection**

```typescript
async function checkUCPManifest(domain: string) {
  const paths = [
    '/.well-known/ucp.json',
    '/.well-known/commerce.json',
    '/api/commerce/manifest'
  ];
  // Returns { found: boolean, capabilities?: string[], version?: string }
}
```

**2. MCP Server Detection**

```typescript
async function checkMCPServer(domain: string, html: string) {
  const paths = [
    '/.well-known/mcp.json',
    '/mcp/capabilities',
    '/.well-known/ai-plugin.json'
  ];
  // Also check for SAP Commerce indicators: /occ/v2/, /rest/v2/
}
```

**3. Checkout Infrastructure Detection**

```typescript
function detectCheckoutInfrastructure(html: string) {
  const detectedRails = [];
  // Detect: Stripe, Shopify Checkout, PayPal, Klarna, Google Pay, Apple Pay
  return detectedRails;
}
```

#### D. Revised Scoring (15 points total)

| Check ID | Check Name | Points | Pass Condition |
|----------|------------|--------|----------------|
| P1 | Platform Detection | 1 | Known platform identified |
| P2 | Structured Data Complete | 3 | Product + Offer + GTIN/SKU |
| P3 | Product Feed Exists | 3 | Any valid feed found |
| P4 | Feed Discoverable | 2 | In sitemap or robots.txt |
| P5 | Feed Accessible + Valid | 2 | Returns 200, has products |
| P6 | Commerce API Indicators | 2 | Stripe/Shopify Checkout detected |
| P7 | Protocol Manifest | 2 | UCP or MCP well-known endpoint |
| **Total** | | **15** | |

#### E. New Protocol Compatibility Interface

```typescript
interface ProtocolCompatibility {
  discovery: {
    googleShopping: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
    klarnaApp: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
    answerEngines: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
  };
  commerce: {
    ucp: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
    acp: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
    mcp: { status: 'ready' | 'partial' | 'not_ready'; reason: string };
  };
  payments: {
    rails: string[]; // e.g., ['stripe', 'googlePay', 'applePay']
  };
}
```

#### F. Protocol Readiness Criteria

**Discovery Layer:**

| Protocol | Ready | Partial | Not Ready |
|----------|-------|---------|-----------|
| Google Shopping | Feed + title/price/availability + GTIN | Feed exists, missing fields | No feed |
| Klarna APP | Feed + GTIN on >80% products | Feed + GTIN on <80% | No GTIN |
| Answer Engines | Complete Product + Offer schema | Partial schema | No schema |

**Commerce Layer:**

| Protocol | Ready | Partial | Not Ready |
|----------|-------|---------|-----------|
| UCP | `/.well-known/ucp.json` manifest detected | Commerce patterns detected | Nothing found |
| ACP (ChatGPT) | Stripe + `/.well-known/ai-plugin.json` | Stripe detected, no plugin | No Stripe |
| MCP | `/.well-known/mcp.json` or SAP indicators | API patterns detected | Nothing found |

**Payment Layer:**

Display as badges (not scored), showing detected rails:
- Stripe, Google Pay, Apple Pay, Klarna, PayPal, Shopify Checkout

---

### 3. Frontend Changes

#### A. `src/components/results/ChecksAccordion.tsx`

Update the Protocol Readiness display to show 3 layers:

```text
Protocol Readiness Assessment:

DISCOVERY LAYER
├── Google Shopping    ✓ Ready
├── Klarna APP         ⚠️ Partial
└── Answer Engines     ✓ Ready

COMMERCE LAYER
├── UCP               ✗ Not Ready
├── ACP (ChatGPT)     ⚠️ Partial
└── MCP               ✗ Not Ready

PAYMENT RAILS
Stripe · Google Pay · Apple Pay
```

**Visual Changes:**
- Group protocols by layer with section headers
- Use 3 status levels: ✓ Ready (green), ⚠️ Partial (orange), ✗ Not Ready (red)
- Payment rails shown as simple badges (no pass/fail)

#### B. Update `CheckData` Interface

Add new fields to support the 3-layer structure:

```typescript
interface CheckData {
  // ... existing fields
  
  // New 3-layer protocol structure
  protocolReadiness?: {
    discovery: {
      googleShopping: { status: string; reason: string };
      klarnaApp: { status: string; reason: string };
      answerEngines: { status: string; reason: string };
    };
    commerce: {
      ucp: { status: string; reason: string };
      acp: { status: string; reason: string };
      mcp: { status: string; reason: string };
    };
    payments: {
      rails: string[];
    };
  };
  
  // Payment detection
  paymentRails?: string[];
  
  // Commerce API indicators
  checkoutApis?: string[];
  
  // Protocol manifests
  ucpManifest?: { found: boolean; version?: string };
  mcpServer?: { found: boolean; type?: string };
}
```

#### C. Update Check Display Component

Create a new display case for the 3-layer protocol readiness:

```tsx
if (check.id === "P7" && data.protocolReadiness) {
  return (
    <div className="mt-3 space-y-4">
      {/* Discovery Layer */}
      <div>
        <p className="text-xs font-medium mb-2">Discovery Layer</p>
        <div className="flex flex-wrap gap-2">
          {/* Protocol badges with status */}
        </div>
      </div>
      
      {/* Commerce Layer */}
      <div>
        <p className="text-xs font-medium mb-2">Commerce Layer</p>
        <div className="flex flex-wrap gap-2">
          {/* Protocol badges with status */}
        </div>
      </div>
      
      {/* Payment Rails */}
      <div>
        <p className="text-xs font-medium mb-2">Payment Rails</p>
        <div className="flex flex-wrap gap-2">
          {/* Simple detected badges */}
        </div>
      </div>
    </div>
  );
}
```

#### D. `src/components/results/RecommendationsSection.tsx`

Update quick links to reflect new protocols:

| Old Link | New Link |
|----------|----------|
| Facebook Catalog docs | UCP documentation |
| Amazon feed docs | ACP/ChatGPT Shopping docs |
| - | MCP documentation |

---

### 4. Distribution Checks Restructure

**Current (7 checks, confusing overlap):**
```
P1: Platform Detection (2 pts)
P2: Product Feed Exists (5 pts)
P3: Feed Discoverable (3 pts)
P4: Feed Accessible (3 pts)
P5: Protocol Indicators (2 pts)
```

**New (7 checks, clearer purpose):**
```
P1: Platform Detection (1 pt)
P2: Structured Data Complete (3 pts) - Product + Offer + GTIN/SKU
P3: Product Feed Exists (3 pts)
P4: Feed Discoverable (2 pts)
P5: Feed Accessible + Valid (2 pts)
P6: Commerce API Indicators (2 pts) - Stripe/Shopify Checkout
P7: Protocol Manifest (2 pts) - UCP or MCP well-known
```

---

### 5. Update Recommendations

Add new recommendation templates:

**For UCP not detected:**
```
IMPROVEMENT: No Universal Commerce Protocol manifest
UCP is becoming the standard for agent-to-commerce interactions.
Leading platforms (Shopify, Google, Walmart) are adopting UCP.

Fix:
- Add /.well-known/ucp.json manifest
- Expose product and checkout capabilities
- See: [UCP Documentation]
```

**For ACP not detected:**
```
IMPROVEMENT: Not ready for ChatGPT Shopping
ChatGPT uses Stripe + OpenAI plugins for native checkout.

Fix:
- Integrate Stripe for payments
- Add /.well-known/ai-plugin.json manifest
- See: [OpenAI Plugin Documentation]
```

**For no checkout APIs:**
```
IMPROVEMENT: No checkout infrastructure detected
AI agents need programmatic checkout access to complete purchases.

Fix:
- Integrate Stripe, Shopify Checkout, or similar
- Expose checkout APIs for headless commerce
```

---

## Phase 2: Emerging Protocols (Following Sprint)

### 1. MCP Server Detection (Enhanced)

Implement deeper SAP Commerce detection:

```typescript
// Check for SAP Commerce Cloud indicators
const sapIndicators = [
  '/occ/v2/',      // SAP Commerce Cloud OCC API
  '/rest/v2/',     // SAP Hybris REST API
  'sap-commerce',  // SAP branding
  'spartacus'      // SAP Spartacus storefront
];
```

### 2. ACP/ChatGPT Plugin Detection

Check for OpenAI plugin manifests:

```typescript
async function checkACPPlugin(domain: string) {
  const response = await fetch(`${domain}/.well-known/ai-plugin.json`);
  if (response.ok) {
    const manifest = await response.json();
    return {
      found: true,
      name: manifest.name_for_human,
      description: manifest.description_for_human,
      hasCheckout: manifest.api?.url?.includes('checkout')
    };
  }
  return { found: false };
}
```

### 3. API Discoverability

Look for API patterns indicating headless commerce:

```typescript
function detectAPIPatterns(html: string) {
  const patterns = {
    graphql: /graphql|\/graphql/i,
    rest: /\/api\/v\d|\/rest\/v\d/i,
    headless: /headless|storefront-api|commerce-api/i
  };
  // Return detected API patterns
}
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `supabase/functions/analyze/index.ts` | Major Edit | Restructure protocol compatibility, add UCP/ACP/MCP checks, update scoring |
| `src/components/results/ChecksAccordion.tsx` | Major Edit | 3-layer protocol display, remove Facebook/Amazon, add payment rails |
| `src/components/results/RecommendationsSection.tsx` | Edit | Update quick links for new protocols |
| `README.md` | Edit | Document new protocol structure and checks |

---

## Technical Considerations

### Additional HTTP Requests

New detection adds these requests:
- `/.well-known/ucp.json` (UCP manifest)
- `/.well-known/mcp.json` (MCP server)
- `/.well-known/ai-plugin.json` (ACP plugin)

These will be added to the parallel fetch block with 3-second timeouts to avoid impacting overall analysis time.

### Backward Compatibility

The `protocol_compatibility` JSONB column already stores arbitrary JSON, so the new 3-layer structure will work without migration. Old data will still display correctly with fallback handling.

### Checkout Detection Accuracy

The regex-based detection for payment rails is heuristic. We'll detect common patterns:
- Stripe: `stripe.js`, `js.stripe.com`
- Google Pay: `pay.google.com`
- Apple Pay: `ApplePaySession`, `apple-pay-button`
- Klarna: `klarna.*payments`, `klarnacdn.net`
- PayPal: `paypal.com/sdk`
- Shopify Checkout: `checkout.shopify.com`

---

## Summary of Changes

| Change | Reason |
|--------|--------|
| Remove Facebook Catalog | Legacy ad platform, not agentic |
| Remove Amazon | Walled garden, doesn't use open protocols |
| Add UCP detection | THE foundational commerce protocol |
| Add ACP detection | ChatGPT Shopping is massive |
| Add MCP detection | Anthropic/SAP standard, emerging |
| Add checkout API detection | Shows transaction readiness |
| Restructure into 3 layers | Discovery → Commerce → Payment flow |
| Update scoring (P1: 1pt, new P6/P7) | Better reflect what matters |
| Increase GTIN weight | Critical for protocol readiness |

