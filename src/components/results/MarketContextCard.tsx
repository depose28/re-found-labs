import { TrendingUp, Users, DollarSign, Calendar } from "lucide-react";

const MarketContextCard = () => {
  const stats = [
    {
      icon: TrendingUp,
      value: "4,700%",
      label: "YoY Growth",
      description: "in AI-referred traffic",
    },
    {
      icon: Users,
      value: "73%",
      label: "Fail Rate",
      description: "of stores fail basic readiness",
    },
    {
      icon: DollarSign,
      value: "$17.5T",
      label: "Market Size",
      description: "influenced by AI by 2030",
    },
    {
      icon: Calendar,
      value: "2025",
      label: "Protocol Launch",
      description: "major protocols went live",
    },
  ];

  return (
    <section className="mb-16">
      <div className="p-6 md:p-8 bg-secondary/30 border border-border">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-6">
          Market Context
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-2">
                  <div className="w-8 h-8 flex items-center justify-center bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                </div>
                <p className="font-display text-2xl md:text-3xl text-foreground mb-0.5">
                  {stat.value}
                </p>
                <p className="text-xs font-medium text-foreground mb-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground">{stat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default MarketContextCard;
