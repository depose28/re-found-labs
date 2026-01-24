import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
              Making commerce visible to AI.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Re:found Labs builds the infrastructure for AI-native commerce. We help e-commerce brands get discovered, understood, and recommended by AI shopping agents—the new front door to online purchases.
            </p>
          </div>
        </section>

        {/* Thesis Section */}
        <section className="pb-16 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Our Thesis</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
                The next billion purchases will be influenced by AI.
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                AI-referred traffic to retail sites grew <span className="text-foreground font-medium">4,700% year-over-year</span>. Visitors from AI sources are <span className="text-foreground font-medium">32% more engaged</span> and convert at higher rates than traditional channels. By 2030, AI agents will influence <span className="text-foreground font-medium">$17.5 trillion</span> in consumer spending.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                The shift is already here. Consumers ask ChatGPT for product recommendations. They use Claude to research purchases. They rely on Perplexity to compare options before buying.
              </p>
            </div>
          </div>
        </section>

        {/* Problem Section */}
        <section className="pb-16 md:pb-24">
          <div className="border border-border p-8 md:p-12">
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              Most e-commerce stores aren't ready.
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-muted-foreground leading-relaxed">
                  In our audits, <span className="text-foreground font-medium">73% of stores fail</span> basic agent readiness checks. Their structured data is incomplete. Their policies contradict each other. Their sites are too slow for agent interactions.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  AI agents can't confidently recommend what they can't understand.
                </p>
              </div>
              <div className="space-y-4">
                <p className="text-foreground font-medium">
                  We're fixing that—one store at a time.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Re:found Labs helps brands close the gap between how they present themselves to humans and how AI agents perceive them. Through diagnostics, simulation, and implementation, we make stores visible to the agents that increasingly shape purchase decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* What We Believe Section */}
        <section className="pb-16 md:pb-24">
          <p className="text-sm text-muted-foreground uppercase tracking-wider mb-8">What We Believe</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <p className="text-foreground font-medium">
                → Agent readiness is the new SEO.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The brands that optimize for AI discovery today will dominate tomorrow.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-foreground font-medium">
                → Data integrity builds trust.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                AI agents cross-reference everything. Consistency isn't optional—it's the foundation of recommendation.
              </p>
            </div>
            <div className="space-y-3">
              <p className="text-foreground font-medium">
                → Proof beats promises.
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We don't just audit—we simulate. We show you exactly what happens when ChatGPT tries to shop your store.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="pb-16 md:pb-24">
          <div className="border border-border p-8 md:p-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">The Team</p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-4">
              Built by operators and engineers who've seen this before.
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8 max-w-3xl">
              We've watched the SEO era unfold, helped brands navigate the social commerce shift, and built products used by millions. Now we're applying those lessons to the biggest platform shift in a decade: the rise of AI-mediated commerce.
            </p>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Founder Placeholder 1 */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Photo</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Founder Name</h3>
                  <p className="text-sm text-muted-foreground mb-1">Co-Founder & CEO</p>
                  <p className="text-xs text-muted-foreground">Background in venture/e-commerce/tech</p>
                </div>
              </div>

              {/* Founder Placeholder 2 */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Photo</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Founder Name</h3>
                  <p className="text-sm text-muted-foreground mb-1">Co-Founder & CTO</p>
                  <p className="text-xs text-muted-foreground">Background in engineering/product</p>
                </div>
              </div>

              {/* Hiring Placeholder */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-2xl text-muted-foreground">+</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">We're Hiring</h3>
                  <p className="text-sm text-muted-foreground mb-2">Help us build the future of agent commerce.</p>
                  <a 
                    href="mailto:hello@refoundlabs.com?subject=Careers"
                    className="text-xs text-accent hover:text-accent/80 transition-colors"
                  >
                    View Open Roles →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Closing Section */}
        <section className="pb-16 md:pb-24">
          <div className="max-w-2xl">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Based in Berlin. Working globally.</p>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              We started Re:found Labs because we saw the gap between where commerce is going and where most brands are today. AI agents are already recommending products—the question is whether they're recommending yours.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Try the Free Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="mailto:hello@refoundlabs.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-medium hover:bg-accent/5 transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
