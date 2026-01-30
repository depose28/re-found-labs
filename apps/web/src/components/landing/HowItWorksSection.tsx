import { Link2, BarChart3, Wrench } from "lucide-react";
import PulseDot from "@/components/ui/PulseDot";

const steps = [
  {
    icon: Link2,
    number: "01",
    title: "Enter any URL",
    description: "Product page, collection page, or homepage. We analyze whatever you give us.",
  },
  {
    icon: BarChart3,
    number: "02",
    title: "Get your AI Commerce Score",
    description: "12 checks across 3 layers. Results in under 60 seconds.",
  },
  {
    icon: Wrench,
    number: "03",
    title: "See exactly what's broken",
    description: "Prioritized fixes with code examples. No guesswork, no generic advice.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-24 md:py-32 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            How Agent Pulse Works
          </span>
        </div>

        {/* Section Title */}
        <h2 className="font-display text-4xl md:text-5xl text-foreground mb-16 max-w-2xl">
          Score. Understand. Fix.
        </h2>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="group"
            >
              <div className="border-t border-border pt-8">
                {/* Number */}
                <span className="text-accent font-mono text-sm font-medium mb-6 block">
                  {step.number}
                </span>

                {/* Icon */}
                <div className="mb-6">
                  <step.icon className="h-6 w-6 text-foreground" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="font-display text-2xl text-foreground mb-4">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
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
