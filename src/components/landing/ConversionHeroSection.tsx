import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, Zap, CheckCircle2, Search, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PulseDot from "@/components/ui/PulseDot";
import { supabase } from "@/integrations/supabase/client";
const ConversionHeroSection = () => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [auditCount, setAuditCount] = useState(0);
  const navigate = useNavigate();

  // Fetch audit count for social proof
  useEffect(() => {
    const fetchCount = async () => {
      const {
        count
      } = await supabase.from("analyses").select("*", {
        count: "exact",
        head: true
      });
      if (count) setAuditCount(count);
    };
    fetchCount();
  }, []);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError("Please enter your website URL");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const {
        data,
        error: analysisError
      } = await supabase.functions.invoke("analyze", {
        body: {
          url: url.trim()
        }
      });
      if (analysisError) throw analysisError;
      if (data?.error) throw new Error(data.error);
      navigate(`/results?id=${data.id}`);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Analysis failed. Please try again.");
      setIsLoading(false);
    }
  };
  return <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/30 to-transparent pointer-events-none" />
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 relative">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Conversion-focused content */}
          <div className="max-w-xl">
            {/* Social proof eyebrow */}
            <div className="flex items-center gap-2 mb-6 animate-fade-in">
              <div className="flex -space-x-1">
                {[...Array(3)].map((_, i) => <div key={i} className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                    <span className="text-[10px] font-medium text-muted-foreground">
                      {["S", "M", "A"][i]}
                    </span>
                  </div>)}
              </div>
              <span className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{auditCount.toLocaleString()}+</span> stores analyzed
              </span>
            </div>

            {/* Headline - Benefit focused */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-[3.5rem] text-foreground leading-[1.1] mb-4 animate-slide-up">
              Is your store visible to AI shopping agents?
            </h1>

            {/* Subheadline - Value proposition */}
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 animate-slide-up" style={{
            animationDelay: "0.1s"
          }}>Get your free Agent Readiness Score in 60 seconds.</p>

            {/* URL Input Form - The main CTA */}
            <form onSubmit={handleSubmit} className="animate-slide-up" style={{
            animationDelay: "0.15s"
          }}>
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Input type="text" placeholder="Enter your store URL..." value={url} onChange={e => {
                  setUrl(e.target.value);
                  setError("");
                }} className="h-14 pl-4 pr-4 text-base bg-background border-border focus:border-foreground transition-colors" disabled={isLoading} />
                </div>
                <Button type="submit" size="lg" disabled={isLoading} className="h-14 px-8 bg-foreground text-background hover:bg-foreground/90 font-medium text-base whitespace-nowrap">
                  {isLoading ? <>
                      <PulseDot size="sm" className="mr-2" />
                      Analyzing...
                    </> : <>
                      Get Your Score
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>}
                </Button>
              </div>

              {error && <p className="text-sm text-destructive mb-4">{error}</p>}
            </form>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground animate-slide-up" style={{
            animationDelay: "0.2s"
          }}>
              <div className="flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-success" />
                <span>No signup required</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-success" />
                <span>Results in 60 seconds</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Zap className="h-4 w-4 text-success" />
                <span>100% free</span>
              </div>
            </div>
          </div>

          {/* Right: Report Preview */}
          <div className="relative animate-fade-in" style={{
          animationDelay: "0.3s"
        }}>
            {/* Report card */}
            <div className="bg-card border border-border shadow-2xl rounded-lg overflow-hidden">
              {/* Report header */}
              <div className="bg-foreground text-background p-6 text-center">
                <p className="text-sm uppercase tracking-wider opacity-70 mb-2">Agent Readiness Report</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-6xl font-display font-bold">73</span>
                  <div className="text-left">
                    <span className="text-2xl font-medium">/100</span>
                    <p className="text-xs uppercase tracking-wide opacity-70">Score</p>
                  </div>
                </div>
                <span className="inline-block mt-3 px-3 py-1 text-xs font-medium uppercase tracking-wide bg-warning/20 text-warning rounded">
                  Needs Optimization
                </span>
              </div>

              {/* Category breakdown */}
              <div className="p-6 space-y-4">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">Category Breakdown</p>
                
                {[{
                icon: Search,
                label: "Discovery",
                score: 32,
                max: 40,
                color: "bg-success"
              }, {
                icon: Zap,
                label: "Performance",
                score: 11,
                max: 15,
                color: "bg-warning"
              }, {
                icon: CreditCard,
                label: "Transaction",
                score: 14,
                max: 20,
                color: "bg-warning"
              }, {
                icon: Shield,
                label: "Trust",
                score: 16,
                max: 25,
                color: "bg-warning"
              }].map((cat, i) => <div key={i} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{cat.label}</span>
                      </div>
                      <span className="font-mono text-muted-foreground">
                        {cat.score}/{cat.max}
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className={`h-full ${cat.color} transition-all duration-1000`} style={{
                    width: `${cat.score / cat.max * 100}%`
                  }} />
                    </div>
                  </div>)}
              </div>

              {/* Issues preview */}
              <div className="border-t border-border p-6">
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">Issues Found</p>
                <div className="space-y-2">
                  {["Missing MerchantReturnPolicy schema", "PerplexityBot blocked in robots.txt", "LCP exceeds 2.5s threshold"].map((issue, i) => <div key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-destructive">✕</span>
                      <span className="text-muted-foreground">{issue}</span>
                    </div>)}
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <div className="absolute -top-3 -right-3 bg-accent text-accent-foreground px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-medium">Sample Report</span>
            </div>
          </div>
        </div>

        {/* Bottom stats bar */}
        <div className="mt-16 pt-8 border-t border-border animate-fade-in" style={{
        animationDelay: "0.4s"
      }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[{
            value: "10",
            label: "AI bots checked"
          }, {
            value: "4",
            label: "Categories analyzed"
          }, {
            value: "15+",
            label: "Checks per scan"
          }, {
            value: "73%",
            label: "Of stores need work"
          }].map((stat, i) => <div key={i} className="text-center md:text-left">
                <p className="font-display text-2xl md:text-3xl text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>)}
          </div>
        </div>
      </div>
    </section>;
};
export default ConversionHeroSection;