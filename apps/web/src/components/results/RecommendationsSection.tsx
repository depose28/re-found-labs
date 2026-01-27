import { AlertCircle, AlertTriangle, Info, ChevronDown, Wrench, Copy, Check, ExternalLink, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Recommendation {
  priority: "critical" | "high" | "medium";
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
  critical: { icon: AlertCircle, color: "destructive", label: "Critical", order: 1, description: "Blocking AI agent access" },
  high: { icon: AlertTriangle, color: "warning", label: "High", order: 2, description: "Significantly impacts score" },
  medium: { icon: Info, color: "accent", label: "Medium", order: 3, description: "Recommended improvement" },
};

const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [showAll, setShowAll] = useState(false);
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
    setExpandedIds(prev => {
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
          <p className="text-sm text-muted-foreground mb-2">Recommendations</p>
          <h2 className="font-display text-2xl text-foreground">
            Priority Fixes
          </h2>
        </div>

        <div className="bg-success/10 border border-success/20 p-8 text-center">
          <span className="text-4xl mb-4 block">🎉</span>
          <h3 className="font-display text-xl text-foreground mb-2">
            No Issues Found!
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your store is fully optimized for AI shopping agents. All critical checks passed!
          </p>
        </div>
      </section>
    );
  }

  // Sort by priority
  const sortedRecs = [...recommendations].sort((a, b) => {
    const orderA = priorityConfig[a.priority as keyof typeof priorityConfig]?.order || 99;
    const orderB = priorityConfig[b.priority as keyof typeof priorityConfig]?.order || 99;
    return orderA - orderB;
  });

  const criticalCount = recommendations.filter(r => r.priority === "critical").length;
  const highCount = recommendations.filter(r => r.priority === "high").length;
  const mediumCount = recommendations.filter(r => r.priority === "medium").length;

  // Estimate score improvement
  const estimatedImprovement = criticalCount * 15 + highCount * 10 + mediumCount * 5;

  // Show top 3 by default, rest collapsed
  const visibleRecs = showAll ? sortedRecs : sortedRecs.slice(0, 3);
  const hiddenCount = sortedRecs.length - 3;

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Recommendations</p>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Priority Fixes
        </h2>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {criticalCount > 0 && (
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
              {criticalCount} Critical
            </Badge>
          )}
          {highCount > 0 && (
            <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
              {highCount} High
            </Badge>
          )}
          {mediumCount > 0 && (
            <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">
              {mediumCount} Medium
            </Badge>
          )}
          <span className="text-muted-foreground">
            Potential improvement: <span className="font-medium text-success">+{estimatedImprovement} pts</span>
          </span>
        </div>
      </div>

      <div className="border border-border divide-y divide-border">
        {visibleRecs.map((rec, index) => {
          const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const isExpanded = expandedIds.has(rec.checkId);
          const PriorityIcon = config.icon;
          const isCopied = copiedId === rec.checkId;

          return (
            <div key={rec.checkId} className="bg-card">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
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
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        • {config.description}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec.description}
                    </p>

                    <button
                      onClick={() => toggleExpanded(rec.checkId)}
                      className="flex items-center gap-2 text-sm font-medium text-accent mt-4 hover:opacity-80 transition-opacity"
                    >
                      <Wrench className="h-4 w-4" />
                      How to fix
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
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
                    
                    {/* Quick links for common fixes */}
                    {rec.checkId === "D1" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://developers.google.com/search/docs/crawling-indexing/robots/intro"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Google robots.txt docs
                        </a>
                      </div>
                    )}
                    {rec.checkId === "D2" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://schema.org/Product"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Schema.org Product
                        </a>
                        <a
                          href="https://search.google.com/test/rich-results"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Rich Results Test
                        </a>
                      </div>
                    )}
                    {rec.checkId === "N1" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://pagespeed.web.dev/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          PageSpeed Insights
                        </a>
                        <a
                          href="https://web.dev/vitals/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Core Web Vitals Guide
                        </a>
                      </div>
                    )}
                    {(rec.checkId === "P2" || rec.checkId === "P3" || rec.checkId === "P5") && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://support.google.com/merchants/answer/7052112"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Google Merchant Feed Specs
                        </a>
                        <a
                          href="https://docs.klarna.com/agentic-commerce/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Klarna Agentic Commerce
                        </a>
                      </div>
                    )}
                    {rec.checkId === "P4" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://schema.org/DataFeed"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Schema.org DataFeed
                        </a>
                      </div>
                    )}
                    {rec.checkId === "P6" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://stripe.com/docs/payments/checkout"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Stripe Checkout Docs
                        </a>
                        <a
                          href="https://shopify.dev/docs/api/checkout-extensions"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Shopify Checkout API
                        </a>
                      </div>
                    )}
                    {rec.checkId === "P7" && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        <a
                          href="https://developers.google.com/commerce"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Google Commerce Platform
                        </a>
                        <a
                          href="https://platform.openai.com/docs/plugins"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          OpenAI Plugin Docs (ACP)
                        </a>
                        <a
                          href="https://modelcontextprotocol.io/"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Model Context Protocol (MCP)
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show more/less toggle */}
      {hiddenCount > 0 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full mt-4 py-3 border border-border bg-secondary/30 hover:bg-secondary/50 transition-colors flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground"
        >
          {showAll ? (
            <>
              <ChevronUp className="h-4 w-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4" />
              Show {hiddenCount} more recommendation{hiddenCount > 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </section>
  );
};

export default RecommendationsSection;
