import { Link } from "react-router-dom";
import { ArrowRight, Check, TrendingUp, Layers, Lightbulb } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/refoundlabs/strategy-call";

const Services = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-24 pb-8 md:pt-32 md:pb-12">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-2xl">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-3 block">
                Services
              </span>
              <h1 className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight mb-4">
                Make Your Store Agent-Ready
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From diagnosis to implementation — we help e-commerce brands prepare for the agentic commerce era.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Tiers */}
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {/* Free Audit Tier */}
              <div className="bg-card border border-border p-8 flex flex-col order-2 md:order-1">
                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Free Audit</h3>
                  <span className="text-sm text-muted-foreground">Self-Serve</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">€0</p>
                  <span className="text-sm text-muted-foreground">Free forever</span>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    What you get
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Instant Agent Score (0-100)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>8 automated checks across 4 categories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Schema validation & bot access analysis</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Core Web Vitals performance check</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Prioritized fixes with code examples</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Best for
                  </p>
                  <p className="text-sm text-foreground mb-6">
                    Quick diagnosis. See where you stand in 60 seconds.
                  </p>
                  <Link to="/">
                    <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background">
                      Run Free Audit
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    No signup required
                  </p>
                </div>
              </div>

              {/* Deep Audit + Agent Simulation Tier (Highlighted) */}
              <div className="bg-card border-2 border-accent p-8 flex flex-col relative order-1 md:order-2">
                <div className="absolute -top-3 left-8">
                  <span className="bg-accent text-accent-foreground text-xs font-medium uppercase tracking-wide px-3 py-1">
                    Most Popular
                  </span>
                </div>

                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Deep Audit</h3>
                  <span className="text-sm text-muted-foreground">+ Agent Simulation</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">From €750</p>
                  <span className="text-sm text-muted-foreground">One-time</span>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    What you get
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Everything in Free Audit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>40+ advanced checks with expert review</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Real AI agents test your store with recordings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Competitor comparison (2-3 competitors)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>45-minute video walkthrough</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>90-day implementation roadmap</span>
                    </li>
                  </ul>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Best for
                  </p>
                  <p className="text-sm text-foreground mb-6">
                    Brands that need proof — and a plan.
                  </p>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                      Book Discovery Call
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Free 15-min call
                  </p>
                </div>
              </div>

              {/* Implementation Tier */}
              <div className="bg-card border border-border p-8 flex flex-col order-3">
                <div className="mb-6">
                  <h3 className="font-display text-2xl text-foreground">Implementation</h3>
                  <span className="text-sm text-muted-foreground">Done-for-You</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-display text-foreground">From €2,500</p>
                  <span className="text-sm text-muted-foreground">Project-based</span>
                </div>

                <div className="border-t border-border pt-6 mb-6">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4">
                    What you get
                  </p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Everything in Deep Audit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Full schema & robots.txt implementation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Performance & sitemap optimization</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>30 days of post-launch support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                      <span>Monthly check-ins for 3 months</span>
                    </li>
                  </ul>

                  {/* Score Guarantee Box */}
                  <div className="mt-6 bg-secondary/50 border border-border p-4">
                    <p className="text-sm font-medium text-foreground mb-1">Score Guarantee</p>
                    <p className="text-sm text-muted-foreground">
                      +20 points within 60 days — or we keep working at no extra cost.
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-border">
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Best for
                  </p>
                  <p className="text-sm text-foreground mb-6">
                    Brands that want it done right, without internal lift.
                  </p>
                  <a href="mailto:hello@agentpulse.com">
                    <Button variant="outline" className="w-full border-foreground text-foreground hover:bg-foreground hover:text-background">
                      Request Quote
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground mt-3 text-center">
                    Typical project: 2-4 weeks
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Who We Work With */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block text-center">
                Who We Work With
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8 text-center">
                Mid-market e-commerce brands serious about the AI channel.
              </h2>

              <div className="grid sm:grid-cols-3 gap-8 mb-10">
                <div className="bg-card border border-border p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <TrendingUp className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Revenue
                  </p>
                  <p className="text-foreground font-medium">€5M – €200M annually</p>
                </div>
                <div className="bg-card border border-border p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Layers className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Platforms
                  </p>
                  <p className="text-foreground font-medium text-sm">
                    Shopify · WooCommerce · Magento · BigCommerce · Custom
                  </p>
                </div>
                <div className="bg-card border border-border p-6 text-center">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <Lightbulb className="h-5 w-5 text-accent" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-2">
                    Mindset
                  </p>
                  <p className="text-foreground font-medium">
                    You see AI agents as a channel, not a gimmick.
                  </p>
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
        <section className="py-16 md:py-24">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="text-center mb-12">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block">
                How We Work
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground">
                From diagnosis to implementation in 4-6 weeks.
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-12 max-w-5xl mx-auto">
              <div className="bg-card border border-border p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">01</p>
                <h3 className="font-display text-xl text-foreground mb-1">Discovery Call</h3>
                <p className="text-sm text-muted-foreground mb-4">(Free, 15 min)</p>
                <p className="text-sm text-muted-foreground mb-6">
                  Review your free audit score together. Identify quick wins. Decide if deeper analysis makes sense.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Outcome:</strong> Clarity on gaps and next steps
                </p>
              </div>

              <div className="bg-card border border-border p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">02</p>
                <h3 className="font-display text-xl text-foreground mb-1">Deep Audit + Agent Simulation</h3>
                <p className="text-sm text-muted-foreground mb-4">(1 week)</p>
                <p className="text-sm text-muted-foreground mb-6">
                  40+ checks plus real agent testing. Platform-specific. Competitor benchmarked. Video walkthrough included.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Outcome:</strong> Proof of problem + prioritized plan
                </p>
              </div>

              <div className="bg-card border border-border p-8">
                <p className="text-xs font-medium uppercase tracking-widest text-accent mb-2">03</p>
                <h3 className="font-display text-xl text-foreground mb-1">Implementation</h3>
                <p className="text-sm text-muted-foreground mb-4">(2-4 weeks)</p>
                <p className="text-sm text-muted-foreground mb-6">
                  We implement fixes directly in your codebase or via your platform's theme and app ecosystem.
                </p>
                <p className="text-sm text-foreground">
                  <strong>Outcome:</strong> Agent-ready store with verified score improvement
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-secondary/30">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-3xl mx-auto">
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-4 block text-center">
                Common Questions
              </span>
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-12 text-center">
                Answers to your questions
              </h2>

              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="item-1" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Why does Agent Simulation matter?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-4">Most tools check static signals — schema, robots.txt, speed. We go further by sending real AI agents shopping and recording what happens.</p>
                    <p className="mb-2"><strong className="text-foreground">Static audits say:</strong> "Offer schema missing availability property"</p>
                    <p className="mb-4"><strong className="text-foreground">Agent simulation shows:</strong> ChatGPT saying "I couldn't confirm stock status, so I'm recommending Brand X instead"</p>
                    <p>Theory vs. reality — we show you both.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-2" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    What's included in the Agent Simulation?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-4">We run real queries through ChatGPT (browsing mode), Claude, and Perplexity:</p>
                    <ul className="list-disc list-inside space-y-2 mb-4">
                      <li>"[Your brand] + [product type]" — Can they find you?</li>
                      <li>"Compare [your product] vs [competitor]" — How do they position you?</li>
                      <li>"Best [category] under €X" — Are you recommended?</li>
                      <li>"Buy [product] from [brand]" — Can they complete the flow?</li>
                    </ul>
                    <p>You receive screen recordings of each session, a transcript of agent responses, and a side-by-side comparison with 2-3 competitors using the same queries.</p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-3" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Why is Agent Simulation bundled with the Deep Audit?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Static checks tell you what's broken. Simulation shows you the consequences. Together, they're actionable. Separately, they're incomplete. We bundle them because that's what actually helps you make decisions.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-4" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    How long does the Deep Audit + Agent Simulation take?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Typically 5-7 business days from kickoff to final deliverable. The simulation portion requires running real agent sessions, which we do manually to ensure accuracy.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-5" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Can I just use the free audit and fix it myself?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes. The free audit gives you code examples for every issue. If you have a technical team comfortable with JSON-LD, robots.txt, and schema validation, you can implement everything yourself. The paid tiers are for brands that want expert guidance, platform-specific nuance, or simply don't have the bandwidth.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-6" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    What's the difference between 8 checks and 40+ checks?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p className="mb-4">The free audit covers the 8 most critical signals. The deep audit adds:</p>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Protocol readiness (MCP, UCP, ACP endpoint detection)</li>
                      <li>Price consistency (schema vs. visible price matching)</li>
                      <li>Inventory signal freshness</li>
                      <li>Review schema completeness</li>
                      <li>Shipping schema</li>
                      <li>Image alt-text analysis for visual agents</li>
                      <li>Mobile agent rendering tests</li>
                      <li>And 25+ more platform-specific checks</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-7" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    What if my score doesn't improve after Implementation?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    The Implementation tier includes a score guarantee. If your Agent Score doesn't improve by at least 20 points within 60 days of implementation, we'll continue working at no additional cost until it does.
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="item-8" className="bg-card border border-border px-6">
                  <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                    Do you work with agencies?
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    Yes. If you're an agency managing e-commerce clients, we offer white-label audits and implementation partnerships. Contact us for agency pricing.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 md:py-24 bg-card border-t border-border">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="font-display text-3xl md:text-4xl text-foreground mb-8">
                See what AI agents see.
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-8">
                    Book a Discovery Call
                  </Button>
                </a>
                <Link to="/">
                  <Button variant="outline" className="border-foreground text-foreground hover:bg-foreground hover:text-background">
                    Run the Free Audit First
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <p className="text-sm text-muted-foreground">
                Discovery call: 15 minutes. No pitch. Just answers.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Services;
