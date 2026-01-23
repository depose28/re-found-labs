import { useState, useEffect } from "react";
import PulseDot from "@/components/ui/PulseDot";
import { Clock, ExternalLink, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface ScoreHeaderProps {
  score: number;
  grade: string;
  url: string;
  createdAt: string;
  analysisDuration?: number;
  checksCount?: number;
  issuesCount?: number;
}

const gradeConfig = {
  "Agent-Native": {
    label: "AGENT-NATIVE",
    message: "Excellent! Your store is fully optimized for AI shopping agents. All critical checks passed.",
    color: "bg-success",
    textColor: "text-success",
  },
  Optimized: {
    label: "OPTIMIZED",
    message: "Good foundation with room for improvement. Address the priority fixes below to maximize AI visibility.",
    color: "bg-accent",
    textColor: "text-accent",
  },
  "Needs Work": {
    label: "NEEDS WORK",
    message: "Your store has significant gaps that prevent AI agents from fully understanding your products.",
    color: "bg-warning",
    textColor: "text-warning",
  },
  Invisible: {
    label: "INVISIBLE",
    message: "AI agents cannot effectively discover or recommend your products. Critical fixes required.",
    color: "bg-destructive",
    textColor: "text-destructive",
  },
};

const scoreLegend = [
  { range: "85+", label: "Agent-Native", color: "bg-success" },
  { range: "70-84", label: "Optimized", color: "bg-accent" },
  { range: "50-69", label: "Needs Work", color: "bg-warning" },
  { range: "<50", label: "Invisible", color: "bg-destructive" },
];

const ScoreHeader = ({ 
  score, 
  grade, 
  url, 
  createdAt, 
  analysisDuration,
  checksCount = 8,
  issuesCount = 0
}: ScoreHeaderProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const navigate = useNavigate();
  const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig["Needs Work"];
  
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(createdAt).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
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

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Report link copied to clipboard!");
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleReanalyze = () => {
    navigate(`/?url=${encodeURIComponent(url)}`);
  };

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
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground hidden sm:block">
              {formattedDate} at {formattedTime}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleShare} className="h-8">
                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleReanalyze} className="h-8">
                <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
                Re-analyze
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          {/* Left Column - Context */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground leading-tight mb-4">
                AI Agent Readiness Report
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                This report shows how well AI shopping agents can discover, understand, and transact on your site.
              </p>
            </div>

            {/* Score Legend */}
            <div className="space-y-3 pt-4">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Score Guide</p>
              {scoreLegend.map((item) => (
                <div key={item.range} className="flex items-center gap-3">
                  <span className={`w-1.5 h-5 ${item.color}`} />
                  <span className="text-sm text-muted-foreground font-mono w-12">{item.range}</span>
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>

            {/* Analyzed URL */}
            <div className="pt-4 border-t border-border">
              <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">
                Analyzed URL
              </p>
              <a 
                href={url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:text-accent transition-colors"
              >
                {domain}
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              
              {/* Analysis metadata */}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                {analysisDuration && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {(analysisDuration / 1000).toFixed(1)}s
                  </span>
                )}
                <span>{checksCount} checks</span>
                <span>{issuesCount} issues found</span>
              </div>
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
              <div className={`inline-flex items-center gap-2 px-4 py-2 ${config.color}/10 border border-current/20 mb-8`}>
                <span className={`w-2 h-2 rounded-full ${config.color}`} />
                <span className={`font-mono text-xs uppercase tracking-wide ${config.textColor}`}>
                  {config.label}
                </span>
              </div>

              {/* Grade Message */}
              <p className="text-muted-foreground text-sm leading-relaxed max-w-md">
                {config.message}
              </p>

              {/* Quick Stats */}
              {issuesCount > 0 && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs text-muted-foreground">
                    Found <span className="text-foreground font-medium">{issuesCount} issues</span> that can be improved.
                    Scroll down for detailed recommendations.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreHeader;
