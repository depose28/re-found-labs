import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, UserX, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PulseDot from "@/components/ui/PulseDot";

const HeroSection = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateUrl = (input: string): boolean => {
    if (!input.trim()) {
      setError("Please enter a URL");
      return false;
    }

    let urlToCheck = input.trim();
    if (!urlToCheck.startsWith("http://") && !urlToCheck.startsWith("https://")) {
      urlToCheck = "https://" + urlToCheck;
    }

    try {
      new URL(urlToCheck);
      setError("");
      return true;
    } catch {
      setError("Please enter a valid URL");
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url)) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }
      navigate(`/analyzing?url=${encodeURIComponent(normalizedUrl)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* Left Column - Content */}
          <div className="max-w-xl">
            {/* Eyebrow with Stat - no dot */}
            <div className="mb-8 animate-fade-in">
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                73% of stores fail this test
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-[3.5rem] text-foreground leading-[1.1] mb-8 animate-slide-up">
              Can AI agents actually shop your store?
            </h1>

            {/* Subheadline - Tighter */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
              AI agents recommend structured stores. If yours isn't one of them, you're invisible. Find out in 60 seconds.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="border border-border bg-card p-1">
                <div className="flex flex-col sm:flex-row">
                  <Input
                    type="text"
                    placeholder="https://yourstore.com/products/..."
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError("");
                    }}
                    className="flex-1 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
                  >
                    Get Your Agent Score
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </form>

            {/* Trust indicators + Social Proof */}
            <div className="flex items-center gap-6 mt-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <UserX className="h-3.5 w-3.5" />
                No signup required
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Free report
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
                <span className="text-lg font-semibold text-foreground">142</span> analyzed this week
              </span>
            </div>
          </div>

          {/* Right Column - Sample Report Preview */}
          <div className="hidden lg:block animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <SampleReportPreview />
          </div>
        </div>
      </div>
    </section>
  );
};

const SampleReportPreview = () => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const targetScore = 72;

  useEffect(() => {
    const duration = 1500;
    const steps = 30;
    const increment = targetScore / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= targetScore) {
        setAnimatedScore(targetScore);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative mt-8">
      {/* Decorative dot grid background */}
      <div className="absolute inset-0 -z-10">
        <div className="grid grid-cols-12 gap-6">
          {[...Array(48)].map((_, i) => (
            <span key={i} className="w-1.5 h-1.5 rounded-full bg-border" />
          ))}
        </div>
      </div>

      {/* Document-style Report Card */}
      <div className="bg-card border border-border shadow-card max-w-sm ml-auto transition-all duration-300 hover:shadow-lg hover:border-accent/30">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border">
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Agent Pulse Report
          </span>
          <PulseDot size="sm" />
        </div>

        {/* Meta Info */}
        <div className="p-5 border-b border-border space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">analyzed:</span>
            <span className="text-foreground">yourstore.com</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">date:</span>
            <span className="text-foreground">January 24, 2025</span>
          </div>
        </div>

        {/* Main Score - Animated */}
        <div className="p-6 border-b border-border text-center">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Agent Score</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className="font-display text-5xl text-foreground tabular-nums">{animatedScore}</span>
            <span className="text-xl text-muted-foreground">/ 100</span>
          </div>
          <span className="inline-block mt-2 px-3 py-1 text-xs font-medium uppercase tracking-wide bg-accent/10 text-accent">
            Optimized
          </span>
        </div>

        {/* Category Breakdown with hover states */}
        <div className="p-5 space-y-3">
          <CategoryBar label="Discovery" score={32} max={40} percentage={80} color="accent" />
          <CategoryBar label="Performance" score={12} max={15} percentage={80} color="success" />
          <CategoryBar label="Transaction" score={10} max={20} percentage={50} color="warning" />
          <CategoryBar label="Trust" score={18} max={25} percentage={72} color="primary" />
        </div>

        {/* Top Issue */}
        <div className="px-5 py-4 bg-secondary/30 border-t border-border group cursor-default">
          <div className="flex items-start gap-2">
            <span className="text-warning text-sm mt-0.5">▲</span>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Top issue</p>
              <p className="text-sm text-foreground">Missing availability in Offer schema</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryBar = ({ 
  label, 
  score, 
  max, 
  percentage, 
  color 
}: { 
  label: string; 
  score: number; 
  max: number; 
  percentage: number; 
  color: string;
}) => {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setWidth(percentage), 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  return (
    <div className="flex items-center justify-between text-sm group cursor-default transition-all duration-200 hover:bg-secondary/20 -mx-2 px-2 py-1 rounded">
      <span className="text-muted-foreground group-hover:text-foreground transition-colors">{label}</span>
      <div className="flex items-center gap-3">
        <div className="w-20 h-1.5 bg-secondary overflow-hidden rounded-full">
          <div 
            className={`h-full bg-${color} transition-all duration-1000 ease-out`}
            style={{ width: `${width}%` }} 
          />
        </div>
        <span className="text-foreground w-10 text-right tabular-nums">{score}/{max}</span>
      </div>
    </div>
  );
};

export default HeroSection;
