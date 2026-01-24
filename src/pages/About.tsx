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
              Re:found Labs is building the infrastructure for AI-native commerce. We help brands ensure they're discoverable, trustworthy, and recommendable in an AI-first world.
            </p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="pb-16 md:pb-24">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">Our Thesis</p>
              <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
                The next billion purchases will be influenced by AI agents.
              </h2>
            </div>
            <div className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Search is evolving. Consumers are asking ChatGPT for recommendations, using Claude to research purchases, and relying on Perplexity to compare options.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Most e-commerce stores aren't ready. Their data is inconsistent, their policies contradict each other, and AI agents can't confidently recommend them.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                We're here to fix that.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section Placeholder */}
        <section className="pb-16 md:pb-24">
          <div className="border border-border p-8 md:p-12">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-4">The Team</p>
            <h2 className="font-display text-2xl md:text-3xl text-foreground mb-6">
              Built by operators and engineers.
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Founder Placeholder 1 */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Photo</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Founder Name</h3>
                  <p className="text-sm text-muted-foreground">Co-Founder & CEO</p>
                </div>
              </div>

              {/* Founder Placeholder 2 */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Photo</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">Founder Name</h3>
                  <p className="text-sm text-muted-foreground">Co-Founder & CTO</p>
                </div>
              </div>

              {/* Team Placeholder */}
              <div className="space-y-4">
                <div className="aspect-square bg-muted/30 border border-border flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">+</span>
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">We're Hiring</h3>
                  <p className="text-sm text-muted-foreground">Join the team</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-24">
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
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
