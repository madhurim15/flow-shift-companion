import { LandingHeader } from "@/components/landing/LandingHeader";
import { HeroSection } from "@/components/landing/HeroSection";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { WhyDifferentSection } from "@/components/landing/WhyDifferentSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { FeaturesGrid } from "@/components/landing/FeaturesGrid";
import { ValueDemoSection } from "@/components/landing/ValueDemoSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { FinalCTA } from "@/components/landing/FinalCTA";

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <HeroSection />
      <ProblemSection />
      <WhyDifferentSection />
      <HowItWorksSection />
      <FeaturesGrid />
      <ValueDemoSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
    </div>
  );
};

export default Landing;
