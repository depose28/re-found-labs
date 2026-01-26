import { TrendingDown, AlertTriangle } from "lucide-react";

interface RevenueAtRiskCardProps {
  score: number;
}

const RevenueAtRiskCard = ({ score }: RevenueAtRiskCardProps) => {
  // Estimate risk based on score tier
  const getRiskPercentage = () => {
    if (score < 50) return "25-40%";
    if (score < 70) return "15-25%";
    if (score < 85) return "5-15%";
    return "<5%";
  };

  const getRiskLevel = () => {
    if (score < 50) return "critical";
    if (score < 70) return "high";
    if (score < 85) return "moderate";
    return "low";
  };

  const riskLevel = getRiskLevel();

  return (
    <div className={`p-6 border ${
      riskLevel === "critical" ? "bg-destructive/5 border-destructive/20" :
      riskLevel === "high" ? "bg-warning/5 border-warning/20" :
      riskLevel === "moderate" ? "bg-accent/5 border-accent/20" :
      "bg-success/5 border-success/20"
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 flex items-center justify-center flex-shrink-0 ${
          riskLevel === "critical" || riskLevel === "high" ? "bg-destructive/10" : "bg-warning/10"
        }`}>
          {riskLevel === "critical" || riskLevel === "high" ? (
            <AlertTriangle className="h-5 w-5 text-destructive" />
          ) : (
            <TrendingDown className="h-5 w-5 text-warning" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
            Revenue at Risk
          </p>
          <p className={`font-display text-2xl md:text-3xl mb-2 ${
            riskLevel === "critical" ? "text-destructive" :
            riskLevel === "high" ? "text-warning" :
            riskLevel === "moderate" ? "text-accent" :
            "text-success"
          }`}>
            {getRiskPercentage()}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            of AI-referred customers may be missing your store. AI traffic is growing{" "}
            <span className="font-medium text-foreground">4,700% YoY</span> — at your current score, 
            you're leaving money on the table.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RevenueAtRiskCard;
