import { Clock, AlertCircle, Trophy } from "lucide-react";

const TimelineGraphic = () => {
  const milestones = [
    { 
      date: "2025", 
      label: "Protocol Launch", 
      description: "UCP, ACP, MCP protocols go live",
      status: "past",
      icon: Clock
    },
    { 
      date: "Q2 2026", 
      label: "Mainstream Adoption", 
      description: "AI shopping agents hit critical mass",
      status: "current",
      icon: AlertCircle
    },
    { 
      date: "H2 2026", 
      label: "Market Locks In", 
      description: "Late movers compete for scraps as AI agents default to indexed competitors",
      status: "future",
      icon: Trophy
    },
  ];

  return (
    <div className="p-5 bg-secondary/30 border border-border">
      <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
        The Window Is Closing
      </p>
      
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-8 bottom-8 w-px bg-border" />
        
        <div className="space-y-4">
          {milestones.map((milestone, index) => {
            const Icon = milestone.icon;
            return (
              <div key={milestone.date} className="relative flex gap-4">
                <div className={`relative z-10 w-10 h-10 flex items-center justify-center flex-shrink-0 ${
                  milestone.status === "past" 
                    ? "bg-muted-foreground/20" 
                    : milestone.status === "current"
                    ? "bg-warning/20 animate-pulse"
                    : "bg-success/20"
                }`}>
                  <Icon className={`h-4 w-4 ${
                    milestone.status === "past" 
                      ? "text-muted-foreground" 
                      : milestone.status === "current"
                      ? "text-warning"
                      : "text-success"
                  }`} />
                </div>
                <div className="pt-2">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-muted-foreground">
                      {milestone.date}
                    </span>
                    {milestone.status === "current" && (
                      <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 bg-warning/20 text-warning font-medium">
                        You are here
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-sm text-foreground">{milestone.label}</p>
                  <p className="text-xs text-muted-foreground">{milestone.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TimelineGraphic;
