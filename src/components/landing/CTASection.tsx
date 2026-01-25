import { ArrowRight, ArrowDown, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PulseDot from "@/components/ui/PulseDot";

const CTASection = () => {
  const scrollToAgentPulse = () => {
    const element = document.getElementById("agent-pulse");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const calendlyUrl = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/refoundlabs";

  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section Label */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <PulseDot size="md" />
            <span className="text-sm font-medium uppercase tracking-widest text-background/60">
              Ready?
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl text-background mb-6">
            Ready to become agent-ready?
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-background/70 mb-10">
            Start with a free audit, or book a call to discuss your strategy.
          </p>

          {/* Dual CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <Button
              onClick={scrollToAgentPulse}
              size="lg"
              className="h-14 px-8 bg-background text-foreground hover:bg-background/90 font-medium text-base w-full sm:w-auto"
            >
              Run Free Audit
              <ArrowDown className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="h-14 px-8 font-medium text-base w-full sm:w-auto border-background/30 text-background hover:bg-background/10"
              asChild
            >
              <a href={calendlyUrl} target="_blank" rel="noopener noreferrer">
                <Calendar className="mr-2 h-4 w-4" />
                Book a Strategy Call
              </a>
            </Button>
          </div>

          {/* Contact */}
          <p className="text-sm text-background/60">
            Questions?{" "}
            <a href="mailto:hello@refoundlabs.com" className="text-background hover:underline">
              hello@refoundlabs.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
