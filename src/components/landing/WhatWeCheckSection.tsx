import { Search, Zap, CreditCard, Shield, ArrowRight } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const categories = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    points: "40 points",
    description: "We evaluate how effectively AI agents can locate and interpret your product catalog. This includes crawlability, structured data implementation, and catalog indexing protocols.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Performance",
    points: "15 points",
    description: "Agent interactions have strict timeout thresholds. We measure critical performance indicators that determine whether agents can reliably access your store within acceptable latency windows.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Transaction",
    points: "20 points",
    description: "For agents to facilitate purchases, they require machine-readable pricing, availability, and security signals. We assess your transactional data layer completeness.",
  },
  {
    icon: Shield,
    number: "04",
    title: "Trust",
    points: "25 points",
    description: "Before recommending a merchant, agents verify legitimacy through organizational signals and consumer protection policies. We analyze your trust architecture.",
  },
];

const WhatWeCheckSection = () => {
  return (
    <section id="what-we-check" className="py-24 md:py-32 bg-secondary/50 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            What We Analyze
          </span>
        </div>

        {/* Section Title */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 max-w-2xl">
              Four dimensions of agent compatibility
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl">
              Our proprietary analysis framework evaluates your store across the critical signals that AI shopping agents use to discover, evaluate, and recommend products.
            </p>
          </div>
          <a 
            href="#" 
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group whitespace-nowrap"
          >
            View full methodology
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

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
                <span className="text-sm text-muted-foreground">
                  {category.points}
                </span>
              </div>

              {/* Description */}
              <p className="text-foreground leading-relaxed">
                {category.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Our scoring methodology is based on analysis of major AI agent implementations including shopping assistants, comparison engines, and autonomous purchasing systems.{" "}
            <a href="#" className="text-foreground hover:text-accent transition-colors underline underline-offset-4">
              Read the documentation
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default WhatWeCheckSection;
