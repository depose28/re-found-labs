import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block">
                Services
              </span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
                Stop losing sales to invisible product pages.
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                AI shopping agents are already recommending your competitors.
                <br className="hidden md:block" />
                We diagnose exactly why — and fix it.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Free Tier */}
              <div className="bg-card border border-border p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Free</h3>
                  <span className="text-sm text-muted-foreground">Self-Serve</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">€0</p>
                  <span className="text-sm text-muted-foreground">Forever</span>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Instant Agent Score across 8 checks:
                  </p>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Discovery:</strong> AI bot access, schema, sitemap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Performance:</strong> Core Web Vitals via Lighthouse</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Transaction:</strong> Offer schema, HTTPS</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span><strong className="text-foreground">Trust:</strong> Organization & return policy schema</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prioritized fixes with code examples</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong className="text-foreground">Best for:</strong> Quick diagnosis. See where you stand in 60 seconds.
                  </p>
                  <Link to="/">
                    <Button className="w-full bg-foreground text-background hover:bg-foreground/90">
                      Run Free Audit
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    No signup required
                  </p>
                </div>
              </div>

              {/* Deep Audit Tier */}
              <div className="bg-card border-2 border-accent p-8 flex flex-col relative">
                <div className="absolute -top-3 left-8">
                  <span className="bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wide px-3 py-1">
                    Popular
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Deep Audit</h3>
                  <span className="text-sm text-muted-foreground">Expert Review</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">From €500</p>
                  <span className="text-sm text-muted-foreground">One-time</span>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Everything in Free, plus:
                  </p>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>40+ advanced checks including protocol readiness</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Platform-specific analysis (Shopify, Woo, Magento, custom)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>45-min video walkthrough of findings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Competitor benchmark (how you compare to 3 competitors)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>90-day implementation roadmap</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Direct access to implementation team</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong className="text-foreground">Best for:</strong> Brands that want expert guidance but have dev resources.
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Book Discovery Call
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Free 15-min call
                  </p>
                </div>
              </div>

              {/* Done-For-You Tier */}
              <div className="bg-card border border-border p-8 flex flex-col">
                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Done-For-You</h3>
                  <span className="text-sm text-muted-foreground">Implementation</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">From €2,500</p>
                  <span className="text-sm text-muted-foreground">Project-based</span>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-foreground mb-3">
                    Everything in Deep Audit, plus:
                  </p>
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Full schema implementation (Product, Offer, Organization, ReturnPolicy)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>robots.txt configuration for all AI crawlers</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Performance optimization (targeting LCP {"<"} 2.5s)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Sitemap optimization for product discovery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>30 days of support post-launch</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Monthly check-in call for 3 months</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-4">
                    <strong className="text-foreground">Best for:</strong> Brands that want it done right, without internal lift.
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background">
                      Request Quote
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Typical project: 2-4 weeks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto text-center">
              <p className="font-display text-2xl md:text-3xl text-foreground leading-relaxed italic mb-6">
                "Built by operators who've scaled e-commerce brands from €1M to €50M+. We know what breaks — and what works."
              </p>
            </div>
          </div>
        </section>

        {/* Who We Work With */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block text-center">
                Who We Work With
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8 text-center">
                Mid-market e-commerce brands serious about the AI channel.
              </h2>

              <div className="bg-card border border-border p-8 mb-8">
                <div className="grid sm:grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                      Revenue
                    </p>
                    <p className="text-foreground font-medium">€5M – €200M annually</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                      Platforms
                    </p>
                    <p className="text-foreground font-medium">
                      Shopify · Shopify Plus · WooCommerce · Magento · BigCommerce · Custom
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                      Mindset
                    </p>
                    <p className="text-foreground font-medium">
                      You see AI agents as a channel, not a gimmick.
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-center text-muted-foreground">
                Not sure if you qualify?{" "}
                <Link to="/" className="text-foreground underline hover:text-accent transition-colors">
                  Run the free audit first
                </Link>
                . If your score is below 70, we can help.
              </p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-center mb-12">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block">
                How We Work
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                From diagnosis to implementation in 4-6 weeks.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 mb-12">
              <ProcessStep
                number="01"
                title="Discovery"
                subtitle="Free, 15 min"
                description="Review your free audit score together. Identify quick wins. Decide if deeper analysis makes sense."
                outcome="Clarity on gaps and next steps"
              />
              <ProcessStep
                number="02"
                title="Deep Audit"
                subtitle="1 week"
                description="40+ checks across discovery, navigation, transaction, and trust. Platform-specific. Competitor benchmarked."
                outcome="Prioritized roadmap with effort estimates"
              />
              <ProcessStep
                number="03"
                title="Implementation"
                subtitle="2-4 weeks"
                description="We implement the fixes directly in your codebase or via your platform's theme/app ecosystem."
                outcome="Agent-ready store with verified score"
              />
            </div>

            {/* Step 4 - Centered */}
            <div className="max-w-md mx-auto text-center bg-card border border-border p-8">
              <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">04</p>
              <h3 className="font-display text-xl text-foreground mb-1">Ongoing Support</h3>
              <p className="text-sm text-muted-foreground mb-4">Optional, monthly</p>
              <p className="text-sm text-muted-foreground mb-4">
                AI agent landscape changes fast. We monitor your score, flag regressions, and keep you ahead of protocol updates.
              </p>
              <p className="text-sm text-foreground">
                <strong>Outcome:</strong> Sustained visibility as the ecosystem evolves
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block text-center">
                Common Questions
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12 text-center">
                FAQ
              </h2>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Why can't I just use the free audit and fix it myself?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    You can. The free audit gives you code examples for every issue. If you have a technical team comfortable with JSON-LD, robots.txt, and schema validation, you can implement everything yourself. The paid tiers are for brands that want expert guidance, platform-specific nuance, or simply don't have the bandwidth.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    What's the difference between 8 checks and 40+ checks?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-3">The free audit covers the 8 most critical signals. The deep audit adds:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Protocol readiness (MCP, UCP, ACP endpoint detection)</li>
                      <li>Price consistency (schema vs. visible price matching)</li>
                      <li>Inventory signal freshness</li>
                      <li>Review schema completeness</li>
                      <li>Shipping schema</li>
                      <li>Image alt-text analysis</li>
                      <li>Mobile agent rendering tests</li>
                      <li>And 25+ more platform-specific checks</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    How long until I see results?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Schema changes are typically indexed within 1-2 weeks. Most clients see improved AI agent visibility within 30 days of implementation. We provide before/after score comparisons to verify impact.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Do you work with agencies?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes. If you're an agency managing e-commerce clients, we offer white-label audits and implementation partnerships. Contact us for agency pricing.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    What if my score doesn't improve?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Implementation tier includes a score guarantee. If your Agent Score doesn't improve by at least 20 points within 60 days of implementation, we'll continue working at no additional cost until it does.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-foreground text-background">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 text-center">
            <h2 className="font-display text-3xl md:text-4xl mb-8">
              Ready to become visible to AI agents?
            </h2>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Book a Free Discovery Call
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
            <p className="text-background/60 text-sm mb-6">
              15 minutes. No pitch. Just answers.
            </p>

            <Link to="/" className="text-background/80 hover:text-background underline transition-colors">
              Or run the free audit first →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const ProcessStep = ({
  number,
  title,
  subtitle,
  description,
  outcome,
}: {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  outcome: string;
}) => (
  <div className="bg-card border border-border p-8">
    <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">
      {number}
    </p>
    <h3 className="font-display text-xl text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground mb-4">{subtitle}</p>
    <p className="text-sm text-muted-foreground mb-4">{description}</p>
    <p className="text-sm text-foreground">
      <strong>Outcome:</strong> {outcome}
    </p>
  </div>
);

export default Services;
