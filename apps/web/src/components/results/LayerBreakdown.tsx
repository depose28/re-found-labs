import { Search, Shield, CreditCard, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface LayerProps {
  score: number;
  max: number;
}

interface CheckSummary {
  id: string;
  name: string;
  status: "pass" | "partial" | "fail" | "skipped";
  category: string;
}

interface LayerBreakdownProps {
  discovery: LayerProps;
  trust: LayerProps;
  transaction: LayerProps;
  checks?: CheckSummary[];
}

const layers = [
  {
    key: "discovery",
    label: "Can AI Agents Find You?",
    shortLabel: "Discovery",
    icon: Search,
    description: "Crawl architecture, semantic data & distribution signals",
    tips: [
      "robots.txt allows AI bots",
      "Product schema markup",
      "XML sitemap available",
      "Server response time",
      "Product feed accessible",
    ],
  },
  {
    key: "trust",
    label: "Will Agents Recommend You?",
    shortLabel: "Trust",
    icon: Shield,
    description: "Brand identity and community signals",
    tips: [
      "Business identity schema",
      "HTTPS enabled",
      "Return policy schema",
      "Social proof (manual check)",
    ],
  },
  {
    key: "transaction",
    label: "Can Agents Complete Purchases?",
    shortLabel: "Checkout",
    icon: CreditCard,
    description: "Protocol support and payment infrastructure",
    tips: [
      "Checkout data completeness",
      "Shipping details schema",
      "Payment methods detected",
      "Checkout integration",
    ],
  },
];

const LayerBreakdown = ({ discovery, trust, transaction, checks }: LayerBreakdownProps) => {
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({
    discovery: 0,
    trust: 0,
    transaction: 0,
  });

  const scores: Record<string, LayerProps> = {
    discovery,
    trust,
    transaction,
  };

  useEffect(() => {
    const duration = 1200;
    const steps = 30;
    const timers: NodeJS.Timeout[] = [];

    Object.entries(scores).forEach(([key, { score }]) => {
      const increment = score / steps;
      let current = 0;
      let step = 0;

      const timer = setInterval(() => {
        step++;
        current = Math.min(score, increment * step);
        setAnimatedScores((prev) => ({ ...prev, [key]: current }));
        if (step >= steps) clearInterval(timer);
      }, duration / steps);

      timers.push(timer);
    });

    return () => timers.forEach(clearInterval);
  }, [discovery.score, trust.score, transaction.score]);

  const getBarColor = (percentage: number) => {
    if (percentage >= 70) return "bg-success";
    if (percentage >= 40) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-success";
    if (percentage >= 40) return "text-warning";
    return "text-destructive";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 70) return TrendingUp;
    if (percentage >= 40) return Minus;
    return TrendingDown;
  };

  const getStatusLabel = (percentage: number) => {
    if (percentage >= 70) return "Good";
    if (percentage >= 40) return "Fair";
    return "Needs Work";
  };

  const getLayerChecks = (category: string) => {
    if (!checks) return [];
    return checks.filter((c) => c.category === category);
  };

  return (
    <section>
      <div className="mb-8">
        <h2 className="font-display text-2xl text-foreground">
          What We Checked
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {layers.map((layer) => {
          const { score, max } = scores[layer.key];
          const animatedScore = animatedScores[layer.key];
          const percentage = max > 0 ? (score / max) * 100 : 0;
          const animatedPercentage = max > 0 ? (animatedScore / max) * 100 : 0;
          const Icon = layer.icon;
          const StatusIcon = getStatusIcon(percentage);
          const layerChecks = getLayerChecks(layer.key);

          return (
            <div
              key={layer.key}
              className="border border-border p-5 bg-card hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 border border-border">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-0.5">
                      {layer.shortLabel}
                    </p>
                    <p className="font-medium text-foreground text-sm">
                      {layer.label}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <StatusIcon className={`h-4 w-4 ${getScoreColor(percentage)}`} />
                  <span className={`text-xs font-medium ${getScoreColor(percentage)}`}>
                    {getStatusLabel(percentage)}
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-3">
                <div className="w-full h-2 bg-secondary overflow-hidden rounded-full">
                  <div
                    className={`h-full transition-all duration-1000 ease-out ${getBarColor(percentage)}`}
                    style={{ width: `${animatedPercentage}%` }}
                  />
                </div>
              </div>

              {/* Score */}
              <div className="flex items-baseline justify-between">
                <span className={`font-mono text-2xl font-medium ${getScoreColor(percentage)}`}>
                  {Math.round(animatedScore)}
                </span>
                <span className="text-muted-foreground font-mono text-sm">/ {max} pts</span>
              </div>

              {/* Check Summaries or Fallback Tips */}
              <div className="mt-4 pt-4 border-t border-border/50">
                {layerChecks.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {layerChecks.map((check) => (
                      <span
                        key={check.id}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded ${
                          check.status === "pass"
                            ? "bg-success/10 text-success"
                            : check.status === "partial"
                            ? "bg-warning/10 text-warning"
                            : "bg-destructive/10 text-destructive"
                        }`}
                      >
                        {check.status === "pass"
                          ? "✓"
                          : check.status === "partial"
                          ? "⚠"
                          : "✗"}
                        {check.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <ul className="text-xs text-muted-foreground space-y-1">
                    {layer.tips.map((tip, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default LayerBreakdown;
