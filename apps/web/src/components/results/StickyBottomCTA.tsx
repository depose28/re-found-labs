import { useState, useEffect } from "react";
import { Calendar, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyBottomCTAProps {
  score: number;
  grade: string;
}

const gradeLabels: Record<string, { label: string; color: string }> = {
  "Agent-Native": { label: "MARKET LEADER", color: "bg-success" },
  Optimized: { label: "COMPETITIVE", color: "bg-accent" },
  "Needs Work": { label: "LOSING GROUND", color: "bg-warning" },
  Invisible: { label: "INVISIBLE", color: "bg-destructive" },
};

const StickyBottomCTA = ({ score, grade }: StickyBottomCTAProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past ~400px (past the hero section)
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const config = gradeLabels[grade] || gradeLabels["Needs Work"];

  const scrollToRecommendations = () => {
    const recsSection = document.querySelector("[data-section='recommendations']");
    if (recsSection) {
      recsSection.scrollIntoView({ behavior: "smooth" });
    } else {
      // Fallback: scroll to first accordion or recommendations section
      const fallback = document.querySelector(".accordion") || 
                       document.querySelector("[class*='Recommendations']");
      fallback?.scrollIntoView({ behavior: "smooth" });
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border shadow-lg animate-fade-in">
      <div className="max-w-[1600px] mx-auto px-4 md:px-12 lg:px-20 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Score display */}
          <div className="flex items-center gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-xl md:text-2xl text-foreground tabular-nums">
                {score}
              </span>
              <span className="text-sm text-muted-foreground">/100</span>
            </div>
            <div className={`hidden sm:flex items-center gap-1.5 px-2 py-1 ${config.color}/10 border border-current/20`}>
              <span className={`w-1.5 h-1.5 rounded-full ${config.color}`} />
              <span className="font-mono text-[10px] uppercase tracking-wide text-foreground">
                {config.label}
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2 md:gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollToRecommendations}
              className="h-9"
            >
              <ArrowDown className="h-3.5 w-3.5 mr-1.5" />
              <span className="hidden sm:inline">See All Fixes</span>
              <span className="sm:hidden">Fixes</span>
            </Button>
            <Button
              asChild
              size="sm"
              className="h-9 bg-foreground text-background hover:bg-foreground/90"
            >
              <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
                <Calendar className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Book a Call</span>
                <span className="sm:hidden">Call</span>
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StickyBottomCTA;
