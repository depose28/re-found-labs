import { ArrowRight, Scan, Bot, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PulseDot from "@/components/ui/PulseDot";

const services = [
  {
    icon: Scan,
    title: "Pulse Check",
    price: "Free",
    description: "12-point diagnostic. Results in 60 seconds.",
    cta: "Run Agent Pulse",
    ctaAction: "scroll", // scrolls to #agent-pulse
  },
  {
    icon: Bot,
    title: "Deep Scan",
    price: "From €750",
    description: "40+ checks. Real agent recordings. Expert review.",
    cta: "Learn More",
    ctaAction: "/services",
  },
  {
    icon: Wrench,
    title: "Optimization",
    price: "From €2,500",
    description: "Done-for-you fixes. +20 point score guarantee.",
    cta: "Learn More",
    ctaAction: "/services",
  },
];

const ServicesOverviewSection = () => {
  const handleScroll = () => {
    const element = document.getElementById("agent-pulse");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Section Label */}
        <div className="flex items-center gap-3 mb-8">
          <PulseDot size="md" />
          <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
            GO DEEPER
          </span>
        </div>

        {/* Section Header */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <h2 className="font-display text-4xl md:text-5xl text-foreground leading-tight">
            From diagnosis to optimization.
          </h2>
          <div className="flex items-end">
            <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
              Agent Pulse is the starting point. When you're ready for comprehensive analysis or hands-on optimization, we're here.
            </p>
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={index}
              className="group border border-border bg-card p-8 transition-all duration-300 hover:border-accent/30 hover:shadow-card"
            >
              {/* Icon */}
              <div className="mb-6">
                <service.icon className="h-8 w-8 text-foreground" strokeWidth={1.5} />
              </div>

              {/* Title & Price */}
              <h3 className="font-display text-2xl text-foreground mb-2">
                {service.title}
              </h3>
              <p className="text-accent font-medium mb-4">{service.price}</p>

              {/* Description */}
              <p className="text-muted-foreground leading-relaxed mb-6">
                {service.description}
              </p>

              {/* CTA */}
              {service.ctaAction === "scroll" ? (
                <button
                  onClick={handleScroll}
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  {service.cta}
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <Link
                  to={service.ctaAction}
                  className="text-sm font-medium text-foreground hover:text-accent transition-colors inline-flex items-center gap-1"
                >
                  {service.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Full Services CTA */}
        <div className="text-center">
          <Button variant="outline" size="lg" asChild>
            <Link to="/services">
              See Full Service Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverviewSection;
