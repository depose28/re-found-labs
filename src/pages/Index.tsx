import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AgencyHeroSection from "@/components/landing/AgencyHeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import AgentPulseSection from "@/components/landing/AgentPulseSection";
import HowItWorksSection from "@/components/landing/HowItWorksSection";
import WhatWeCheckSection from "@/components/landing/WhatWeCheckSection";
import ServicesOverviewSection from "@/components/landing/ServicesOverviewSection";
import WhoWeWorkWithSection from "@/components/landing/WhoWeWorkWithSection";
import SocialProofSection from "@/components/landing/SocialProofSection";
import CTASection from "@/components/landing/CTASection";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <AgencyHeroSection />
        <ProblemSection />
        <AgentPulseSection />
        <HowItWorksSection />
        <WhatWeCheckSection />
        <ServicesOverviewSection />
        <WhoWeWorkWithSection />
        <SocialProofSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
