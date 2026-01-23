import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreHeader from "@/components/results/ScoreHeader";
import CategoryBreakdown from "@/components/results/CategoryBreakdown";
import ChecksAccordion from "@/components/results/ChecksAccordion";
import RecommendationsSection from "@/components/results/RecommendationsSection";
import EmailCapture from "@/components/results/EmailCapture";
import CTASection from "@/components/results/CTASection";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisResult {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  discovery_score: number;
  discovery_max: number | null;
  performance_score: number;
  performance_max: number | null;
  transaction_score: number;
  transaction_max: number | null;
  trust_score: number;
  trust_max: number | null;
  checks: any;
  recommendations: any;
  created_at: string;
  analysis_duration_ms: number | null;
}

const Results = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const analysisId = searchParams.get("id");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!analysisId) {
      navigate("/");
      return;
    }

    const fetchAnalysis = async () => {
      try {
        const { data, error } = await supabase
          .from("analyses")
          .select("*")
          .eq("id", analysisId)
          .single();

        if (error) throw error;
        setAnalysis(data);
      } catch (err: any) {
        console.error("Failed to fetch analysis:", err);
        setError("Could not load analysis results.");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [analysisId, navigate]);

  if (!analysisId) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-32 pb-16">
          <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20">
            <div className="space-y-8">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <div className="text-center space-y-6">
            <h1 className="font-display text-2xl font-bold text-foreground">
              {error || "Analysis not found"}
            </h1>
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background font-medium hover:opacity-90 transition-opacity"
            >
              Run New Analysis
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <ScoreHeader
          score={analysis.total_score}
          grade={analysis.grade}
          url={analysis.url}
          createdAt={analysis.created_at}
          analysisDuration={analysis.analysis_duration_ms || undefined}
          checksCount={analysis.checks?.length || 8}
          issuesCount={analysis.checks?.filter((c: any) => c.status !== "pass").length || 0}
        />

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-16 space-y-16">
          <CategoryBreakdown
            discovery={{ score: analysis.discovery_score, max: analysis.discovery_max ?? 40 }}
            performance={{ score: analysis.performance_score, max: analysis.performance_max ?? 15 }}
            transaction={{ score: analysis.transaction_score, max: analysis.transaction_max ?? 20 }}
            trust={{ score: analysis.trust_score, max: analysis.trust_max ?? 25 }}
          />

          <ChecksAccordion checks={analysis.checks} />

          <RecommendationsSection recommendations={analysis.recommendations} />

          <EmailCapture analysisId={analysis.id} />

          <CTASection />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Results;
