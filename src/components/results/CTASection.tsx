import { Calendar, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <section className="bg-gradient-hero rounded-2xl p-6 md:p-8 text-primary-foreground">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-primary-foreground/20 flex items-center justify-center flex-shrink-0">
          <span className="text-2xl">🎯</span>
        </div>
        <div>
          <h2 className="font-display text-xl font-bold">
            Want Expert Help?
          </h2>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Book a free 15-minute strategy call to discuss your specific situation, implementation roadmap, and whether a deep audit makes sense for you.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          size="lg"
          className="bg-primary-foreground text-primary hover:bg-primary-foreground/90"
        >
          <a href="https://calendly.com" target="_blank" rel="noopener noreferrer">
            <Calendar className="mr-2 h-4 w-4" />
            Book a Free Call
          </a>
        </Button>
        <Button
          asChild
          variant="outline"
          size="lg"
          className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
        >
          <Link to="/">
            <RotateCcw className="mr-2 h-4 w-4" />
            Check Another URL
          </Link>
        </Button>
      </div>
    </section>
  );
};

export default CTASection;
