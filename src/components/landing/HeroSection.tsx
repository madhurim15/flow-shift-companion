import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center px-4 sm:px-6 lg:px-8">
      {/* Animated Mesh Gradient Background */}
      <div className="absolute inset-0 mesh-gradient opacity-60 animate-gradient-shift" style={{ backgroundSize: "200% 200%" }}></div>
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background"></div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-gentle-float"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl animate-gentle-float" style={{ animationDelay: "1s" }}></div>
      
      <div className="relative max-w-6xl mx-auto text-center w-full py-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass border border-primary/30 text-primary text-sm font-semibold mb-8 animate-fade-in-up shadow-lg">
          <Sparkles className="w-4 h-4 animate-soft-pulse" />
          <span>Gentle Accountability Digital Guardian</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Stop Procrastinating.<br />
          <span className="gradient-text">Start Taking Action.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          FlowLight detects doomscrolling patterns on your phone and nudges you towards productive micro‑efforts—right when you need them.
        </p>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')} 
            className="h-14 px-10 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground scale-hover group"
          >
            Start 14‑Day Free Trial
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <p className="text-sm text-muted-foreground animate-fade-in-up" style={{ animationDelay: "400ms" }}>
          <span className="inline-flex items-center gap-6">
            <span>🔒 Private</span>
            <span>⚡ Fast setup</span>
            <span>📱 Android</span>
          </span>
        </p>
      </div>
    </section>
  );
};
