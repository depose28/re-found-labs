import { Search, Zap, CreditCard, Shield } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const categories = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    points: "40 pts",
    description:
      "Can AI agents find your products and understand what you sell?",
    checks: ["AI bot access", "Product schema", "Sitemap availability"],
  },
  {
    icon: Zap,
    number: "02",
    title: "Performance",
    points: "15 pts",
    description:
      "Is your site fast enough for agents that timeout after 30 seconds?",
    checks: ["Page load speed", "Time to interactive"],
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Transaction",
    points: "20 pts",
    description:
      "Can agents determine price, availability, and complete purchases?",
    checks: ["Offer schema completeness", "HTTPS security"],
  },
  {
    icon: Shield,
    number: "04",
    title: "Trust",
    points: "25 pts",
    description: "Do agents trust your store enough to recommend it?",
    checks: ["Organization identity", "Return policy schema"],
  },
];

const WhatWeCheckSection = () => {
  return (
    <section id="what-we-check" className="py-24 md:py-32 bg-secondary/50 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            What We Analyze
          </span>
        </div>

        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-16 max-w-2xl">
          Four categories, complete coverage
        </h2>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 gap-px bg-border">
          {categories.map((category, index) => (
            <div
              key={index}
              className="bg-card p-8 md:p-10 group hover:bg-secondary/30 transition-colors"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="text-accent font-mono text-sm font-medium">
                    {category.number}
                  </span>
                  <span className="text-muted-foreground font-mono text-sm uppercase tracking-wide">
                    {category.title}
                  </span>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {category.points}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-display text-2xl text-foreground mb-4">
                {category.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-6 leading-relaxed">
                {category.description}
              </p>

              {/* Checks List */}
              <ul className="space-y-2">
                {category.checks.map((check, checkIndex) => (
                  <li
                    key={checkIndex}
                    className="flex items-center gap-3 text-sm text-foreground font-mono"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent" />
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
