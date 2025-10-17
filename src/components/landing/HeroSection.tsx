import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
export const HeroSection = () => {
  const navigate = useNavigate();
  return <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 flow-gradient opacity-30"></div>
      <div className="relative max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in-up">
          <Sparkles className="w-4 h-4" />
          <span>Gentle Accountability Digital Guardian</span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
          Stop Procrastinating.<br />Start Taking Action.
        </h1>
        
        <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">FlowLight detects doomscrolling patterns and nudges you towards productive micro‑efforts—right when you need them.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <Button size="lg" onClick={() => navigate('/auth')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8">
            Start 14‑Day Free Trial
          </Button>
        </div>
        
        <p className="text-sm text-muted-foreground">
          Private • Fast setup • Android
        </p>
      </div>
    </section>;
};