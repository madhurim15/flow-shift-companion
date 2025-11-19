import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";

export const HeroSection = () => {
  const navigate = useNavigate();
  
  return (
    <section className="relative overflow-hidden min-h-screen flex items-center px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[hsl(250,60%,92%)] via-[hsl(280,55%,90%)] to-[hsl(340,50%,92%)]">
      <div className="relative max-w-6xl mx-auto text-center w-full py-20">
        {/* Badge - Enhanced */}
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/95 border-2 border-[hsl(270,60%,75%)] mb-8 animate-fade-in-up shadow-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="text-base font-semibold text-gray-800">Gentle Accountability Digital Guardian</span>
        </div>
        
        {/* Main Headline */}
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 leading-[1.1] animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Stop Procrastinating.<br />
          <span className="gradient-text">Start Taking Action.</span>
        </h1>
        
        {/* Subheadline */}
        <p className="text-xl sm:text-2xl text-gray-800 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: "200ms" }}>
          FlowLight detects doomscrolling patterns on your phone and nudges you towards productive micro‑efforts—right when you need them.
        </p>
        
        {/* CTA Buttons - Larger and More Vibrant */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10 animate-fade-in-up" style={{ animationDelay: "300ms" }}>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth')}
            className="h-16 px-12 text-xl font-bold bg-[hsl(270,60%,65%)] hover:bg-[hsl(270,60%,55%)] text-white shadow-[0_8px_30px_hsl(270,60%,65%,0.4)] hover:shadow-[0_12px_40px_hsl(270,60%,65%,0.5)] transition-all duration-300 hover:scale-105"
          >
            Start 14‑Day Free Trial
            <ArrowRight className="w-6 h-6 ml-2" />
          </Button>
        </div>
        
        {/* Trust Indicators */}
        <p className="text-base text-gray-700 font-medium animate-fade-in-up" style={{ animationDelay: "400ms" }}>
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
