import { TrendingUp, DollarSign, AlertTriangle } from "lucide-react";

const stats = [
  {
    icon: TrendingUp,
    value: "4,700%",
    label: "YoY growth in AI-referred traffic",
  },
  {
    icon: DollarSign,
    value: "$17.5T",
    label: "spending influenced by AI agents by 2030",
  },
  {
    icon: AlertTriangle,
    value: "73%",
    label: "of stores fail basic agent readiness checks",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-20 md:py-28 bg-secondary/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            The Agentic Shift Is Here
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-shadow duration-300 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-accent/10 text-accent mb-4">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="font-display text-4xl md:text-5xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <p className="text-muted-foreground text-sm">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Explanatory Text */}
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Your store was built for human browsers clicking through pages.
            <span className="text-foreground font-medium">
              {" "}
              AI agents need structured data, open access, and machine-readable
              signals.
            </span>{" "}
            Without these, you're invisible to the next generation of shoppers.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
