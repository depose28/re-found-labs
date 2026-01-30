import { useState } from "react";
import { CheckCircle2, Loader2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { endpoints } from "@/config/api";
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
      const trimmedEmail = email.trim().toLowerCase();

      // Save the email capture via API
      const response = await fetch(endpoints.emailCapture, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: trimmedEmail,
          analysisId,
          source: 'results_page',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save email');
      }

      toast.success("Email saved! We'll send you the detailed report shortly.");
      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to process request:", err);
      setError(err.message || "Failed to submit. Please try again.");
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
              Email Saved!
            </h2>
            <p className="text-muted-foreground text-sm">
              We'll send you the detailed analysis report shortly.
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
            Receive a detailed report with step-by-step fix instructions and schema code examples you can share with your team.
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
