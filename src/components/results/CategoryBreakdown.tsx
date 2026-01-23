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
  { key: "discovery", label: "Discovery", icon: Search, number: "01" },
  { key: "performance", label: "Performance", icon: Zap, number: "02" },
  { key: "transaction", label: "Transaction", icon: CreditCard, number: "03" },
  { key: "trust", label: "Trust", icon: Shield, number: "04" },
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
    if (percentage >= 50) return "bg-accent";
    return "bg-warning";
  };

  return (
    <section className="bg-card border border-border p-6 md:p-8">
      <h2 className="font-display text-2xl text-foreground mb-8">
        Category Breakdown
      </h2>

      <div className="space-y-6">
        {categories.map((category) => {
          const { score, max } = scores[category.key];
          const percentage = (score / max) * 100;

          return (
            <div key={category.key} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-accent font-mono text-xs">
                    {category.number}
                  </span>
                  <span className="text-sm font-mono uppercase tracking-wide text-foreground">
                    {category.label}
                  </span>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {score}/{max}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-1.5 bg-secondary overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getBarColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CategoryBreakdown;
