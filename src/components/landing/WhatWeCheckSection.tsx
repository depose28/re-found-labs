import { Search, Zap, CreditCard, Shield } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const categories = [
  {
    icon: Search,
    number: "01",
    title: "Discovery",
    points: "40 points",
    question: "Can agents find and interpret your products?",
    checks: [
      "robots.txt for AI bot access (OAI-SearchBot, ClaudeBot, ChatGPT-User)",
      "JSON-LD Product schema with required properties",
      "XML sitemap for catalog discovery",
    ],
    consequence: "If blocked: Agents can't crawl. If unstructured: Agents can't understand.",
  },
  {
    icon: Zap,
    number: "02",
    title: "Performance",
    points: "15 points",
    question: "Is your site fast enough for agents that timeout?",
    checks: [
      "Time to Interactive (TTI) — agents abandon after 30 seconds",
      "Lighthouse performance score",
    ],
    consequence: "Slow sites get skipped. Agents don't wait.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Transaction",
    points: "20 points",
    question: "Can agents complete a purchase?",
    checks: [
      "Offer schema: price, currency, availability (as Schema.org enumerations)",
      "HTTPS — agents won't transact over insecure connections",
    ],
    consequence: "Missing availability? Agents assume out of stock. No HTTPS? Purchase blocked.",
  },
  {
    icon: Shield,
    number: "04",
    title: "Trust",
    points: "25 points",
    question: "Will agents recommend you to their users?",
    checks: [
      "Organization schema: name, contact, address, social proof",
      "MerchantReturnPolicy schema: return window, method",
    ],
    consequence: "Agents verify legitimacy before recommending. No trust signals = no recommendations.",
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
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-4 max-w-2xl">
          The 8 signals that determine agent visibility
        </h2>
        <p className="text-lg text-muted-foreground mb-16 max-w-xl">
          Every check maps to a real decision agents make. Miss one, and you're filtered out.
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

              {/* Checks */}
              <p className="text-sm text-muted-foreground mb-4">We check:</p>
              <ul className="space-y-2 mb-6">
                {category.checks.map((check, checkIndex) => (
                  <li
                    key={checkIndex}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent mt-2 flex-shrink-0" />
                    {check}
                  </li>
                ))}
              </ul>

              {/* Consequence */}
              <p className="text-sm text-muted-foreground italic">
                {category.consequence}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatWeCheckSection;
