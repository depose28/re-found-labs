import { Link2, BarChart3, Lightbulb } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Enter Your URL",
    description: "Paste any product page or homepage from your store.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Get Your Score",
    description:
      "We analyze 8 critical factors across 4 categories in under 60 seconds.",
  },
  {
    icon: Lightbulb,
    number: "03",
    title: "Fix the Gaps",
    description: "Get prioritized recommendations to become agent-ready.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            How It Works
          </span>
        </div>

        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-16 max-w-2xl">
          Three steps to agent readiness
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group"
            >
              <div className="border-t border-border pt-8">
                {/* Number & Label */}
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-accent font-mono text-sm font-medium">
                    {step.number}
                  </span>
                  <span className="text-muted-foreground font-mono text-sm uppercase tracking-wide">
                    Step
                  </span>
                </div>

                {/* Icon */}
                <div className="mb-6">
                  <step.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed font-mono text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
