import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle2, Circle, Loader2, Calendar, AlertTriangle, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import PulseDot from "@/components/ui/PulseDot";
import { Button } from "@/components/ui/button";
import { endpoints, POLL_INTERVAL_MS, MAX_POLL_TIME_MS } from "@/config/api";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "https://calendly.com/refoundlabs/strategy-call";

// Check steps mapped to API progress
const checkSteps = [
  { id: "bots", label: "Checking AI bot access", step: 1 },
  { id: "schema", label: "Analyzing structured data", step: 2 },
  { id: "performance", label: "Testing page performance", step: 3 },
  { id: "distribution", label: "Discovering product feeds", step: 4 },
  { id: "trust", label: "Verifying trust signals", step: 5 },
];

interface JobProgress {
  step: number;
  totalSteps: number;
  currentCheck: string;
  completedChecks?: string[];
}

interface JobResponse {
  status: 'pending' | 'scraping' | 'analyzing' | 'scoring' | 'completed' | 'failed';
  progress: JobProgress;
  analysisId: string | null;
  error: string | null;
  summary?: {
    score: number;
    grade: string;
    checksCount: number;
    issuesCount: number;
  };
}

interface AnalyzeResponse {
  success: boolean;
  jobId?: string;
  error?: string;
}

const Analyzing = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const url = searchParams.get("url");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState("");
  const [isTimeout, setIsTimeout] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentCheckLabel, setCurrentCheckLabel] = useState("");
  const analysisStartRef = useRef<number>(Date.now());
  const abortControllerRef = useRef<AbortController | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    abortControllerRef.current?.abort();
  }, []);

  // Poll for job status
  const pollJobStatus = useCallback(async (jobId: string): Promise<JobResponse | null> => {
    try {
      const response = await fetch(endpoints.jobs(jobId), {
        signal: abortControllerRef.current?.signal,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch job status: ${response.status}`);
      }

      return await response.json();
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null;
      }
      throw err;
    }
  }, []);

  // Start analysis
  const startAnalysis = useCallback(async (): Promise<string> => {
    const response = await fetch(endpoints.analyze, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
      signal: abortControllerRef.current?.signal,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data: AnalyzeResponse = await response.json();

    if (!data.success || !data.jobId) {
      throw new Error(data.error || 'Failed to start analysis');
    }

    return data.jobId;
  }, [url]);

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

      // Check for timeout
      if (Date.now() - analysisStartRef.current > MAX_POLL_TIME_MS) {
        setIsTimeout(true);
        setError("Analysis timed out. This site may be blocking automated requests or experiencing issues.");
        cleanup();
      }
    }, 1000);

    // Run the analysis
    const runAnalysis = async () => {
      try {
        // Start the analysis job
        console.log("Starting analysis for:", url);
        const jobId = await startAnalysis();
        console.log("Job created:", jobId);

        // Poll for job status
        const poll = async () => {
          try {
            const job = await pollJobStatus(jobId);

            if (!job) {
              // Aborted
              return;
            }

            console.log("Job status:", job.status, job.progress);

            // Update progress UI
            if (job.progress) {
              const stepIndex = Math.min(job.progress.step, checkSteps.length) - 1;
              setCurrentStep(Math.max(0, stepIndex));
              setCurrentCheckLabel(job.progress.currentCheck || "");
            }

            // Check for completion or failure
            if (job.status === 'completed' && job.analysisId) {
              console.log("Analysis completed:", job.analysisId);
              cleanup();
              clearInterval(elapsedInterval);
              navigate(`/results?id=${job.analysisId}`);
              return;
            }

            if (job.status === 'failed') {
              throw new Error(job.error || 'Analysis failed');
            }

            // Continue polling if still in progress (any non-terminal status)
            if (job.status !== 'completed' && job.status !== 'failed') {
              pollIntervalRef.current = setTimeout(poll, POLL_INTERVAL_MS);
            }
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              console.error("Polling error:", err);
              clearInterval(elapsedInterval);
              cleanup();
              setError(err.message || "Analysis failed. Please try again.");
            }
          }
        };

        // Start polling
        poll();
      } catch (err: any) {
        if (err.name !== 'AbortError' && !abortControllerRef.current?.signal.aborted) {
          console.error("Analysis failed:", err);
          clearInterval(elapsedInterval);
          cleanup();
          setError(err.message || "Analysis failed. Please try again.");
        }
      }
    };

    runAnalysis();

    return () => {
      clearInterval(elapsedInterval);
      cleanup();
    };
  }, [url, navigate, startAnalysis, pollJobStatus, cleanup]);

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
    setCurrentCheckLabel("");
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

              {/* Current check info */}
              {currentCheckLabel && (
                <p className="text-xs text-muted-foreground/70 font-mono">
                  {currentCheckLabel}
                </p>
              )}

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
