import { BarChart3 } from "lucide-react";

const SocialProofBanner = () => {
  return (
    <div className="flex items-center justify-center gap-2 py-3 px-4 bg-muted/50 border border-border mb-6">
      <BarChart3 className="h-4 w-4 text-muted-foreground" />
      <p className="text-sm text-muted-foreground">
        Based on analysis of <span className="font-medium text-foreground">500+</span> e-commerce stores — 
        <span className="font-medium text-foreground"> 73%</span> fail basic AI agent readiness checks
      </p>
    </div>
  );
};

export default SocialProofBanner;
