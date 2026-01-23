import { Rocket, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface ScoreHeaderProps {
  score: number;
  grade: string;
  url: string;
  createdAt: string;
}

const gradeConfig = {
  "Agent-Native": {
    icon: Rocket,
    emoji: "🚀",
    color: "success",
    message: "Excellent! Your store is fully optimized for AI shopping agents.",
  },
  Optimized: {
    icon: CheckCircle,
    emoji: "✅",
    color: "success",
    message: "Good foundation with room for improvement. Fix the gaps below to maximize AI visibility.",
  },
  "Needs Work": {
    icon: AlertTriangle,
    emoji: "⚠️",
    color: "warning",
    message: "Your store has significant gaps. Focus on the priority fixes below.",
  },
  Invisible: {
    icon: XCircle,
    emoji: "🚫",
    color: "destructive",
    message: "AI agents cannot effectively discover or recommend your products.",
  },
};

const ScoreHeader = ({ score, grade, url, createdAt }: ScoreHeaderProps) => {
  const config = gradeConfig[grade as keyof typeof gradeConfig] || gradeConfig["Needs Work"];
  const formattedDate = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getGradientClass = () => {
    if (score >= 70) return "bg-gradient-success";
    if (score >= 50) return "bg-gradient-warning";
    return "bg-gradient-error";
  };

  return (
    <section className={`pt-24 pb-12 ${getGradientClass()}`}>
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto text-center text-success-foreground">
          <p className="text-sm font-medium opacity-90 mb-2">Your AgentReady Score</p>
          
          {/* Score Circle */}
          <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full bg-background/20 backdrop-blur-sm mb-4">
            <span className="font-display text-5xl font-bold">{score}</span>
          </div>

          {/* Grade */}
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-2xl">{config.emoji}</span>
            <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
              {grade}
            </h1>
          </div>

          {/* Message */}
          <p className="text-lg opacity-90 mb-6 max-w-md mx-auto">
            {config.message}
          </p>

          {/* URL & Date */}
          <div className="text-sm opacity-75 space-y-1">
            <p className="truncate max-w-xs mx-auto">URL: {url}</p>
            <p>Analyzed: {formattedDate}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ScoreHeader;
