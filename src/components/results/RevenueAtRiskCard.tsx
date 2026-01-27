import { useState } from "react";
import { TrendingDown, AlertTriangle, Calculator } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RevenueAtRiskCardProps {
  score: number;
}

const RevenueAtRiskCard = ({ score }: RevenueAtRiskCardProps) => {
  const [monthlyRevenue, setMonthlyRevenue] = useState<string>("");
  const [showCalculator, setShowCalculator] = useState(false);

  // Get risk percentage range based on score tier
  const getRiskRange = () => {
    if (score < 50) return { min: 25, max: 40, label: "25-40%" };
    if (score < 70) return { min: 15, max: 25, label: "15-25%" };
    if (score < 85) return { min: 5, max: 15, label: "5-15%" };
    return { min: 0, max: 5, label: "<5%" };
  };

  const getRiskLevel = () => {
    if (score < 50) return "critical";
    if (score < 70) return "high";
    if (score < 85) return "moderate";
    return "low";
  };

  const riskLevel = getRiskLevel();
  const riskRange = getRiskRange();

  // Calculate euro amount at risk
  const calculateRisk = () => {
    const revenue = parseFloat(monthlyRevenue.replace(/[^0-9.]/g, ""));
    if (isNaN(revenue) || revenue <= 0) return null;
    
    const minRisk = Math.round(revenue * (riskRange.min / 100));
    const maxRisk = Math.round(revenue * (riskRange.max / 100));
    
    return { minRisk, maxRisk };
  };

  const calculatedRisk = calculateRisk();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 0,
    }).format(value);
  };

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
            {riskRange.label}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            of AI-referred customers may be missing your store. AI traffic is growing{" "}
            <span className="font-medium text-foreground">4,700% YoY</span> — at your current score, 
            you're leaving money on the table.
          </p>

          {/* Calculator toggle */}
          {!showCalculator ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCalculator(true)}
              className="mt-3 h-8 px-2 text-xs text-accent hover:text-accent"
            >
              <Calculator className="h-3.5 w-3.5 mr-1.5" />
              Calculate your risk in €
            </Button>
          ) : (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Monthly revenue:</span>
                <Input
                  type="text"
                  placeholder="€100,000"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(e.target.value)}
                  className="h-8 text-sm max-w-[140px]"
                />
              </div>
              
              {calculatedRisk && (
                <div className={`p-3 ${
                  riskLevel === "critical" || riskLevel === "high" 
                    ? "bg-destructive/10" 
                    : "bg-warning/10"
                }`}>
                  <p className="text-sm font-medium text-foreground">
                    {formatCurrency(calculatedRisk.minRisk)} – {formatCurrency(calculatedRisk.maxRisk)}/month
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    at risk by H2 2026 as AI shopping scales
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueAtRiskCard;
