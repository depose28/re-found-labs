import { Search, Zap, CreditCard, Radio, Shield } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const categories = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    points: "35 points",
    question: "Can agents find and understand your products?",
    description:
      "AI agents need permission to access your site and structured data to interpret what you sell. We check whether your store speaks the language agents understand—and whether you've accidentally locked them out.",
    whatBreaks: "Blocked crawlers. Missing product data. Incomplete catalogs.",
    whatAgentsDo: "Skip you entirely. Recommend competitors who are visible.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Performance",
    points: "15 points",
    question: "Is your site fast enough for agents?",
    description:
      "Agents operate on tight timeouts. If your pages load slowly, they move on. We measure the metrics that determine whether agents wait—or walk.",
    whatBreaks: "Slow page loads. Heavy scripts. Server delays.",
    whatAgentsDo: "Abandon the request. Return \"I couldn't find information about that.\"",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Transaction",
    points: "20 points",
    question: "Can agents help users buy from you?",
    description:
      "When an agent recommends a product, it needs to confirm it's available, priced, and purchasable. We check whether your store provides the signals that let agents close the loop.",
    whatBreaks: "Missing availability. Unclear pricing. No secure checkout.",
    whatAgentsDo: "Hedge recommendations. Suggest \"check the website directly.\"",
  },
  {
    icon: Radio,
    number: "04",
    title: "Distribution",
    points: "15 points",
    question: "Can agents discover, transact, and pay?",
    description:
      "AI agents use emerging protocols to discover products, complete transactions, and process payments. We check your readiness across three layers: Discovery (Google Shopping, Klarna APP), Commerce (UCP, ACP, MCP), and Payment rails (Stripe, Google Pay, Apple Pay).",
    whatBreaks: "No product feed. Missing GTIN/SKU. No checkout APIs. No protocol manifests.",
    whatAgentsDo: "Can't complete purchases. Route users to competitors with proper protocol integration.",
  },
  {
    icon: Shield,
    number: "05",
    title: "Trust",
    points: "15 points",
    question: "Will agents stake their reputation on you?",
    description:
      "AI agents are cautious—they won't recommend a store they can't verify. We check whether your brand has the signals that make agents confident enough to recommend you by name.",
    whatBreaks: "No business information. Missing return policies. Inconsistent data.",
    whatAgentsDo: "Recommend established competitors instead. Or say nothing at all.",
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
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 max-w-3xl">
          Five pillars that determine whether AI agents recommend you—or your competitors.
        </h2>
        <p className="text-lg text-muted-foreground mb-16 max-w-2xl">
          AI agents don't browse like humans. They scan structured data, check access permissions, verify trust signals, and make split-second decisions. Miss one signal, and you're filtered out before the conversation even starts.
        </p>

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

              {/* Question */}
              <h3 className="font-display text-xl text-foreground mb-4">
                {category.question}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {category.description}
              </p>

              {/* What breaks it */}
              <div className="mb-3">
                <p className="text-sm font-medium text-foreground mb-1">What breaks it:</p>
                <p className="text-sm text-muted-foreground">{category.whatBreaks}</p>
              </div>

              {/* What agents do */}
              <div>
                <p className="text-sm font-medium text-foreground mb-1">What agents do:</p>
                <p className="text-sm text-muted-foreground italic">{category.whatAgentsDo}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeCheckSection;
