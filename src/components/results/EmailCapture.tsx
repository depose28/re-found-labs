import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PulseDot from "@/components/ui/PulseDot";

interface EmailCaptureProps {
  analysisId: string;
}

const EmailCapture = ({ analysisId }: EmailCaptureProps) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const validateEmail = (email: string): boolean => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.from("email_captures").insert({
        email: email.trim().toLowerCase(),
        analysis_id: analysisId,
        source: "results_page",
      });

      if (error) throw error;

      setSubmitted(true);
      toast.success("Report sent! Check your inbox.");
    } catch (err: any) {
      console.error("Failed to save email:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="bg-success/10 border border-success/20 p-6 md:p-8">
        <div className="flex items-center gap-4">
          <CheckCircle2 className="h-6 w-6 text-success flex-shrink-0" />
          <div>
            <h2 className="font-display text-xl text-foreground">
              Report Sent!
            </h2>
            <p className="text-muted-foreground font-mono text-sm">
              Check your inbox for the detailed analysis report.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <PulseDot size="md" />
        <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Get the Report
        </span>
      </div>

      <h2 className="font-display text-2xl text-foreground mb-2">
        Full Report
      </h2>
      <p className="text-muted-foreground text-sm mb-8 font-mono max-w-md">
        Receive a detailed PDF with step-by-step fix instructions and schema code examples.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-border p-1">
          <div className="flex flex-col sm:flex-row">
            <Input
              type="email"
              placeholder="you@company.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              className="flex-1 h-12 border-0 bg-transparent font-mono focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={loading}
              className="h-12 px-6 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Report"
              )}
            </Button>
          </div>
        </div>
        {error && <p className="text-destructive text-sm font-mono">{error}</p>}
        <p className="text-xs text-muted-foreground font-mono">
          We'll also send you updates on AI commerce trends. Unsubscribe anytime.
        </p>
      </form>
    </section>
  );
};

export default EmailCapture;
