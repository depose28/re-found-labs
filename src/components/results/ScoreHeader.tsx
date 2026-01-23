import { useState, useEffect } from "react";
import PulseDot from "@/components/ui/PulseDot";

interface ScoreHeaderProps {
  score: number;
  grade: string;
  url: string;
  createdAt: string;
}

interface CategoryScores {
  discovery: { score: number; max: number };
  performance: { score: number; max: number };
  transaction: { score: number; max: number };
  trust: { score: number; max: number };
}

const gradeConfig = {
  "Agent-Native": {
    label: "AGENT-NATIVE",
    message: "Excellent! Your store is fully optimized for AI shopping agents.",
  },
  Optimized: {
    label: "OPTIMIZED",
    message: "Good foundation with room for improvement. Fix the gaps below to maximize AI visibility.",
  },
  "Needs Work": {
    label: "NEEDS WORK",
    message: "Your store has significant gaps. Focus on the priority fixes below.",
  },
  Invisible: {
    label: "INVISIBLE",
    message: "AI agents cannot effectively discover or recommend your products.",
  },
};

const scoreLegend = [
  { range: "80+", label: "Excellent", color: "bg-success" },
  { range: "65-79", label: "Good", color: "bg-accent" },
  { range: "50-64", label: "Average", color: "bg-warning" },
  { range: "<50", label: "Poor", color: "bg-destructive" },
];

const ScoreHeader = ({ score, grade, url, createdAt }: ScoreHeaderProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig["Needs Work"];
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const domain = (() => {
    try {
      return new URL(url).hostname;
    } catch {
      return url;
    }
  })();

  // Animate score from 0 to actual value
  useEffect(() => {
    const duration = 1500;
    const steps = 40;
    const increment = score / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  return (
    <section className="pt-32 pb-16 bg-secondary/30 border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Report Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <PulseDot size="sm" />
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Agent Pulse Report
            </span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {formattedDate}
          </span>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column - Context */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-4">
                Analyze how well your brand is understood by AI agents — then take action.
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                The Agent Score reveals how well AI agents can interpret and act on your site. It's a snapshot of your readiness for the AI web.
              </p>
            </div>

            {/* Score Legend */}
            <div className="space-y-3 pt-4">
              {scoreLegend.map((item) => (
                <div key={item.range} className="flex items-center gap-3">
                  <span className={`w-1 h-5 ${item.color}`} />
                  <span className="text-sm text-foreground">
                    {item.range} {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Analyzed URL */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Analyzed
              </p>
              <p className="text-sm font-medium text-foreground truncate">
                {domain}
              </p>
            </div>
          </div>

          {/* Right Column - Score Display */}
          <div className="lg:col-span-7">
            <div className="bg-card border border-border p-8 md:p-10">
              {/* Score Label */}
              <p className="text-sm text-muted-foreground mb-4">
                Agent Score
              </p>

              {/* Large Score - Animated */}
              <div className="flex items-baseline gap-3 mb-8">
                <span className="font-display text-7xl md:text-8xl text-foreground tabular-nums">
                  {animatedScore.toFixed(1)}
                </span>
                <span className="text-3xl text-muted-foreground/50">/ 100</span>
              </div>

              {/* Grade Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/50 border border-border mb-8">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-xs uppercase tracking-wide text-foreground">
                  {config.label}
                </span>
              </div>

              {/* Grade Message */}
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                {config.message}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreHeader;
