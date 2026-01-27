import { CheckCircle2, Sparkles } from "lucide-react";

const WhatUnlocksSection = () => {
  const benefits = [
    {
      title: "ChatGPT Shopping",
      description: "Appear in ChatGPT's product recommendations and comparison results",
    },
    {
      title: "Klarna APP Integration",
      description: "Get discovered through Klarna's AI shopping assistant for 150M+ users",
    },
    {
      title: "Google AI Agents",
      description: "Surface in Google's AI Overviews and Shopping Graph recommendations",
    },
    {
      title: "Perplexity Shopping",
      description: "Be cited as a purchase option in Perplexity's AI search results",
    },
    {
      title: "Amazon & Apple Discovery",
      description: "Enable Alexa and Siri to recommend your products to shoppers",
    },
  ];

  return (
    <section className="mb-16">
      <div className="p-6 md:p-8 bg-success/5 border border-success/20">
        <div className="flex items-start gap-4 mb-6">
          <div className="w-12 h-12 flex items-center justify-center bg-success/20 flex-shrink-0">
            <Sparkles className="h-6 w-6 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-success mb-1">
              The Destination
            </p>
            <h2 className="font-display text-xl md:text-2xl text-foreground">
              What an 85+ Score Unlocks
            </h2>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex items-start gap-3 p-4 bg-background border border-border"
            >
              <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-foreground mb-0.5">{benefit.title}</p>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhatUnlocksSection;
