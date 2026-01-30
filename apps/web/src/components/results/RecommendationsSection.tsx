import { AlertCircle, AlertTriangle, Info, ChevronDown, Wrench, Zap, Copy, Check, ExternalLink } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  priority: "critical" | "high" | "medium" | "low";
  effort?: "quick" | "technical";
  affects?: string[];
  checkId: string;
  checkName: string;
  title: string;
  description: string;
  howToFix: string;
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  critical: { icon: AlertCircle, color: "destructive", label: "Critical", order: 1 },
  high: { icon: AlertTriangle, color: "warning", label: "High", order: 2 },
  medium: { icon: Info, color: "accent", label: "Medium", order: 3 },
  low: { icon: Info, color: "muted", label: "Low", order: 4 },
};

// Fallback for old analyses that don't have effort field
const effortFallback: Record<string, "quick" | "technical"> = {
  D1: "quick",
  D2: "quick",
  D4: "quick",
  D5: "quick",
  D6: "quick",
  T1: "quick",
  T2: "quick",
  D3: "technical",
  D7: "technical",
  D9: "technical",
  X1: "technical",
  X4: "technical",
};

// Quick links per check ID
const quickLinks: Record<string, Array<{ label: string; href: string }>> = {
  D1: [
    { label: "Google robots.txt docs", href: "https://developers.google.com/search/docs/crawling-indexing/robots/intro" },
  ],
  D3: [
    { label: "PageSpeed Insights", href: "https://pagespeed.web.dev/" },
    { label: "Core Web Vitals Guide", href: "https://web.dev/vitals/" },
  ],
  D4: [
    { label: "Product data reference", href: "https://schema.org/Product" },
    { label: "Rich Results Test", href: "https://search.google.com/test/rich-results" },
  ],
  D6: [
    { label: "FAQPage reference", href: "https://schema.org/FAQPage" },
    { label: "Rich Results Test", href: "https://search.google.com/test/rich-results" },
  ],
  D7: [
    { label: "Google Merchant Feed Specs", href: "https://support.google.com/merchants/answer/7052112" },
    { label: "Data feed reference", href: "https://schema.org/DataFeed" },
  ],
  D9: [
    { label: "Model Context Protocol (MCP)", href: "https://modelcontextprotocol.io/" },
    { label: "OpenAI Plugin Docs (ACP)", href: "https://platform.openai.com/docs/plugins" },
  ],
  X1: [
    { label: "Offer data reference", href: "https://schema.org/Offer" },
    { label: "Klarna Agentic Commerce", href: "https://docs.klarna.com/agentic-commerce/" },
  ],
  X4: [
    { label: "Stripe Checkout Docs", href: "https://stripe.com/docs/payments/checkout" },
    { label: "Shopify Checkout API", href: "https://shopify.dev/docs/api/checkout-extensions" },
  ],
};

function getEffort(rec: Recommendation): "quick" | "technical" {
  return rec.effort || effortFallback[rec.checkId] || "technical";
}

function RecommendationCard({
  rec,
  index,
  expandedIds,
  toggleExpanded,
  copiedId,
  handleCopy,
}: {
  rec: Recommendation;
  index: number;
  expandedIds: Set<string>;
  toggleExpanded: (id: string) => void;
  copiedId: string | null;
  handleCopy: (text: string, checkId: string) => void;
}) {
  const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.medium;
  const isExpanded = expandedIds.has(rec.checkId);
  const PriorityIcon = config.icon;
  const isCopied = copiedId === rec.checkId;
  const links = quickLinks[rec.checkId];

  return (
    <div className="bg-card">
      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
              config.color === "destructive"
                ? "bg-destructive/10"
                : config.color === "warning"
                ? "bg-warning/10"
                : "bg-accent/10"
            }`}
          >
            <PriorityIcon
              className={`h-5 w-5 ${
                config.color === "destructive"
                  ? "text-destructive"
                  : config.color === "warning"
                  ? "text-warning"
                  : "text-accent"
              }`}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span
                className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 ${
                  config.color === "destructive"
                    ? "bg-destructive/10 text-destructive"
                    : config.color === "warning"
                    ? "bg-warning/10 text-warning"
                    : "bg-accent/10 text-accent"
                }`}
              >
                {config.label}
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                #{String(index + 1).padStart(2, "0")}
              </span>
            </div>
            <h3 className="font-medium text-lg text-foreground mb-2">{rec.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {rec.description}
            </p>

            {rec.affects && rec.affects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-muted-foreground">Affects:</span>
                {rec.affects.map((platform) => (
                  <span
                    key={platform}
                    className="text-xs px-1.5 py-0.5 bg-secondary text-muted-foreground rounded"
                  >
                    {platform}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => toggleExpanded(rec.checkId)}
              className="flex items-center gap-2 text-sm font-medium text-accent mt-4 hover:opacity-80 transition-opacity"
            >
              <Wrench className="h-4 w-4" />
              How to fix
              <ChevronDown
                className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="px-5 pb-5">
          <div className="ml-14">
            <div className="relative p-4 bg-secondary/50 border border-border">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(rec.howToFix, rec.checkId)}
                  className="h-8 px-2"
                >
                  {isCopied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 text-xs">{isCopied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed pr-20 overflow-x-auto">
                {rec.howToFix}
              </pre>
            </div>

            {links && links.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    {link.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, checkId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(checkId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const toggleExpanded = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!recommendations || recommendations.length === 0) {
    return (
      <section>
        <div className="mb-8">
          <h2 className="font-display text-2xl text-foreground">
            Recommended Fixes
          </h2>
        </div>

        <div className="bg-success/10 border border-success/20 p-8 text-center">
          <h3 className="font-display text-xl text-foreground mb-2">
            No Issues Found
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your store is fully optimized for AI shopping agents. All critical checks passed.
          </p>
        </div>
      </section>
    );
  }

  // Sort by priority within each group
  const sortByPriority = (recs: Recommendation[]) =>
    [...recs].sort((a, b) => {
      const orderA = priorityConfig[a.priority as keyof typeof priorityConfig]?.order || 99;
      const orderB = priorityConfig[b.priority as keyof typeof priorityConfig]?.order || 99;
      return orderA - orderB;
    });

  const quickWins = sortByPriority(recommendations.filter((r) => getEffort(r) === "quick"));
  const technicalFixes = sortByPriority(recommendations.filter((r) => getEffort(r) === "technical"));

  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-foreground mb-2">
          Recommended Fixes
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {quickWins.length > 0 && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              {quickWins.length} Quick Win{quickWins.length > 1 ? "s" : ""}
            </Badge>
          )}
          {technicalFixes.length > 0 && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {technicalFixes.length} Technical
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {/* Quick Wins */}
        {quickWins.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-5 w-5 text-success" />
              <h3 className="font-display text-lg text-foreground">Quick Wins</h3>
              <span className="text-xs text-muted-foreground">No developer needed</span>
            </div>
            <div className="border border-border divide-y divide-border">
              {quickWins.map((rec, i) => (
                <RecommendationCard
                  key={rec.checkId}
                  rec={rec}
                  index={i}
                  expandedIds={expandedIds}
                  toggleExpanded={toggleExpanded}
                  copiedId={copiedId}
                  handleCopy={handleCopy}
                />
              ))}
            </div>
          </div>
        )}

        {/* Technical Fixes */}
        {technicalFixes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wrench className="h-5 w-5 text-accent" />
              <h3 className="font-display text-lg text-foreground">Technical Fixes</h3>
              <span className="text-xs text-muted-foreground">Requires developer or server config</span>
            </div>
            <div className="border border-border divide-y divide-border">
              {technicalFixes.map((rec, i) => (
                <RecommendationCard
                  key={rec.checkId}
                  rec={rec}
                  index={i}
                  expandedIds={expandedIds}
                  toggleExpanded={toggleExpanded}
                  copiedId={copiedId}
                  handleCopy={handleCopy}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RecommendationsSection;
