import { ArrowRight, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import PulseDot from "@/components/ui/PulseDot";
import PulseRadar from "./PulseRadar";

const AgencyHeroSection = () => {
  const scrollToAgentPulse = () => {
    const element = document.getElementById("agent-pulse");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative pt-28 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Content */}
          <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
            {/* Eyebrow */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 md:mb-8 animate-fade-in">
              <PulseDot size="md" />
              <span className="text-xs md:text-sm font-medium uppercase tracking-widest text-muted-foreground">
                AI Commerce Readiness
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] text-foreground leading-[1.1] mb-6 md:mb-8 animate-slide-up">
              Make your store visible to AI agents.
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 md:mb-12 animate-slide-up max-w-2xl mx-auto lg:mx-0" style={{ animationDelay: "0.1s" }}>
              re:found Labs helps e-commerce brands get discovered, understood, and recommended by AI shopping agents. Start with a free diagnostic.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <Button
                onClick={scrollToAgentPulse}
                size="lg"
                className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium text-base w-full sm:w-auto"
              >
                Check your store
                <ArrowDown className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-14 px-8 font-medium text-base w-full sm:w-auto"
                asChild
              >
                <a href="/services">
                  Learn About Our Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Right: Pulse Animation (desktop only) */}
          <div className="hidden lg:flex items-center justify-center h-[400px] xl:h-[500px]">
            <PulseRadar />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AgencyHeroSection;
