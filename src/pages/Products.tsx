import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

const Products = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      <main className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        {/* Hero Section */}
        <section className="pt-32 pb-16 md:pt-40 md:pb-24 min-h-[70vh] flex flex-col justify-center">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full mb-8">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                In Development
              </span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-6">
              The future of AI commerce visibility.
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-2xl">
              We're building tools that don't just audit your store—they monitor, test, and optimize how AI agents discover and recommend your products.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
              >
                Try the Free Audit
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border text-foreground text-sm font-medium hover:bg-accent/5 transition-colors"
              >
                View Services
              </Link>
            </div>
          </div>
        </section>

        {/* Teaser Grid */}
        <section className="pb-24">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Continuous Monitoring */}
            <div className="group relative p-8 border border-border bg-card hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">
                Continuous Monitoring
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Track your agent readiness score over time. Get alerts when something changes. Stay ahead of the algorithm.
              </p>
            </div>

            {/* Card 2: Agent Simulation */}
            <div className="group relative p-8 border border-border bg-card hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">
                Agent Simulation
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Watch real AI agents shop your store. Automated testing with ChatGPT, Claude, and Perplexity—see what they actually do.
              </p>
            </div>

            {/* Card 3: Policy Intelligence */}
            <div className="group relative p-8 border border-border bg-card hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">
                Policy Intelligence
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Detect contradictions between your structured data and content. Fix inconsistencies before agents get confused.
              </p>
            </div>

            {/* Card 4: AI Insights */}
            <div className="group relative p-8 border border-border bg-card hover:border-accent/30 transition-colors">
              <div className="absolute top-4 right-4">
                <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                  Coming Soon
                </span>
              </div>
              <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-6">
                <div className="h-2 w-2 bg-accent rounded-full animate-pulse" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">
                AI Insights
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Understand how AI-referred visitors behave. See what they search for, what they can't find, and where the opportunities are.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24">
          <div className="border border-border p-8 md:p-12 text-center">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">
              Be the first to know
            </p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              Join the waitlist for early access.
            </h2>
            <a
              href="mailto:hello@refoundlabs.com?subject=Products%20Waitlist"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-colors"
            >
              Request Early Access
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
