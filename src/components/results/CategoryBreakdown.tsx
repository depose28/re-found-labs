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
  { key: "discovery", label: "Discovery", icon: Search, color: "accent" },
  { key: "performance", label: "Performance", icon: Zap, color: "warning" },
  { key: "transaction", label: "Transaction", icon: CreditCard, color: "success" },
  { key: "trust", label: "Trust", icon: Shield, color: "primary" },
];

const CategoryBreakdown = ({ discovery, performance, transaction, trust }: CategoryBreakdownProps) => {
  const scores: Record<string, CategoryProps> = {
    discovery,
    performance,
    transaction,
    trust,
  };

  return (
    <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
      <h2 className="font-display text-xl font-bold text-foreground mb-6">
        Category Breakdown
      </h2>

      <div className="space-y-4">
        {categories.map((category) => {
          const { score, max } = scores[category.key];
          const percentage = (score / max) * 100;

          return (
            <div key={category.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <category.icon className={`h-4 w-4 ${
                    category.color === "accent"
                      ? "text-accent"
                      : category.color === "warning"
                      ? "text-warning"
                      : category.color === "success"
                      ? "text-success"
                      : "text-primary"
                  }`} />
                  <span className="text-sm font-medium text-foreground">
                    {category.label}
                  </span>
                </div>
                <span className="text-sm font-semibold text-muted-foreground">
                  {score}/{max}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="h-3 bg-secondary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    category.color === "accent"
                      ? "bg-gradient-accent"
                      : category.color === "warning"
                      ? "bg-gradient-warning"
                      : category.color === "success"
                      ? "bg-gradient-success"
                      : "bg-gradient-hero"
                  }`}
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
