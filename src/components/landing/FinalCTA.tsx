import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 accent-gradient opacity-20 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}></div>
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      
      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-gentle-float"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-accent/30 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: "1.5s" }}></div>
      
      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-bounce-subtle">
          <Sparkles className="w-4 h-4" />
          <span>Your Journey Starts Here</span>
        </div>
        
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
          Ready to Break <span className="gradient-text">the Loop?</span>
        </h2>
        
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
          Start your 14-day free trial and see how much time you reclaim when procrastination patterns become productive actions.
        </p>
        
        <Button 
          size="lg" 
          className="h-16 px-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground scale-hover group shadow-2xl"
          onClick={() => navigate('/auth')}
        >
          Start Free Trial
          <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
        
        <p className="text-base text-muted-foreground mt-8 flex flex-wrap items-center justify-center gap-4">
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-soft-pulse"></span>
            No credit card required
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-soft-pulse"></span>
            Privacy-first
          </span>
          <span className="hidden sm:inline">•</span>
          <span className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-soft-pulse"></span>
            Cancel anytime
          </span>
        </p>
      </div>
    </section>
  );
};
