import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
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
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Content */}
          <div className="max-w-xl">
            {/* Section Label */}
            <div className="flex items-center gap-3 mb-8 animate-fade-in">
              <PulseDot size="md" />
              <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                AI Readiness
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.1] mb-8 animate-slide-up">
              Agent-Ready
              <br />
              Store Analysis
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-muted-foreground leading-relaxed mb-10 animate-slide-up max-w-md" style={{ animationDelay: "0.1s" }}>
              The only tool that tells you if AI shopping
              agents can find and recommend your products.
            </p>

            {/* Description */}
            <p className="text-base text-muted-foreground mb-10 animate-slide-up font-mono" style={{ animationDelay: "0.15s" }}>
              From discovery to transaction – analyze how agents
              see your store, identify gaps, and get actionable
              fixes without changing your platform.
            </p>

            {/* URL Input Form */}
            <form onSubmit={handleSubmit} className="animate-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="border border-border bg-card p-1">
                <div className="flex flex-col sm:flex-row">
                  <Input
                    type="text"
                    placeholder="yourstore.com"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError("");
                    }}
                    className="flex-1 h-12 border-0 bg-transparent text-base font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <Button
                    type="submit"
                    className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
                  >
                    Analyze Store
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
              {error && (
                <p className="text-destructive text-sm mt-2">{error}</p>
              )}
            </form>

            {/* Trust indicators */}
            <div className="flex items-center gap-6 mt-8 animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <span className="text-sm text-muted-foreground font-mono">
                No signup required
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground font-mono">
                Results in 60 seconds
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
  return (
    <div className="relative">
      {/* Decorative grid pattern */}
      <div className="absolute inset-0 opacity-30">
        {[...Array(8)].map((_, row) => (
          <div key={row} className="flex items-center gap-4 mb-4">
            {[...Array(6)].map((_, col) => (
              <div key={col} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-border" />
                {col < 5 && <span className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Sample Score Card */}
      <div className="relative bg-card border border-border p-6 shadow-card max-w-sm ml-auto mt-16">
        <div className="flex items-center gap-2 mb-4">
          <PulseDot size="sm" />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Sample Report
          </span>
        </div>
        
        {/* Score Display */}
        <div className="mb-6">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-5xl text-foreground">72</span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
          <span className="text-sm text-muted-foreground font-mono">Agent Readiness Score</span>
        </div>

        {/* Category Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Discovery</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-accent w-[85%]" />
              </div>
              <span className="text-foreground font-mono w-12 text-right">34/40</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Performance</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-success w-[100%]" />
              </div>
              <span className="text-foreground font-mono w-12 text-right">15/15</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Transaction</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-warning w-[60%]" />
              </div>
              <span className="text-foreground font-mono w-12 text-right">12/20</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground font-mono">Trust</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[44%]" />
              </div>
              <span className="text-foreground font-mono w-12 text-right">11/25</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating metric cards */}
      <div className="absolute top-4 left-0 bg-card border border-border p-4 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Schema</span>
        </div>
        <span className="font-mono text-sm text-foreground">Product detected</span>
      </div>

      <div className="absolute top-32 left-8 bg-card border border-border p-4 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-1.5 h-1.5 rounded-full bg-warning" />
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Speed</span>
        </div>
        <span className="font-mono text-sm text-foreground">2.1s load time</span>
      </div>
    </div>
  );
};

export default HeroSection;
