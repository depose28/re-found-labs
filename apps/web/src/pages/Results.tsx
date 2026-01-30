import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { endpoints } from "@/config/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScoreHeader from "@/components/results/ScoreHeader";
import CategoryBreakdown from "@/components/results/CategoryBreakdown";
import LayerBreakdown from "@/components/results/LayerBreakdown";
import ChecksAccordion from "@/components/results/ChecksAccordion";
import ManualVerificationChecklist from "@/components/results/ManualVerificationChecklist";
import RecommendationsSection from "@/components/results/RecommendationsSection";
import EmailCapture from "@/components/results/EmailCapture";
import CTASection from "@/components/results/CTASection";
import RevenueAtRiskCard from "@/components/results/RevenueAtRiskCard";
import IndustryComparisonBars from "@/components/results/IndustryComparisonBars";
import WhatUnlocksSection from "@/components/results/WhatUnlocksSection";
import StickyBottomCTA from "@/components/results/StickyBottomCTA";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisResult {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  scoring_model?: string; // Not in DB yet — detect v2 via performance_max === 0
  discovery_score: number;
  discovery_max: number | null;
  performance_score: number;
  performance_max: number | null;
  transaction_score: number;
  transaction_max: number | null;
  distribution_score: number;
  distribution_max: number | null;
  trust_score: number;
  trust_max: number | null;
  platform_detected: string | null;
  platform_name: string | null;
  feeds_found: any;
  protocol_compatibility: any;
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
        const response = await fetch(endpoints.analysis(analysisId));

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Analysis not found");
          }
          throw new Error(`Failed to fetch analysis: ${response.status}`);
        }

        const data = await response.json();
        setAnalysis(data);
      } catch (err: any) {
        console.error("Failed to fetch analysis:", err);
        setError(err.message || "Could not load analysis results.");
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

  // Normalize raw score to 0-100 for display
  // v2 (3-layer): total_score is raw points out of maxPossible (e.g. 48/67)
  // v1 (5-pillar): total_score was already out of 100
  const isV2 = analysis.scoring_model === 'v2_3layer' || analysis.performance_max === 0;
  const maxPossible = isV2
    ? analysis.checks?.reduce((sum: number, c: any) => sum + c.maxScore, 0) || 67
    : 100;
  const normalizedScore = maxPossible > 0
    ? Math.round((analysis.total_score / maxPossible) * 100)
    : analysis.total_score;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* 1. Score + Badge + Verdict */}
        <ScoreHeader
          score={normalizedScore}
          grade={analysis.grade}
          url={analysis.url}
          createdAt={analysis.created_at}
          analysisDuration={analysis.analysis_duration_ms || undefined}
          checksCount={analysis.checks?.length || 8}
          issuesCount={analysis.checks?.filter((c: any) => c.status !== "pass").length || 0}
        />

        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-12">
          {/* 2. What We Checked (3 section cards) */}
          {(analysis.scoring_model === 'v2_3layer' || analysis.performance_max === 0) ? (
            <LayerBreakdown
              discovery={{ score: analysis.discovery_score, max: analysis.discovery_max ?? 45 }}
              trust={{ score: analysis.trust_score, max: analysis.trust_max ?? 25 }}
              transaction={{ score: analysis.transaction_score, max: analysis.transaction_max ?? 30 }}
              checks={analysis.checks}
            />
          ) : (
            <CategoryBreakdown
              discovery={{ score: analysis.discovery_score, max: analysis.discovery_max ?? 35 }}
              performance={{ score: analysis.performance_score, max: analysis.performance_max ?? 15 }}
              transaction={{ score: analysis.transaction_score, max: analysis.transaction_max ?? 20 }}
              distribution={{ score: analysis.distribution_score, max: analysis.distribution_max ?? 15 }}
              trust={{ score: analysis.trust_score, max: analysis.trust_max ?? 15 }}
            />
          )}

          {/* 3. How You Compare + 4. Revenue at Risk */}
          <div className="grid md:grid-cols-2 gap-6 mt-16">
            <div className="p-6 border border-border bg-card">
              <IndustryComparisonBars score={normalizedScore} />
            </div>
            <RevenueAtRiskCard score={normalizedScore} />
          </div>

          {/* 5. Recommended Fixes + 6. Individual Checks */}
          <div className="mt-16 space-y-16" data-section="recommendations">
            <RecommendationsSection recommendations={analysis.recommendations} />
            <ChecksAccordion checks={analysis.checks} />
          </div>

          {/* 7. Manual Verification Checklist (v2 only) */}
          {(analysis.scoring_model === 'v2_3layer' || analysis.performance_max === 0) && (
            <ManualVerificationChecklist />
          )}

          {/* 8. What 85+ Unlocks */}
          <div className="mt-16">
            <WhatUnlocksSection />
          </div>
        </div>

        {/* 9. Book a Call CTA */}
        <CTASection />

        {/* 10. Email Capture */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 pb-16">
          <EmailCapture analysisId={analysis.id} />
        </div>

        {/* Sticky Bottom CTA Bar */}
        <StickyBottomCTA score={normalizedScore} grade={analysis.grade} />
      </main>
      <Footer />
    </div>
  );
};

export default Results;
