

# Behavioral Science Optimization: Agent Pulse Results Page & Email Report

## Overview

Transform the Agent Pulse results from a technical diagnostic into a business decision document that creates urgency and motivates action using proven behavioral science principles.

---

## Part 1: Results Page Changes

### New Page Structure

The page will be reorganized into 4 distinct sections:

```text
+--------------------------------------------------+
| SECTION 1: THE STAKES (Above the Fold)           |
| - Score + New Labels                             |
| - Business Impact Statement                      |
| - Revenue at Risk Card                           |
| - Industry Comparison Bars                       |
| - Timeline Graphic                               |
+--------------------------------------------------+
| SECTION 2: THE DIAGNOSIS                         |
| - #1 Priority Fix Spotlight (NEW)                |
| - Category Cards with Question Headers           |
+--------------------------------------------------+
| SECTION 3: DETAILED RESULTS                      |
| - Technical Checks Accordion                     |
| - Recommendations (top 3 expanded, rest hidden)  |
+--------------------------------------------------+
| SECTION 4: THE PATH FORWARD                      |
| - "What 85+ Unlocks" Benefits Section (NEW)      |
| - Market Context Stats (NEW)                     |
| - Closing Statement                              |
| - Email Capture + CTA                            |
+--------------------------------------------------+
```

### File Changes

#### 1. `src/components/results/ScoreHeader.tsx`

**Changes:**
- Update `gradeConfig` with new labels:
  - 0-49: "INVISIBLE TO AI AGENTS" (was "INVISIBLE")
  - 50-69: "LOSING GROUND" (was "Needs Work")
  - 70-84: "COMPETITIVE" (was "Optimized")
  - 85+: "MARKET LEADER" (was "Agent-Native")

- Add business impact statement based on score tier
- Add new UI components:
  - Revenue at Risk card with 15-25% estimate
  - Industry comparison bars (user score vs avg 62 vs top 85+)
  - Timeline graphic showing protocol adoption window

**New Subcomponents to Create:**
- `RevenueAtRiskCard.tsx` - Displays loss aversion messaging
- `IndustryComparisonBars.tsx` - Visual peer comparison
- `TimelineGraphic.tsx` - Shows the urgency window

#### 2. `src/components/results/CategoryBreakdown.tsx`

**Changes:**
- Update category labels to use question format:
  - Discovery -> "Can AI Agents Find You?"
  - Performance -> "Is Your Site Fast Enough?"
  - Transaction -> "Can Agents Complete Purchases?"
  - Distribution -> "Are You Protocol-Ready?"
  - Trust -> "Will Agents Recommend You?"

#### 3. New Component: `src/components/results/PriorityFixSpotlight.tsx`

**Purpose:** Highlight the single most important fix to reduce overwhelm

**Features:**
- Large, prominent card above detailed results
- Shows: Title, expected point gain, estimated implementation time
- Two CTAs: "Show me how" (expands details) and "Do it for me" (links to services)
- Uses the highest-priority recommendation from the analysis

#### 4. `src/components/results/RecommendationsSection.tsx`

**Changes:**
- Show top 3 recommendations expanded by default
- Collapse remaining under "Show X more recommendations" toggle
- Keep existing technical details and code snippets

#### 5. New Component: `src/components/results/WhatUnlocksSection.tsx`

**Purpose:** Mental simulation - help users visualize success

**Content:**
- "What an 85+ Score Unlocks" heading
- Bullet list of benefits:
  - ChatGPT Shopping visibility
  - Klarna APP integration
  - Google AI Agents recommendations
  - Perplexity shopping citations
  - Amazon/Apple agent discovery

#### 6. New Component: `src/components/results/MarketContextCard.tsx`

**Purpose:** Authority and urgency through data

**Stats to Display:**
- 4,700% YoY growth in AI-referred traffic
- 73% of stores fail basic readiness
- $17.5T influenced by AI agents by 2030
- Major protocols launched 2025

#### 7. `src/components/results/CTASection.tsx`

**Changes:**
- Add closing statement: "This is where commerce is heading. Will you be discovered, or will you be skipped?"
- Keep existing service tiers and booking CTA

#### 8. `src/pages/Results.tsx`

**Changes:**
- Pass recommendations to new `PriorityFixSpotlight` component
- Reorder sections according to new structure
- Add `WhatUnlocksSection` and `MarketContextCard` components

---

## Part 2: Email Report Changes

### File: `supabase/functions/generate-report/index.ts`

### New Email Structure (5 Logical Pages)

```text
PAGE 1: EXECUTIVE SUMMARY
- Score + grade with new labels
- Business impact statement
- Revenue at Risk box
- Industry comparison visualization
- Score breakdown table (existing)
- Protocol readiness matrix (existing)

PAGE 2: YOUR #1 PRIORITY
- Dedicated section for single most important fix
- Large heading
- "Why it matters" explanation
- Expected impact (+X points)
- "How to fix" with code snippets

PAGE 3: DETAILED CHECK RESULTS
- All check results table (existing)

PAGE 4: ALL RECOMMENDATIONS
- Full list organized by priority (existing)

PAGE 5: NEXT STEPS
- "What 85+ Unlocks" section
- Market context stats
- Service tiers table
- CTA to book call
```

### Dynamic Email Subject Lines

Based on score tier:
- Under 50: `"Your store is invisible to AI agents (Score: X/100)"`
- 50-69: `"Your store scored X/100 for AI visibility - here's what to fix"`
- 70-84: `"Good news: X/100 AI readiness - here's how to reach 85+"`
- 85+: `"Excellent! X/100 - you're a market leader"`

### Specific Code Changes

**1. Add helper functions:**
- `getEmailSubject(score: number, domain: string): string` - Dynamic subject based on score
- `getBusinessImpactStatement(score: number): string` - Plain language summary
- `generateRevenueAtRiskHtml(): string` - Revenue impact messaging
- `generateIndustryComparisonHtml(score: number): string` - Visual bars
- `generatePriorityFixHtml(recommendations: Recommendation[]): string` - #1 priority section
- `generateWhatUnlocksHtml(): string` - Benefits of 85+ score
- `generateMarketContextHtml(): string` - Stats and data points

**2. Update `generateHtmlReport()` function:**
- Reorganize HTML into 5 logical sections
- Add page break hints for better readability
- Insert new behavioral science sections

**3. Update email send call:**
- Use dynamic subject line based on score tier

---

## Implementation Details

### New Components to Create

| File | Purpose | Behavioral Principle |
|------|---------|---------------------|
| `RevenueAtRiskCard.tsx` | Show what "invisible" costs | Loss Aversion |
| `IndustryComparisonBars.tsx` | Compare to peers | Social Comparison |
| `TimelineGraphic.tsx` | Show closing window | Scarcity/Urgency |
| `PriorityFixSpotlight.tsx` | Highlight ONE action | Choice Reduction |
| `WhatUnlocksSection.tsx` | Visualize success | Mental Simulation |
| `MarketContextCard.tsx` | Build credibility | Authority |

### Data Requirements

All new components will use static content or derive values from existing analysis data:
- Priority fix: First item in sorted recommendations array
- Point gain estimate: Existing logic (critical=15, high=10, medium=5)
- Score tier: Derived from total_score

### Styling Approach

- Use existing Tailwind classes and design system
- Maintain the "clean, surgical, enterprise-grade" aesthetic
- Use existing color system (success/warning/destructive)
- Add subtle animations for timeline and comparison bars

---

## Summary of All File Changes

### Files to Modify

1. `src/pages/Results.tsx` - Restructure section order, add new components
2. `src/components/results/ScoreHeader.tsx` - New labels, add impact messaging
3. `src/components/results/CategoryBreakdown.tsx` - Question-format headers
4. `src/components/results/RecommendationsSection.tsx` - Collapse logic
5. `src/components/results/CTASection.tsx` - Add closing statement
6. `supabase/functions/generate-report/index.ts` - Restructure email, add sections

### New Files to Create

1. `src/components/results/RevenueAtRiskCard.tsx`
2. `src/components/results/IndustryComparisonBars.tsx`
3. `src/components/results/TimelineGraphic.tsx`
4. `src/components/results/PriorityFixSpotlight.tsx`
5. `src/components/results/WhatUnlocksSection.tsx`
6. `src/components/results/MarketContextCard.tsx`

---

## What Stays the Same

- All existing technical checks and scoring logic
- Code snippets in recommendations
- Protocol Readiness matrix
- Service tier pricing display
- Email capture functionality
- Detailed checks accordion internals

