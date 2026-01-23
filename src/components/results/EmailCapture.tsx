import { useState } from "react";
import { Mail, CheckCircle2, Loader2 } from "lucide-react";
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
      <section className="bg-success/10 rounded-2xl p-6 md:p-8 border border-success/20">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="h-6 w-6 text-success" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-foreground">
              Report Sent!
            </h2>
            <p className="text-muted-foreground">
              Check your inbox for the detailed analysis report.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-card rounded-2xl p-6 md:p-8 shadow-card border border-border">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
          <Mail className="h-6 w-6 text-accent" />
        </div>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">
            Get the Full Report
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Receive a detailed PDF with step-by-step fix instructions and schema code examples you can copy-paste.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError("");
            }}
            className="flex-1 h-12"
            disabled={loading}
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-6 bg-gradient-accent hover:opacity-90"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Send Report"
            )}
          </Button>
        </div>
        {error && <p className="text-destructive text-sm">{error}</p>}
        <p className="text-xs text-muted-foreground">
          We'll also send you updates on AI commerce trends. Unsubscribe anytime.
        </p>
      </form>
    </section>
  );
};

export default EmailCapture;
