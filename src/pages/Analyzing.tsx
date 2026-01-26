import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import PulseDot from "@/components/ui/PulseDot";
import { supabase } from "@/integrations/supabase/client";

const checkSteps = [
  { id: "bots", label: "Checking AI bot access" },
  { id: "schema", label: "Analyzing structured data" },
  { id: "performance", label: "Testing page performance" },
  { id: "trust", label: "Verifying trust signals" },
];

const Analyzing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!url) {
      navigate("/");
      return;
    }

    // Simulate progress while analysis runs
    const progressInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < checkSteps.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2000);

    // Call the analysis API
    const runAnalysis = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("analyze", {
          body: { url },
        });

        console.log("Analysis response:", { data, error });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (data?.analysisId) {
          navigate(`/results?id=${data.analysisId}`);
        } else {
          console.error("Missing analysisId in response:", data);
          throw new Error("No analysis ID returned");
        }
      } catch (err: any) {
        console.error("Analysis failed:", err);
        setError(err.message || "Analysis failed. Please try again.");
        clearInterval(progressInterval);
      }
    };

    runAnalysis();

    return () => clearInterval(progressInterval);
  }, [url, navigate]);

  if (!url) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {error ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 mx-auto border border-destructive flex items-center justify-center">
                <span className="text-destructive text-2xl font-display">!</span>
              </div>
              <h1 className="font-display text-2xl text-foreground">
                Analysis Failed
              </h1>
              <p className="text-muted-foreground font-mono text-sm">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center px-6 py-3 border border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Header */}
              <div className="flex items-center gap-3">
                <PulseDot size="md" />
                <span className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
                  Analyzing
                </span>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-display text-3xl md:text-4xl text-foreground mb-4">
                  Scanning for AI readiness
                </h1>
                <p className="text-muted-foreground font-mono text-sm truncate">
                  {url}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-0 border-t border-border">
                {checkSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-4 py-4 border-b border-border transition-all duration-300`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    ) : index === currentStep ? (
                      <div className="relative">
                        <PulseDot size="sm" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-border flex-shrink-0" />
                    )}
                    <span
                      className={`font-mono text-sm ${
                        index <= currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                    {index === currentStep && (
                      <Loader2 className="h-4 w-4 text-accent animate-spin ml-auto" />
                    )}
                  </div>
                ))}
              </div>

              {/* Subtle text */}
              <p className="text-xs text-muted-foreground font-mono">
                This usually takes 30-60 seconds.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyzing;
