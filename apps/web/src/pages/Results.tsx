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
import TimelineGraphic from "@/components/results/TimelineGraphic";
import PriorityFixSpotlight from "@/components/results/PriorityFixSpotlight";
import WhatUnlocksSection from "@/components/results/WhatUnlocksSection";
import MarketContextCard from "@/components/results/MarketContextCard";
import SocialProofBanner from "@/components/results/SocialProofBanner";
import StickyBottomCTA from "@/components/results/StickyBottomCTA";
import { Skeleton } from "@/components/ui/skeleton";

interface AnalysisResult {
  id: string;
  url: string;
  domain: string;
  total_score: number;
  grade: string;
  scoring_model?: string;
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* SECTION 1: THE STAKES (Above the Fold) */}
        <ScoreHeader
          score={analysis.total_score}
          grade={analysis.grade}
          url={analysis.url}
          createdAt={analysis.created_at}
          analysisDuration={analysis.analysis_duration_ms || undefined}
          checksCount={analysis.checks?.length || 8}
          issuesCount={analysis.checks?.filter((c: any) => c.status !== "pass").length || 0}
        />

        {/* Stakes Cards - Revenue at Risk, Industry Comparison, Timeline */}
        <div className="max-w-[1600px] mx-auto px-6 md:px-12 lg:px-20 py-12">
          {/* Social Proof Banner */}
          <SocialProofBanner />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <RevenueAtRiskCard score={analysis.total_score} />
            <div className="p-6 border border-border bg-card">
              <IndustryComparisonBars score={analysis.total_score} />
            </div>
            <div className="md:col-span-2 lg:col-span-1">
              <TimelineGraphic />
            </div>
          </div>

          {/* SECTION 2: THE DIAGNOSIS */}
          <PriorityFixSpotlight recommendations={analysis.recommendations} />

          {analysis.scoring_model === 'v2_3layer' ? (
            <LayerBreakdown
              discovery={{ score: analysis.discovery_score, max: analysis.discovery_max ?? 45 }}
              trust={{ score: analysis.trust_score, max: analysis.trust_max ?? 25 }}
              transaction={{ score: analysis.transaction_score, max: analysis.transaction_max ?? 30 }}
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

          {/* SECTION 3: DETAILED RESULTS */}
          <div className="mt-16 space-y-16" data-section="recommendations">
            <ChecksAccordion checks={analysis.checks} />
            <RecommendationsSection recommendations={analysis.recommendations} />
          </div>

          {/* Manual Verification Checklist (v2 only) */}
          {analysis.scoring_model === 'v2_3layer' && (
            <ManualVerificationChecklist />
          )}

          {/* SECTION 4: THE PATH FORWARD */}
          <div className="mt-16">
            <WhatUnlocksSection />
            <MarketContextCard />
            <EmailCapture analysisId={analysis.id} />
          </div>
        </div>

        <CTASection />

        {/* Sticky Bottom CTA Bar */}
        <StickyBottomCTA score={analysis.total_score} grade={analysis.grade} />
      </main>
      <Footer />
    </div>
  );
};

export default Results;
