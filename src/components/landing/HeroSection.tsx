import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const HeroSection = () => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateUrl = (input: string): boolean => {
    if (!input.trim()) {
      setError("Please enter a URL");
      return false;
    }

    let urlToCheck = input.trim();
    if (!urlToCheck.startsWith("http://") && !urlToCheck.startsWith("https://")) {
      urlToCheck = "https://" + urlToCheck;
    }

    try {
      new URL(urlToCheck);
      setError("");
      return true;
    } catch {
      setError("Please enter a valid URL");
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateUrl(url)) {
      let normalizedUrl = url.trim();
      if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://")) {
        normalizedUrl = "https://" + normalizedUrl;
      }
      navigate(`/analyzing?url=${encodeURIComponent(normalizedUrl)}`);
    }
  };

  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8 animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            AI Shopping is Here
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6 animate-slide-up">
            Is Your Store Invisible to{" "}
            <span className="text-gradient-accent">AI Shopping Agents?</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: "0.1s" }}>
            AI agents like ChatGPT and Claude are becoming the new shopping interface.
            Find out if they can discover and recommend your products.
          </p>

          {/* URL Input Form */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter your store URL (e.g., yourstore.com)"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (error) setError("");
                  }}
                  className="pl-12 h-14 text-base border-2 border-border focus:border-accent bg-card shadow-card"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-14 px-8 bg-gradient-accent hover:opacity-90 text-accent-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                Check My Store
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
            {error && (
              <p className="text-destructive text-sm mt-2 text-left">{error}</p>
            )}
          </form>

          {/* Trust Line */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 mt-8 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              No signup required
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              Results in 60 seconds
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-success" />
              100% free
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
