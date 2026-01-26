import { Calendar, RotateCcw, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="bg-foreground p-8 md:p-10">
      {/* Closing statement */}
      <div className="text-center mb-10 pb-10 border-b border-background/20">
        <p className="font-display text-xl md:text-2xl text-background leading-relaxed max-w-2xl mx-auto">
          This is where commerce is heading.{" "}
          <span className="text-background/60">Will you be discovered, or will you be skipped?</span>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-background/50 mb-4">
            Next Steps
          </p>
          <h2 className="font-display text-2xl md:text-3xl text-background mb-3">
            Need help implementing these fixes?
          </h2>
          <p className="text-background/70 text-sm leading-relaxed">
            Book a free 15-minute strategy call to discuss your specific situation, implementation roadmap, and whether a deep audit makes sense for you.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:justify-end">
          <Button
            asChild
            size="lg"
            className="bg-background text-foreground hover:bg-background/90 font-medium"
          >
            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
              <Calendar className="mr-2 h-4 w-4" />
              Book a Free Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="border-background/30 text-background hover:bg-background/10 font-medium"
          >
            <Link to="/">
              <RotateCcw className="mr-2 h-4 w-4" />
              Check Another URL
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
