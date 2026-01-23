import { Search, Zap, CreditCard, Shield } from "lucide-react";

interface CategoryProps {
  score: number;
  max: number;
}

interface CategoryBreakdownProps {
  discovery: CategoryProps;
  performance: CategoryProps;
  transaction: CategoryProps;
  trust: CategoryProps;
}

const categories = [
  { 
    key: "discovery", 
    label: "Discovery", 
    icon: Search, 
    description: "Can AI agents find and interpret your products?" 
  },
  { 
    key: "performance", 
    label: "Performance", 
    icon: Zap, 
    description: "Is your site fast enough for agent timeouts?" 
  },
  { 
    key: "transaction", 
    label: "Transaction", 
    icon: CreditCard, 
    description: "Can agents complete a purchase?" 
  },
  { 
    key: "trust", 
    label: "Trust", 
    icon: Shield, 
    description: "Will agents recommend you to their users?" 
  },
];

const CategoryBreakdown = ({ discovery, performance, transaction, trust }: CategoryBreakdownProps) => {
  const scores: Record<string, CategoryProps> = {
    discovery,
    performance,
    transaction,
    trust,
  };

  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "bg-success";
    if (percentage >= 65) return "bg-accent";
    if (percentage >= 50) return "bg-warning";
    return "bg-destructive";
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-success";
    if (percentage >= 65) return "text-accent";
    if (percentage >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Scoring Variables</p>
        <h2 className="font-display text-2xl text-foreground">
          Category Breakdown
        </h2>
      </div>

      <div className="border border-border divide-y divide-border">
        {categories.map((category) => {
          const { score, max } = scores[category.key];
          const percentage = max > 0 ? (score / max) * 100 : 0;
          const Icon = category.icon;

          return (
            <div 
              key={category.key} 
              className="flex items-center justify-between p-5 hover:bg-secondary/30 transition-colors"
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="w-10 h-10 flex items-center justify-center bg-secondary/50 border border-border">
                  <Icon className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">
                    {category.label}
                  </p>
                  <p className="text-sm text-muted-foreground truncate">
                    {category.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Progress Bar */}
                <div className="hidden sm:block w-32 h-2 bg-secondary overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${getBarColor(percentage)}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Score */}
                <div className="text-right min-w-[80px]">
                  <span className={`font-mono text-lg font-medium ${getScoreColor(percentage)}`}>
                    {score}
                  </span>
                  <span className="text-muted-foreground font-mono text-sm"> / {max}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBreakdown;
