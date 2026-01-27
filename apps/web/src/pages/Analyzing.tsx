import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import PulseDot from "@/components/ui/PulseDot";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/refoundlabs/strategy-call";
const SCAN_TIMEOUT_MS = 90000; // 90 seconds

const checkSteps = [
  { id: "bots", label: "Checking AI bot access", duration: 8000 },
  { id: "schema", label: "Analyzing structured data", duration: 15000 },
  { id: "performance", label: "Testing page performance", duration: 25000 },
  { id: "distribution", label: "Discovering product feeds", duration: 20000 },
  { id: "trust", label: "Verifying trust signals", duration: 10000 },
];

const Analyzing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const analysisStartRef = useRef<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!url) {
      navigate("/");
      return;
    }

    analysisStartRef.current = Date.now();
    abortControllerRef.current = new AbortController();

    // Track elapsed time
    const elapsedInterval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - analysisStartRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    // Progress through steps with variable timing to feel more realistic
    let stepIndex = 0;
    const progressStep = () => {
      if (stepIndex < checkSteps.length - 1) {
        stepIndex++;
        setCurrentStep(stepIndex);
        // Schedule next step with variable duration
        const nextDuration = checkSteps[stepIndex]?.duration || 10000;
        // Randomize slightly for more realistic feel
        const variance = nextDuration * 0.3;
        const actualDuration = nextDuration - variance + Math.random() * variance * 2;
        setTimeout(progressStep, Math.min(actualDuration, 15000));
      }
    };
    
    // Start first step progression
    setTimeout(progressStep, checkSteps[0].duration);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      console.log("Scan timeout reached");
      setIsTimeout(true);
      setError("Scan timed out. This site may be blocking automated requests or experiencing issues.");
      abortControllerRef.current?.abort();
    }, SCAN_TIMEOUT_MS);

    // Call the analysis API
    const runAnalysis = async () => {
      try {
        const { data, error: apiError } = await supabase.functions.invoke("analyze", {
          body: { url },
        });

        // Check if we've already timed out
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        console.log("Analysis response:", { data, apiError });

        if (apiError) throw apiError;
        if (data?.error) throw new Error(data.error);

        if (data?.analysisId) {
          clearTimeout(timeoutId);
          navigate(`/results?id=${data.analysisId}`);
        } else {
          console.error("Missing analysisId in response:", data);
          throw new Error("No analysis ID returned");
        }
      } catch (err: any) {
        // Don't override timeout error
        if (!isTimeout && !abortControllerRef.current?.signal.aborted) {
          console.error("Analysis failed:", err);
          setError(err.message || "Analysis failed. Please try again.");
        }
      }
    };

    runAnalysis();

    return () => {
      clearInterval(elapsedInterval);
      clearTimeout(timeoutId);
      abortControllerRef.current?.abort();
    };
  }, [url, navigate, isTimeout]);

  if (!url) {
    return null;
  }

  const handleTryAgain = () => {
    navigate("/");
  };

  const handleRetry = () => {
    // Re-run the analysis with the same URL
    setError("");
    setIsTimeout(false);
    setCurrentStep(0);
    setElapsedTime(0);
    analysisStartRef.current = Date.now();
    // Force a re-mount by navigating to the same page with a cache-busting param
    navigate(`/analyzing?url=${encodeURIComponent(url)}&retry=${Date.now()}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {error ? (
            <div className="text-center space-y-6">
              <div className={`w-16 h-16 mx-auto border ${isTimeout ? 'border-warning' : 'border-destructive'} flex items-center justify-center`}>
                {isTimeout ? (
                  <AlertTriangle className="h-8 w-8 text-warning" />
                ) : (
                  <span className="text-destructive text-2xl font-display">!</span>
                )}
              </div>
              <h1 className="font-display text-2xl text-foreground">
                {isTimeout ? "Scan Timed Out" : "Analysis Failed"}
              </h1>
              <p className="text-muted-foreground font-mono text-sm leading-relaxed">
                {error}
              </p>
              
              {isTimeout && (
                <p className="text-muted-foreground/70 font-mono text-xs">
                  Some sites have aggressive bot protection that blocks automated scans. 
                  We can perform a manual audit for you instead.
                </p>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                <Button
                  onClick={isTimeout ? handleRetry : handleTryAgain}
                  variant="outline"
                  className="inline-flex items-center justify-center px-6 py-3 border border-foreground text-foreground font-medium hover:bg-foreground hover:text-background transition-colors"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  {isTimeout ? "Retry Scan" : "Try Again"}
                </Button>
                
                {isTimeout && (
                  <Button
                    asChild
                    className="inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-foreground font-medium hover:bg-accent/90 transition-colors"
                  >
                    <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                      <Calendar className="mr-2 h-4 w-4" />
                      Book a Manual Audit
                    </a>
                  </Button>
                )}
              </div>

              <button
                onClick={handleTryAgain}
                className="text-muted-foreground hover:text-foreground text-sm font-mono underline-offset-4 hover:underline transition-colors"
              >
                ← Back to Home
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
                {elapsedTime > 0 && (
                  <span className="text-xs font-mono text-muted-foreground/60 ml-auto">
                    {elapsedTime}s
                  </span>
                )}
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

              {/* Timing info */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-mono">
                  This usually takes 60-90 seconds.
                </p>
                {elapsedTime > 60 && (
                  <p className="text-xs text-muted-foreground/70 font-mono">
                    Hang tight — some sites take longer to analyze...
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Analyzing;
