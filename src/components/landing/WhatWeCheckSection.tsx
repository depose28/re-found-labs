import { Search, Zap, CreditCard, Shield } from "lucide-react";

const categories = [
  {
    icon: Search,
    title: "DISCOVERY",
    points: "40 pts",
    description:
      "Can AI agents find your products and understand what you sell?",
    checks: ["AI bot access", "Product schema", "Sitemap availability"],
    color: "accent",
  },
  {
    icon: Zap,
    title: "PERFORMANCE",
    points: "15 pts",
    description:
      "Is your site fast enough for agents that timeout after 30 seconds?",
    checks: ["Page load speed", "Time to interactive"],
    color: "warning",
  },
  {
    icon: CreditCard,
    title: "TRANSACTION",
    points: "20 pts",
    description:
      "Can agents determine price, availability, and complete purchases?",
    checks: ["Offer schema completeness", "HTTPS security"],
    color: "success",
  },
  {
    icon: Shield,
    title: "TRUST",
    points: "25 pts",
    description: "Do agents trust your store enough to recommend it?",
    checks: ["Organization identity", "Return policy schema"],
    color: "primary",
  },
];

const WhatWeCheckSection = () => {
  return (
    <section id="what-we-check" className="py-20 md:py-28 bg-secondary/30 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            What We Analyze
          </h2>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${
                      category.color === "accent"
                        ? "bg-accent/10 text-accent"
                        : category.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : category.color === "success"
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <category.icon className="h-5 w-5" />
                  </div>
                  <span className="font-display text-sm font-bold tracking-wider text-foreground">
                    {category.title}
                  </span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    category.color === "accent"
                      ? "text-accent"
                      : category.color === "warning"
                      ? "text-warning"
                      : category.color === "success"
                      ? "text-success"
                      : "text-primary"
                  }`}
                >
                  {category.points}
                </span>
              </div>

              {/* Description */}
              <p className="text-muted-foreground mb-6">{category.description}</p>

              {/* Checks List */}
              <ul className="space-y-2">
                {category.checks.map((check, checkIndex) => (
                  <li
                    key={checkIndex}
                    className="flex items-center gap-2 text-sm text-foreground"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                    {check}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeCheckSection;
