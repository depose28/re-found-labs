import PulseDot from "@/components/ui/PulseDot";

interface ScoreHeaderProps {
  score: number;
  grade: string;
  url: string;
  createdAt: string;
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

const ScoreHeader = ({ score, grade, url, createdAt }: ScoreHeaderProps) => {
  const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig["Needs Work"];
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const getScoreColor = () => {
    if (score >= 70) return "text-success";
    if (score >= 50) return "text-warning";
    return "text-destructive";
  };

  return (
    <section className="pt-28 pb-16 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl">
          {/* Label */}
          <div className="flex items-center gap-3 mb-8">
            <PulseDot size="md" />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Analysis Results
            </span>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Score */}
            <div>
              <div className="flex items-baseline gap-3 mb-2">
                <span className={`font-display text-7xl md:text-8xl ${getScoreColor()}`}>
                  {score}
                </span>
                <span className="text-3xl text-muted-foreground">/100</span>
              </div>
              <p className="text-lg text-muted-foreground font-mono mb-6">
                Agent Readiness Score
              </p>
              
              {/* Grade Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 border border-border">
                <span className="w-2 h-2 rounded-full bg-accent" />
                <span className="font-mono text-sm uppercase tracking-wide">
                  {config.label}
                </span>
              </div>
            </div>

            {/* Message & Meta */}
            <div className="space-y-6">
              <p className="text-lg text-foreground leading-relaxed">
                {config.message}
              </p>
              
              <div className="space-y-2 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground font-mono truncate">
                  {url}
                </p>
                <p className="text-sm text-muted-foreground font-mono">
                  {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreHeader;
