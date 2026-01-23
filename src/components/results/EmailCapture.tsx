import { useState } from "react";
import { Mail, CheckCircle2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      <section className="bg-success/10 border border-success/20 p-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center bg-success/20">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="font-display text-xl text-foreground mb-1">
              Report Sent!
            </h2>
            <p className="text-muted-foreground text-sm">
              Check your inbox for the detailed analysis report.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card border border-border p-8">
      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 flex items-center justify-center bg-accent/10">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Download Report
            </span>
          </div>

          <h2 className="font-display text-2xl text-foreground mb-2">
            Get the Full Report
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Receive a detailed PDF with step-by-step fix instructions and schema code examples you can share with your team.
          </p>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="border border-border p-1 bg-background">
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
            {error && <p className="text-destructive text-sm">{error}</p>}
            <p className="text-xs text-muted-foreground">
              We'll also send you updates on AI commerce trends. Unsubscribe anytime.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default EmailCapture;
