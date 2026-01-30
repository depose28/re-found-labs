import { TrendingUp, Store, Users, Lightbulb } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const criteria = [
  {
    icon: TrendingUp,
    title: "€5M – €200M Revenue",
    description: "Mid-market brands with the scale to invest in future-proofing.",
  },
  {
    icon: Store,
    title: "Modern Platforms",
    description: "Shopify, WooCommerce, Magento, BigCommerce, or custom builds.",
  },
  {
    icon: Users,
    title: "In-house or Agency",
    description: "Whether you have a dev team or work with agencies, we integrate.",
  },
  {
    icon: Lightbulb,
    title: "Early Adopters",
    description: "Brands who want to capture AI commerce before competitors catch up.",
  },
];

const WhoWeWorkWithSection = () => {
  return (
    <section className="py-24 md:py-32 bg-secondary/30">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            Who We Work With
          </span>
        </div>

        {/* Section Header */}
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-16 max-w-2xl">
          Built for brands ready to lead, not follow.
        </h2>

        {/* Criteria Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {criteria.map((item, index) => (
            <div
              key={index}
              className="group border border-border bg-card p-6 transition-all duration-300 hover:border-accent/30"
            >
              {/* Icon */}
              <div className="mb-4">
                <item.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              </div>

              {/* Title */}
              <h3 className="font-display text-lg text-foreground mb-2">
                {item.title}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhoWeWorkWithSection;
