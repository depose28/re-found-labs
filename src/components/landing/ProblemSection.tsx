import PulseDot from "@/components/ui/PulseDot";

const stats = [
  {
    value: "4,700%",
    label: "YoY growth in AI-referred traffic to retail sites",
  },
  {
    value: "$17.5T",
    label: "spending influenced by AI agents by 2030",
  },
  {
    value: "73%",
    label: "of e-commerce stores fail basic agent readiness checks",
  },
];

const ProblemSection = () => {
  return (
    <section className="py-24 md:py-32 bg-foreground text-background">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-background/60">
            The Agentic Shift
          </span>
        </div>

        {/* Section Title */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          <h2 className="font-display text-4xl md:text-5xl text-background leading-tight">
            Your store speaks human.
            <br />
            Agents don't.
          </h2>
          <div className="flex items-end">
            <p className="text-lg text-background/70 leading-relaxed max-w-lg">
              AI shopping agents are becoming the new front door to commerce. They read structured data, 
              not product pages. They parse schemas, not marketing copy. If your store can't communicate 
              in their language, you're invisible — and your competitors aren't.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-px bg-background/10">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-foreground p-8 md:p-12"
            >
              <div className="font-display text-4xl md:text-5xl lg:text-6xl text-background mb-4">
                {stat.value}
              </div>
              <p className="text-background/60 text-sm">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
