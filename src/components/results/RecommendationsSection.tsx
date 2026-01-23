import { AlertCircle, AlertTriangle, Info, ChevronDown, Wrench } from "lucide-react";
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
  critical: { icon: AlertCircle, color: "destructive", label: "Critical", order: 1 },
  high: { icon: AlertTriangle, color: "warning", label: "High", order: 2 },
  medium: { icon: Info, color: "accent", label: "Medium", order: 3 },
};

const RecommendationsSection = ({ recommendations }: RecommendationsSectionProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!recommendations || recommendations.length === 0) {
    return (
      <section>
        <div className="mb-8">
          <p className="text-sm text-muted-foreground mb-2">Recommendations</p>
          <h2 className="font-display text-2xl text-foreground">
            Priority Fixes
          </h2>
        </div>

        <div className="bg-success/10 border border-success/20 p-8 text-center">
          <span className="text-4xl mb-4 block">🎉</span>
          <h3 className="font-display text-xl text-foreground mb-2">
            No Issues Found!
          </h3>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Your store is well-optimized for AI shopping agents. Keep up the great work!
          </p>
        </div>
      </section>
    );
  }

  // Sort by priority
  const sortedRecs = [...recommendations].sort((a, b) => {
    const orderA = priorityConfig[a.priority as keyof typeof priorityConfig]?.order || 99;
    const orderB = priorityConfig[b.priority as keyof typeof priorityConfig]?.order || 99;
    return orderA - orderB;
  });

  const criticalCount = recommendations.filter(r => r.priority === "critical").length;
  const highCount = recommendations.filter(r => r.priority === "high").length;

  return (
    <section>
      <div className="mb-8">
        <p className="text-sm text-muted-foreground mb-2">Recommendations</p>
        <h2 className="font-display text-2xl text-foreground mb-2">
          Priority Fixes
        </h2>
        <p className="text-muted-foreground text-sm">
          {criticalCount > 0 && <span className="text-destructive font-medium">{criticalCount} critical</span>}
          {criticalCount > 0 && highCount > 0 && " · "}
          {highCount > 0 && <span className="text-warning font-medium">{highCount} high priority</span>}
          {(criticalCount > 0 || highCount > 0) && " — "}
          These changes will have the biggest impact on your score.
        </p>
      </div>

      <div className="border border-border divide-y divide-border">
        {sortedRecs.map((rec, index) => {
          const config = priorityConfig[rec.priority as keyof typeof priorityConfig] || priorityConfig.medium;
          const isExpanded = expandedId === rec.checkId;
          const PriorityIcon = config.icon;

          return (
            <div key={rec.checkId} className="bg-card">
              <div className="p-5">
                <div className="flex items-start gap-4">
                  {/* Priority Badge */}
                  <div 
                    className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                      config.color === "destructive"
                        ? "bg-destructive/10"
                        : config.color === "warning"
                        ? "bg-warning/10"
                        : "bg-accent/10"
                    }`}
                  >
                    <PriorityIcon 
                      className={`h-5 w-5 ${
                        config.color === "destructive"
                          ? "text-destructive"
                          : config.color === "warning"
                          ? "text-warning"
                          : "text-accent"
                      }`} 
                    />
                  </div>

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
                      <span className="text-xs text-muted-foreground font-mono">
                        #{String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                    <h3 className="font-medium text-lg text-foreground mb-2">{rec.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec.description}
                    </p>

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rec.checkId)}
                      className="flex items-center gap-2 text-sm font-medium text-accent mt-4 hover:opacity-80 transition-opacity"
                    >
                      <Wrench className="h-4 w-4" />
                      How to fix
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 pb-5">
                  <div className="ml-14 p-4 bg-secondary/50 border border-border">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed">
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
