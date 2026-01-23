import { Link2, BarChart3, Lightbulb } from "lucide-react";

const steps = [
  {
    icon: Link2,
    step: "Step 1",
    title: "Enter Your URL",
    description: "Paste any product page or homepage from your store.",
  },
  {
    icon: BarChart3,
    step: "Step 2",
    title: "Get Your Score",
    description:
      "We analyze 8 critical factors across 4 categories in under 60 seconds.",
  },
  {
    icon: Lightbulb,
    step: "Step 3",
    title: "Fix the Gaps",
    description: "Get prioritized recommendations to become agent-ready.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 md:py-28 scroll-mt-20">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            How It Works
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative group"
            >
              {/* Connector line (hidden on mobile, last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-12 left-[calc(50%+40px)] w-[calc(100%-80px)] h-0.5 bg-border" />
              )}

              <div className="text-center">
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-accent text-accent-foreground shadow-lg mb-6 group-hover:scale-105 transition-transform duration-300">
                  <step.icon className="h-10 w-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>

                {/* Content */}
                <h3 className="font-display text-xl font-bold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
