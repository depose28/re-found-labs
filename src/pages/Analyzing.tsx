import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";

const checkSteps = [
  { id: "bots", label: "Checking AI bot access..." },
  { id: "schema", label: "Analyzing structured data..." },
  { id: "performance", label: "Testing page performance..." },
  { id: "trust", label: "Verifying trust signals..." },
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

        if (error) throw error;

        if (data?.analysisId) {
          navigate(`/results?id=${data.analysisId}`);
        } else {
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
        <div className="max-w-md w-full text-center">
          {error ? (
            <div className="space-y-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-destructive/10 flex items-center justify-center">
                <span className="text-destructive text-2xl">!</span>
              </div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                Analysis Failed
              </h1>
              <p className="text-muted-foreground">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Spinner */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-secondary"></div>
                <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 text-accent animate-spin" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h1 className="font-display text-2xl font-bold text-foreground mb-2">
                  Analyzing your store for AI agent readiness...
                </h1>
                <p className="text-muted-foreground text-sm truncate max-w-xs mx-auto">
                  {url}
                </p>
              </div>

              {/* Checklist */}
              <div className="space-y-3 text-left">
                {checkSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      index < currentStep
                        ? "bg-success/10"
                        : index === currentStep
                        ? "bg-accent/10"
                        : "bg-secondary/50"
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckCircle2 className="h-5 w-5 text-success flex-shrink-0" />
                    ) : index === currentStep ? (
                      <Loader2 className="h-5 w-5 text-accent animate-spin flex-shrink-0" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    )}
                    <span
                      className={`text-sm ${
                        index <= currentStep
                          ? "text-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Subtle text */}
              <p className="text-xs text-muted-foreground">
                This usually takes 30-60 seconds. Please don't close this page.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyzing;
