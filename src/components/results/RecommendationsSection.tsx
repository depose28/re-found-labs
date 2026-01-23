import { AlertCircle, AlertTriangle, Info, ChevronDown } from "lucide-react";
import { useState } from "react";

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
      <section className="bg-success/10 rounded-2xl p-6 md:p-8 border border-success/20">
        <div className="text-center">
          <span className="text-4xl mb-4 block">🎉</span>
          <h2 className="font-display text-xl font-bold text-foreground mb-2">
            No Issues Found!
          </h2>
          <p className="text-muted-foreground">
            Your store is well-optimized for AI shopping agents.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-2xl">📋</span>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Priority Fixes
          </h2>
          <p className="text-sm text-muted-foreground">
            These changes will have the biggest impact on your score
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const PriorityIcon = config.icon;
          const isExpanded = expandedId === rec.checkId;

          return (
            <div
              key={rec.checkId}
              className="border rounded-xl overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg flex-shrink-0 ${
                      config.color === "destructive"
                        ? "bg-destructive/10 text-destructive"
                        : config.color === "warning"
                        ? "bg-warning/10 text-warning"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    <PriorityIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-muted-foreground">
                        {index + 1}.
                      </span>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
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
                    <h3 className="font-medium text-foreground">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {rec.description}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedId(isExpanded ? null : rec.checkId)}
                  className="flex items-center gap-1 text-sm font-medium text-accent mt-3 ml-11 hover:opacity-80 transition-opacity"
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
                <div className="px-4 pb-4 ml-11">
                  <div className="p-4 bg-secondary/50 rounded-lg">
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
