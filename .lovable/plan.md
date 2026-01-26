

# Plan: Update Social Proof in Hero Section

## Overview

Remove the placeholder avatar initials ("S M A") from the hero and replace the social proof element with a cleaner "X+ stores analyzed" text plus placeholder company logos.

---

## Changes

### File: `src/components/landing/ConversionHeroSection.tsx`

**Lines 48-60 - Replace the current social proof eyebrow:**

**Current Code:**
```tsx
{/* Social proof eyebrow */}
<div className="flex items-center gap-2 mb-6 animate-fade-in">
  <div className="flex -space-x-1">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
        <span className="text-[10px] font-medium text-muted-foreground">
          {["S", "M", "A"][i]}
        </span>
      </div>
    ))}
  </div>
  <span className="text-sm text-muted-foreground">
    <span className="font-medium text-foreground">{auditCount.toLocaleString()}+</span> stores analyzed
  </span>
</div>
```

**New Code:**
```tsx
{/* Social proof eyebrow */}
<div className="flex flex-col gap-4 mb-6 animate-fade-in">
  {/* Counter */}
  <div className="flex items-center gap-2">
    <span className="inline-flex h-2 w-2 rounded-full bg-success animate-pulse" />
    <span className="text-sm text-muted-foreground">
      <span className="font-semibold text-foreground">{auditCount.toLocaleString()}+</span> stores analyzed
    </span>
  </div>
  
  {/* Company logos placeholder */}
  <div className="flex items-center gap-4">
    <span className="text-xs text-muted-foreground uppercase tracking-wider">Trusted by</span>
    <div className="flex items-center gap-3 opacity-60">
      {/* Placeholder logo boxes - replace with actual logos */}
      {["Logo 1", "Logo 2", "Logo 3", "Logo 4"].map((placeholder, i) => (
        <div
          key={i}
          className="h-6 px-3 bg-muted/50 border border-border rounded flex items-center justify-center"
        >
          <span className="text-[10px] text-muted-foreground font-medium">{placeholder}</span>
        </div>
      ))}
    </div>
  </div>
</div>
```

---

## Visual Result

```text
Before:
┌─────────────────────────────────────────┐
│ [S][M][A] 45+ stores analyzed           │
└─────────────────────────────────────────┘

After:
┌─────────────────────────────────────────┐
│ ● 45+ stores analyzed                   │
│ TRUSTED BY  [Logo 1] [Logo 2] [Logo 3]  │
└─────────────────────────────────────────┘
```

---

## Design Notes

- Removes the confusing letter avatars
- Adds a pulsing green dot for "live" feel
- Shows company logo placeholders with subtle styling
- Easy to swap in actual logo images later (replace the div with `<img>` tags)
- Maintains the existing animation classes

---

## Files Changed

| File | Change |
|------|--------|
| `src/components/landing/ConversionHeroSection.tsx` | Replace avatar social proof with counter + logo placeholders |

