import { useState, useEffect } from "react";

interface IndustryComparisonBarsProps {
  score: number;
}

const IndustryComparisonBars = ({ score }: IndustryComparisonBarsProps) => {
  const [animated, setAnimated] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 300);
    return () => clearTimeout(timer);
  }, []);

  const benchmarks = [
    { label: "Your Score", value: score, isUser: true },
    { label: "Industry Average", value: 62, isUser: false },
    { label: "Top Performers", value: 85, isUser: false },
  ];

  const getBarColor = (value: number, isUser: boolean) => {
    if (isUser) {
      if (value >= 85) return "bg-success";
      if (value >= 70) return "bg-accent";
      if (value >= 50) return "bg-warning";
      return "bg-destructive";
    }
    return "bg-muted-foreground/30";
  };

  return (
    <div className="space-y-4">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
        How You Compare
      </p>
      <div className="space-y-3">
        {benchmarks.map((benchmark) => (
          <div key={benchmark.label} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className={benchmark.isUser ? "font-medium text-foreground" : "text-muted-foreground"}>
                {benchmark.label}
              </span>
              <span className={`font-mono ${benchmark.isUser ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                {benchmark.value}
              </span>
            </div>
            <div className="relative h-2 bg-secondary overflow-hidden rounded-full">
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-1000 ease-out rounded-full ${getBarColor(benchmark.value, benchmark.isUser)}`}
                style={{ width: animated ? `${benchmark.value}%` : "0%" }}
              />
              {/* Marker for top performer threshold */}
              {benchmark.isUser && (
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground/50" 
                  style={{ left: "85%" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>
      {score < 85 && (
        <p className="text-xs text-muted-foreground">
          {score < 62 
            ? `You're ${62 - score} points below the industry average.`
            : `You need ${85 - score} more points to reach top performer status.`
          }
        </p>
      )}
    </div>
  );
};

export default IndustryComparisonBars;
