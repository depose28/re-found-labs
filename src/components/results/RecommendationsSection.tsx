import { AlertCircle, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { useState } from "react";
import PulseDot from "@/components/ui/PulseDot";

interface Recommendation {
  priority: "critical" | "high" | "medium";
  checkId: string;
  checkName: string;
  title: string;
  description: string;
  howToFix: string;
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[];
}

const priorityConfig = {
  critical: { icon: AlertCircle, color: "destructive", label: "Critical" },
  high: { icon: AlertTriangle, color: "warning", label: "High" },
  medium: { icon: Info, color: "accent", label: "Medium" },
};

const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <section className="bg-success/10 border border-success/20 p-6 md:p-8">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🎉</span>
          <h2 className="font-display text-2xl text-foreground mb-2">
            No Issues Found!
          </h2>
          <p className="text-muted-foreground font-mono text-sm">
            Your store is well-optimized for AI shopping agents.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border p-6 md:p-8">
      <div className="flex items-center gap-3 mb-8">
        <PulseDot size="md" />
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Priority Fixes
        </span>
      </div>

      <h2 className="font-display text-2xl text-foreground mb-2">
        Recommended Actions
      </h2>
      <p className="text-muted-foreground font-mono text-sm mb-8">
        These changes will have the biggest impact on your score
      </p>

      <div className="space-y-0 border-t border-border">
        {recommendations.map((rec, index) => {
          const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const isExpanded = expandedId === rec.checkId;

          return (
            <div
              key={rec.checkId}
              className="border-b border-border"
            >
              <div className="py-5">
                <div className="flex items-start gap-4">
                  <span className="text-accent font-mono text-xs mt-1">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs font-mono uppercase tracking-wide px-2 py-0.5 ${
                          config.color === "destructive"
                            ? "bg-destructive/10 text-destructive"
                            : config.color === "warning"
                            ? "bg-warning/10 text-warning"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {config.label}
                      </span>
                    </div>
                    <h3 className="font-display text-lg text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : rec.checkId)}
                  className="flex items-center gap-1 text-sm font-mono text-accent mt-4 ml-8 hover:opacity-80 transition-opacity"
                >
                  How to fix
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              </div>

              {isExpanded && (
                <div className="pb-5 ml-8">
                  <div className="p-4 bg-secondary/50 border border-border">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                      {rec.howToFix}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default RecommendationsSection;
