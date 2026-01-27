import { useState } from "react";
import { Zap, ArrowRight, ChevronDown, Copy, Check, ExternalLink, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Recommendation {
  priority: "critical" | "high" | "medium";
  checkId: string;
  checkName: string;
  title: string;
  description: string;
  howToFix: string;
}

interface PriorityFixSpotlightProps {
  recommendations: Recommendation[];
}

const priorityPoints = {
  critical: 15,
  high: 10,
  medium: 5,
};

// Mapping of check IDs to "Unlocks" messages
const getUnlocksMessage = (checkId: string, checkName: string): string => {
  // Robots.txt related
  if (checkId.startsWith("D1") || checkName.toLowerCase().includes("robot")) {
    return "GPTBot, ClaudeBot, PerplexityBot, and other AI agents can discover your products";
  }
  // Schema related
  if (checkId.startsWith("D2") || checkName.toLowerCase().includes("schema") || checkName.toLowerCase().includes("structured")) {
    return "AI agents can read your product names, prices, availability, and reviews";
  }
  // Performance related
  if (checkId.startsWith("P") || checkName.toLowerCase().includes("performance") || checkName.toLowerCase().includes("speed")) {
    return "AI agents can reliably fetch your content without timing out";
  }
  // Transaction/checkout related
  if (checkId.startsWith("T") || checkName.toLowerCase().includes("transaction") || checkName.toLowerCase().includes("checkout")) {
    return "AI shopping agents can complete purchases on behalf of customers";
  }
  // Feed/distribution related
  if (checkId.startsWith("F") || checkName.toLowerCase().includes("feed") || checkName.toLowerCase().includes("distribution")) {
    return "Product feeds can sync with Google Shopping, Klarna, and AI marketplaces";
  }
  // Trust related
  if (checkName.toLowerCase().includes("trust") || checkName.toLowerCase().includes("security") || checkName.toLowerCase().includes("ssl")) {
    return "AI agents can confidently recommend your store to shoppers";
  }
  // Default
  return "AI shopping agents can better discover and recommend your products";
};

const PriorityFixSpotlight = ({ recommendations }: PriorityFixSpotlightProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Get highest priority recommendation
  const sortedRecs = [...recommendations].sort((a, b) => {
    const order = { critical: 1, high: 2, medium: 3 };
    return (order[a.priority] || 99) - (order[b.priority] || 99);
  });
  
  const topFix = sortedRecs[0];
  const pointGain = priorityPoints[topFix.priority] || 5;
  const unlocksMessage = getUnlocksMessage(topFix.checkId, topFix.checkName);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(topFix.howToFix);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Estimate implementation time based on check type
  const getEstimatedTime = () => {
    if (topFix.checkId.startsWith("D1") || topFix.checkId.startsWith("T")) return "5-15 mins";
    if (topFix.checkId.startsWith("D2") || topFix.checkId.startsWith("P")) return "30-60 mins";
    return "15-30 mins";
  };

  return (
    <section className="mb-16">
      <div className="border-2 border-accent bg-accent/5">
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 flex items-center justify-center bg-accent/20 flex-shrink-0">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium uppercase tracking-widest text-accent mb-1">
                #1 Priority Fix
              </p>
              <h2 className="font-display text-xl md:text-2xl text-foreground mb-2">
                {topFix.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                {topFix.description}
              </p>
              
              {/* Unlocks line */}
              <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/20">
                <Unlock className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p className="text-sm text-foreground">
                  <span className="font-medium text-success">Unlocks:</span>{" "}
                  {unlocksMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Impact metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Expected Gain</p>
              <p className="font-display text-2xl text-success">+{pointGain} pts</p>
            </div>
            <div className="p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Time to Implement</p>
              <p className="font-display text-2xl text-foreground">{getEstimatedTime()}</p>
            </div>
            <div className="hidden md:block p-4 bg-background border border-border">
              <p className="text-xs text-muted-foreground mb-1">Priority Level</p>
              <p className={`font-display text-2xl capitalize ${
                topFix.priority === "critical" ? "text-destructive" :
                topFix.priority === "high" ? "text-warning" : "text-accent"
              }`}>
                {topFix.priority}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="outline"
              className="flex-1 justify-between"
            >
              <span className="flex items-center gap-2">
                <ChevronDown className={`h-4 w-4 transition-transform ${showDetails ? "rotate-180" : ""}`} />
                Show me how
              </span>
            </Button>
            <Button asChild className="flex-1 bg-foreground text-background hover:bg-foreground/90">
              <Link to="/services">
                Do it for me
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Expandable details */}
        {showDetails && (
          <div className="border-t border-accent/30 p-6 md:p-8 bg-background">
            <div className="relative">
              <div className="absolute top-2 right-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-8 px-2"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="ml-1.5 text-xs">{copied ? "Copied!" : "Copy"}</span>
                </Button>
              </div>
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono leading-relaxed pr-20 overflow-x-auto p-4 bg-secondary/50 border border-border">
                {topFix.howToFix}
              </pre>
            </div>
            
            {/* Helpful links */}
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://schema.org/Product"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Schema.org Reference
              </a>
              <a
                href="https://search.google.com/test/rich-results"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-accent hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Test Your Markup
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default PriorityFixSpotlight;
