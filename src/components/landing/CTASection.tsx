import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PulseDot from "@/components/ui/PulseDot";

const CTASection = () => {
  const [url, setUrl] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }
      navigate(`/analyzing?url=${encodeURIComponent(normalizedUrl)}`);
    }
  };

  return (
    <section className="py-24 md:py-32">
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Section Label */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <PulseDot size="md" />
            <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
              Ready?
            </span>
          </div>

          {/* Headline */}
          <h2 className="font-display text-4xl md:text-5xl text-foreground mb-6">
            See what agents see.
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-muted-foreground mb-10">
            Your competitors are already optimizing for AI traffic. 
            Find out where you stand — before you fall behind.
          </p>

          {/* CTA Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-8">
            <div className="border border-border bg-card p-1">
              <div className="flex flex-col sm:flex-row">
                <Input
                  type="text"
                  placeholder="yourstore.com"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="flex-1 h-12 border-0 bg-transparent text-base focus-visible:ring-0 focus-visible:ring-offset-0"
                />
                <Button
                  type="submit"
                  className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
                >
                  Get Your Agent Score
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>

          {/* Contact */}
          <p className="text-sm text-muted-foreground">
            Questions?{" "}
            <a href="mailto:hello@agentpulse.com" className="text-foreground hover:underline">
              hello@agentpulse.com
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
