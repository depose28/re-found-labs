import { Link } from "react-router-dom";
import { ArrowRight, Check, Phone, FileSearch, Wrench } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/agentpulse/strategy-call";

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                Make Your Store Agent-Ready
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                From diagnosis to implementation — we help e-commerce brands prepare for the agentic commerce era.
              </p>
            </div>
          </div>
        </section>

        {/* Service Tiers */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Free Audit */}
              <div className="bg-card border border-border p-8 flex flex-col">
                <div className="mb-6">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Self-serve
                  </span>
                  <h3 className="font-display text-2xl text-foreground mt-2">Free Audit</h3>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <ServiceFeature>Instant score</ServiceFeature>
                  <ServiceFeature>8 core checks</ServiceFeature>
                  <ServiceFeature>Prioritized recommendations</ServiceFeature>
                  <ServiceFeature>Code examples</ServiceFeature>
                </ul>

                <div className="mt-auto">
                  <p className="text-3xl font-display text-foreground mb-4">Free</p>
                  <Link to="/">
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                      Run Free Audit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Deep Audit */}
              <div className="bg-card border-2 border-accent p-8 flex flex-col relative">
                <div className="absolute -top-3 left-8">
                  <span className="bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wide px-3 py-1">
                    Popular
                  </span>
                </div>

                <div className="mb-6">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Expert review
                  </span>
                  <h3 className="font-display text-2xl text-foreground mt-2">Deep Audit</h3>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <ServiceFeature>40+ advanced checks</ServiceFeature>
                  <ServiceFeature>Platform-specific recommendations</ServiceFeature>
                  <ServiceFeature>Video walkthrough</ServiceFeature>
                  <ServiceFeature>Priority roadmap</ServiceFeature>
                </ul>

                <div className="mt-auto">
                  <p className="text-3xl font-display text-foreground mb-4">
                    From €500
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Book a Call
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Implementation */}
              <div className="bg-card border border-border p-8 flex flex-col">
                <div className="mb-6">
                  <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                    Done for you
                  </span>
                  <h3 className="font-display text-2xl text-foreground mt-2">Implementation</h3>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <ServiceFeature>Full schema implementation</ServiceFeature>
                  <ServiceFeature>robots.txt configuration</ServiceFeature>
                  <ServiceFeature>Performance optimization</ServiceFeature>
                  <ServiceFeature>Ongoing support</ServiceFeature>
                </ul>

                <div className="mt-auto">
                  <p className="text-3xl font-display text-foreground mb-4">
                    Custom quote
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background">
                      Get in Touch
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Work With */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
                Who We Work With
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We work with mid-market e-commerce brands — typically €5M–€200M in revenue — on Shopify, WooCommerce, Magento, or custom platforms.
              </p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12 text-center">
              How It Works
            </h2>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
              <ProcessStep
                number="01"
                icon={Phone}
                title="Discovery Call"
                description="Free 15-minute call to review your score and identify quick wins"
              />
              <ProcessStep
                number="02"
                icon={FileSearch}
                title="Deep Audit"
                description="Comprehensive analysis with platform-specific recommendations"
              />
              <ProcessStep
                number="03"
                icon={Wrench}
                title="Implementation"
                description="We handle the technical work so you can focus on your business"
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-24 bg-foreground text-background">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-8">
              Ready to get started?
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Book a Free Strategy Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
              <Link to="/">
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-background hover:text-background hover:bg-background/10"
                >
                  Or check your score first
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const ServiceFeature = ({ children }: { children: React.ReactNode }) => (
  <li className="flex items-start gap-3 text-sm text-foreground/80">
    <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const ProcessStep = ({
  number,
  icon: Icon,
  title,
  description,
}: {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="text-center">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-6">
      <Icon className="h-7 w-7 text-foreground" />
    </div>
    <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">
      {number}
    </p>
    <h3 className="font-display text-xl text-foreground mb-3">{title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
  </div>
);

export default Services;
