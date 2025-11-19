import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-[hsl(270,60%,75%)] via-[hsl(240,65%,75%)] to-[hsl(180,55%,70%)]">
      {/* Floating decorative elements - Hidden on mobile */}
      <div className="hidden md:block absolute top-20 left-10 w-64 h-64 bg-white/20 rounded-full blur-3xl animate-gentle-float"></div>
      <div className="hidden md:block absolute bottom-20 right-10 w-80 h-80 bg-white/15 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: "1.5s" }}></div>
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-soft-pulse"></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-5xl md:text-7xl font-heading font-bold mb-8 text-white drop-shadow-lg">
            Ready to Break the Loop?
          </h2>
          <p className="text-2xl md:text-3xl text-white/95 mb-14 max-w-2xl mx-auto leading-relaxed font-medium drop-shadow-md">
            14 days free. No credit card required. Start understanding your phone habits today.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="h-20 px-16 text-2xl font-bold bg-white text-[hsl(270,60%,65%)] hover:bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-110 mb-10"
          >
            Start Free Trial
            <ArrowRight className="ml-3 w-7 h-7" />
          </Button>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-wrap justify-center gap-10 text-lg text-white/90">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-medium">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="font-medium">Full access for 14 days</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
