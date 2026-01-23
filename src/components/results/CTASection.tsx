import { Calendar, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PulseDot from "@/components/ui/PulseDot";

const CTASection = () => {
  return (
    <section className="bg-foreground p-6 md:p-8 text-background">
      <div className="flex items-center gap-3 mb-6">
        <PulseDot size="md" />
        <span className="text-sm font-medium uppercase tracking-widest text-background/60">
          Next Steps
        </span>
      </div>

      <h2 className="font-display text-2xl text-background mb-3">
        Want Expert Help?
      </h2>
      <p className="text-background/70 text-sm mb-8 font-mono max-w-md">
        Book a free 15-minute strategy call to discuss your specific situation, 
        implementation roadmap, and whether a deep audit makes sense for you.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          asChild
          size="lg"
          className="bg-background text-foreground hover:bg-background/90 font-medium"
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
          className="border-background/30 text-background hover:bg-background/10 font-medium"
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
