
# Plan: Update Email Report to Match Current 5-Pillar Model

## Problem Summary

The `generate-report` edge function is out of sync with the current analysis model:

| Issue | Current Email | Should Be |
|-------|---------------|-----------|
| Pillars shown | 4 (Discovery, Performance, Transaction, Trust) | 5 (includes Distribution) |
| Discovery points | 40 | 35 |
| Trust points | 25 | 15 |
| Distribution | Missing | 15 points |
| Protocol data | Not shown | 3-layer matrix (Discovery, Commerce, Payments) |
| Platform info | Not shown | Platform detection result |

---

## Implementation Plan

### File: `supabase/functions/generate-report/index.ts`

**Change 1: Update `AnalysisData` interface** (lines 30-47)

Add the missing fields to match the actual database schema:

```typescript
interface AnalysisData {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  discovery_score: number;
  discovery_max: number;
  performance_score: number;
  performance_max: number;
  transaction_score: number;
  transaction_max: number;
  distribution_score: number;     // NEW
  distribution_max: number;       // NEW
  trust_score: number;
  trust_max: number;
  checks: Check[];
  recommendations: Recommendation[];
  created_at: string;
  protocol_compatibility?: any;   // NEW - for protocol matrix
  platform_detected?: string;     // NEW
  platform_name?: string;         // NEW
  feeds_found?: any[];            // NEW
}
```

**Change 2: Update `getCategoryLabel` function** (lines 68-76)

Add the missing "distribution" case:

```typescript
function getCategoryLabel(category: string): string {
  switch (category) {
    case "discovery": return "Discovery";
    case "performance": return "Performance";
    case "transaction": return "Transaction";
    case "distribution": return "Distribution";  // NEW
    case "trust": return "Trust";
    default: return category;
  }
}
```

**Change 3: Fix Score Breakdown table** (lines 154-188)

Update the HTML to:
- Fix point values (Discovery 35, Trust 15)
- Add Distribution row with 15 points
- Reorder to match the 5-pillar sequence

```html
<!-- Score Breakdown Table -->
<tr>Discovery (35 points) - ${analysis.discovery_score}/${analysis.discovery_max}</tr>
<tr>Performance (15 points) - ${analysis.performance_score}/${analysis.performance_max}</tr>
<tr>Transaction (20 points) - ${analysis.transaction_score}/${analysis.transaction_max}</tr>
<tr>Distribution (15 points) - ${analysis.distribution_score}/${analysis.distribution_max}</tr>  <!-- NEW -->
<tr>Trust (15 points) - ${analysis.trust_score}/${analysis.trust_max}</tr>
```

**Change 4: Add Protocol Readiness Section** (new section after Score Breakdown)

Add a visual protocol readiness matrix showing the 3-layer assessment when `protocol_compatibility` data is available:

```text
+------------------------+
| Protocol Readiness     |
+------------------------+
| DISCOVERY LAYER        |
| - Google Shopping: ⚠️   |
| - Klarna APP: ✗        |
| - Answer Engines: ✗    |
+------------------------+
| COMMERCE LAYER         |
| - UCP: ⚠️              |
| - ACP (ChatGPT): ⚠️    |
| - MCP: ⚠️              |
+------------------------+
| PAYMENT RAILS          |
| 🛒 Shopify Checkout    |
+------------------------+
```

**Change 5: Add Platform Detection Info** (enhance header section)

If platform is detected, show it near the URL:

```html
<p>Platform: Shopify</p>
```

---

## Detailed Code Changes

### Score Breakdown Table HTML (corrected)

```html
<tr>
  <td>🔍 Discovery (35 points)</td>
  <td>${analysis.discovery_score}</td>
  <td>${analysis.discovery_max}</td>
  <td>${Math.round((analysis.discovery_score / (analysis.discovery_max || 35)) * 100)}%</td>
</tr>
<tr>
  <td>⚡ Performance (15 points)</td>
  <td>${analysis.performance_score}</td>
  <td>${analysis.performance_max}</td>
  <td>${Math.round((analysis.performance_score / (analysis.performance_max || 15)) * 100)}%</td>
</tr>
<tr>
  <td>💳 Transaction (20 points)</td>
  <td>${analysis.transaction_score}</td>
  <td>${analysis.transaction_max}</td>
  <td>${Math.round((analysis.transaction_score / (analysis.transaction_max || 20)) * 100)}%</td>
</tr>
<tr>
  <td>📡 Distribution (15 points)</td>
  <td>${analysis.distribution_score || 0}</td>
  <td>${analysis.distribution_max || 15}</td>
  <td>${Math.round(((analysis.distribution_score || 0) / (analysis.distribution_max || 15)) * 100)}%</td>
</tr>
<tr>
  <td>🛡️ Trust (15 points)</td>
  <td>${analysis.trust_score}</td>
  <td>${analysis.trust_max}</td>
  <td>${Math.round((analysis.trust_score / (analysis.trust_max || 15)) * 100)}%</td>
</tr>
```

### Protocol Readiness Helper Function

```typescript
function generateProtocolReadinessHtml(protocolData: any): string {
  if (!protocolData) return '';
  
  const getStatusIcon = (status: string) => 
    status === 'ready' ? '✅' : status === 'partial' ? '⚠️' : '❌';
  
  const discovery = protocolData.discovery || {};
  const commerce = protocolData.commerce || {};
  const payments = protocolData.payments || { rails: [] };
  
  return `
    <div style="margin-bottom: 40px;">
      <h2 style="font-size: 20px; margin-bottom: 20px;">Protocol Readiness</h2>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5;">Discovery Layer</th></tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Google Shopping</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.googleShopping?.status)} ${discovery.googleShopping?.reason || ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Klarna APP</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.klarnaApp?.status)} ${discovery.klarnaApp?.reason || ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">Answer Engines</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(discovery.answerEngines?.status)} ${discovery.answerEngines?.reason || ''}</td>
        </tr>
        <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5;">Commerce Layer</th></tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">UCP (Universal Commerce)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.ucp?.status)} ${commerce.ucp?.reason || ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">ACP (ChatGPT Shopping)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.acp?.status)} ${commerce.acp?.reason || ''}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">MCP (Model Context)</td>
          <td style="padding: 10px; border-bottom: 1px solid #e5e5e5;">${getStatusIcon(commerce.mcp?.status)} ${commerce.mcp?.reason || ''}</td>
        </tr>
        ${payments.rails?.length > 0 ? `
          <tr><th colspan="2" style="text-align: left; padding: 12px; background: #f5f5f5;">Payment Rails</th></tr>
          <tr>
            <td colspan="2" style="padding: 10px;">
              ${payments.rails.map((rail: string) => 
                rail === 'stripe' ? '💳 Stripe' : 
                rail === 'shopifyCheckout' ? '🛒 Shopify' :
                rail === 'googlePay' ? '🔷 Google Pay' :
                rail === 'applePay' ? '🍎 Apple Pay' :
                rail === 'klarna' ? '🟣 Klarna' :
                rail === 'paypal' ? '💙 PayPal' : rail
              ).join(' &nbsp;•&nbsp; ')}
            </td>
          </tr>
        ` : ''}
      </table>
    </div>
  `;
}
```

---

## Files Changed

| File | Changes |
|------|---------|
| `supabase/functions/generate-report/index.ts` | Update interface, add Distribution, fix point values, add protocol matrix |

---

## Expected Outcome

After this update, email reports will:

1. Show all 5 pillars with correct point values (35+15+20+15+15 = 100)
2. Include Distribution score and percentage
3. Display the 3-layer protocol readiness matrix
4. Show detected platform (e.g., "Shopify")
5. Match the visual structure seen in the UI Results page

---

## Technical Notes

- The `protocol_compatibility` field is stored as JSONB in the database
- All new fields have null-safety checks with fallback defaults
- Email HTML uses inline styles for maximum compatibility
