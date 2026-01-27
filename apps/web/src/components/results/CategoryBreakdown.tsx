import { Search, Zap, CreditCard, Shield, Radio, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useState, useEffect } from "react";

interface CategoryProps {
  score: number;
  max: number;
}

interface CategoryBreakdownProps {
  discovery: CategoryProps;
  performance: CategoryProps;
  transaction: CategoryProps;
  distribution: CategoryProps;
  trust: CategoryProps;
}

const categories = [
  { 
    key: "discovery", 
    label: "Can AI Agents Find You?", 
    shortLabel: "Discovery",
    icon: Search, 
    description: "Robots.txt, schema markup, and crawlability",
    tips: ["robots.txt allows AI bots", "Product schema markup", "XML sitemap available"]
  },
  { 
    key: "performance", 
    label: "Is Your Site Fast Enough?", 
    shortLabel: "Performance",
    icon: Zap, 
    description: "Core Web Vitals and page speed",
    tips: ["LCP under 2.5s", "CLS under 0.1", "Time to Interactive under 3.8s"]
  },
  { 
    key: "transaction", 
    label: "Can Agents Complete Purchases?", 
    shortLabel: "Transaction",
    icon: CreditCard, 
    description: "Pricing, availability, and checkout signals",
    tips: ["Offer schema with pricing", "Valid currency (ISO 4217)", "HTTPS enabled"]
  },
  { 
    key: "distribution", 
    label: "Are You Protocol-Ready?", 
    shortLabel: "Distribution",
    icon: Radio, 
    description: "UCP, ACP, MCP, and feed compatibility",
    tips: ["Product feed available", "Feed in sitemap/robots.txt", "GTIN/SKU identifiers"]
  },
  { 
    key: "trust", 
    label: "Will Agents Recommend You?", 
    shortLabel: "Trust",
    icon: Shield, 
    description: "Organization info, policies, and credibility",
    tips: ["Organization schema", "Return policy defined", "Contact information available"]
  },
];

const CategoryBreakdown = ({ discovery, performance, transaction, distribution, trust }: CategoryBreakdownProps) => {
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({
    discovery: 0,
    performance: 0,
    transaction: 0,
    distribution: 0,
    trust: 0
  });

  const scores: Record<string, CategoryProps> = {
    discovery,
    performance,
    transaction,
    distribution,
    trust,
  };

  // Animate scores on mount
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
        
        setAnimatedScores(prev => ({ ...prev, [key]: current }));
        
        if (step >= steps) {
          clearInterval(timer);
        }
      }, duration / steps);
      
      timers.push(timer);
    });

    return () => timers.forEach(clearInterval);
  }, [discovery.score, performance.score, transaction.score, distribution.score, trust.score]);

  // Green (good): 70%+, Orange (medium): 40-69%, Red (bad): <40%
  const getBarColor = (percentage: number) => {
    if (percentage >= 70) return "bg-success"; // Green
    if (percentage >= 40) return "bg-warning"; // Orange
    return "bg-destructive"; // Red
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return "text-success"; // Green
    if (percentage >= 40) return "text-warning"; // Orange
    return "text-destructive"; // Red
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

  const totalScore = discovery.score + performance.score + transaction.score + distribution.score + trust.score;
  const totalMax = discovery.max + performance.max + transaction.max + distribution.max + trust.max;
  const overallPercentage = totalMax > 0 ? (totalScore / totalMax) * 100 : 0;

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Scoring Variables</p>
        <h2 className="font-display text-2xl text-foreground">
          Category Breakdown
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Overall score: <span className={`font-medium ${getScoreColor(overallPercentage)}`}>{totalScore}</span> / {totalMax} ({Math.round(overallPercentage)}%)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const { score, max } = scores[category.key];
          const animatedScore = animatedScores[category.key];
          const percentage = max > 0 ? (score / max) * 100 : 0;
          const animatedPercentage = max > 0 ? (animatedScore / max) * 100 : 0;
          const Icon = category.icon;
          const StatusIcon = getStatusIcon(percentage);

          return (
            <div 
              key={category.key} 
              className="border border-border p-5 bg-card hover:bg-secondary/30 transition-colors"
            >
                <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 border border-border">
                    <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm">
                      {category.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {category.description}
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

              {/* Tips */}
              <div className="mt-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground mb-2">Key factors:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  {category.tips.map((tip, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBreakdown;
