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
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
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
            <p className="text-sm text-muted-foreground mb-10 animate-slide-up" style={{ animationDelay: "0.15s" }}>
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
                    className="flex-1 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
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
              <span className="text-sm text-muted-foreground">
                No signup required
              </span>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm text-muted-foreground">
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
      <div className="bg-card border border-border shadow-card max-w-sm ml-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <PulseDot size="sm" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Agent Pulse
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            agentpulse.com
          </span>
        </div>

        {/* Company Info */}
        <div className="p-6 border-b border-border">
          <h3 className="font-display text-lg text-foreground mb-1">
            Sample Brand
          </h3>
          <p className="text-sm text-muted-foreground">
            The E-Commerce Store
          </p>
        </div>

        {/* Main Score */}
        <div className="p-8 flex flex-col items-center justify-center min-h-[160px]">
          <h2 className="font-display text-4xl text-foreground mb-2">
            Agent Score
          </h2>
          <div className="flex items-baseline gap-1">
            <span className="font-display text-6xl text-accent">72</span>
            <span className="text-2xl text-muted-foreground">/100</span>
          </div>
        </div>

        {/* Report Details */}
        <div className="px-6 py-4 bg-secondary/30 border-t border-border">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
            Report
          </p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Client:</span>
              <span className="text-foreground">Sample Brand</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Domain:</span>
              <span className="text-foreground">www.sample.com</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Scoring Date:</span>
              <span className="text-foreground">January 23, 2025</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            ©2025 Agent Pulse
          </span>
          <span className="text-xs text-muted-foreground">
            Bring on the Agents
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
