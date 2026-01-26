

# Fix Plan: Generate-Report Data Structure Mismatch

## Problem Summary

The `generate-report` edge function crashes with `TypeError: Cannot read properties of undefined (reading 'map')` when trying to send email reports. This happens because the function expects a different data structure than what's actually stored in the database.

## Root Cause

The `Recommendation` interface in the edge function doesn't match the actual database schema:

| Expected by Function | Actual in Database |
|---------------------|-------------------|
| `id` | `checkId` |
| `impact` | `description` |
| `steps[]` (array) | `howToFix` (string) |
| `codeSnippet` | (embedded in `howToFix`) |

When the code tries to call `rec.steps.map()` on line 111, it fails because `steps` is undefined.

---

## Implementation Plan

### File: `supabase/functions/generate-report/index.ts`

**Change 1:** Update the `Recommendation` interface to match actual database structure

```typescript
// Current (lines 21-28)
interface Recommendation {
  id: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  impact: string;
  steps: string[];
  codeSnippet?: string;
}

// Fixed
interface Recommendation {
  checkId: string;
  checkName: string;
  priority: "critical" | "high" | "medium" | "low";
  title: string;
  description: string;
  howToFix: string;
}
```

**Change 2:** Update the recommendations HTML generation to use correct fields

```typescript
// Current (lines 101-121)
const recommendationsHtml = analysis.recommendations.map(rec => `
  ...
  <p>...<strong>Impact:</strong> ${rec.impact}</p>
  ...
  <ol>
    ${rec.steps.map(step => `<li>...</li>`).join("")}
  </ol>
  ${rec.codeSnippet ? `<pre>...</pre>` : ""}
`).join("");

// Fixed - use description and howToFix (as formatted text block)
const recommendationsHtml = analysis.recommendations.map(rec => `
  <div style="...">
    <div>
      <h3>${rec.title}</h3>
      <span>${getPriorityLabel(rec.priority)}</span>
    </div>
    <p><strong>Why it matters:</strong> ${rec.description}</p>
    <div>
      <strong>How to fix:</strong>
      <pre style="...">${rec.howToFix.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    </div>
  </div>
`).join("");
```

**Change 3:** Add null-safety checks for robustness

Add guards to handle cases where `checks` or `recommendations` might be empty or malformed:

```typescript
// Before generating HTML
const checks = Array.isArray(analysis.checks) ? analysis.checks : [];
const recommendations = Array.isArray(analysis.recommendations) ? analysis.recommendations : [];
```

---

## Technical Details

### Actual Database Structure (from query)

**Recommendations format:**
```json
{
  "checkId": "D2",
  "checkName": "Product Schema",
  "priority": "high",
  "title": "Add complete Product schema markup",
  "description": "AI agents need structured product data...",
  "howToFix": "Add this JSON-LD to your product pages:\n\n<script>...</script>"
}
```

The `howToFix` field contains both instructions and code snippets as a single formatted string with newlines, not as separate `steps[]` and `codeSnippet` fields.

### Display Approach

Since `howToFix` contains multi-line formatted text including code examples, it should be rendered in a `<pre>` block to preserve formatting rather than trying to parse it into separate list items.

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/generate-report/index.ts` | Update interface and HTML generation |

---

## Expected Outcome

After this fix:
- Report emails will generate successfully
- The "How to fix" section will display properly with code examples
- No more `TypeError` on `.map()` calls

