import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-r from-[hsl(270,60%,75%)] via-[hsl(240,65%,75%)] to-[hsl(180,55%,70%)]">
      {/* CSS-only Particle Effect Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white/40 rounded-full top-[10%] left-[5%] animate-particle-float" style={{ '--tx': '30px', '--ty': '-50px', animationDelay: '0s', animationDuration: '8s' } as React.CSSProperties} />
        <div className="absolute w-3 h-3 bg-white/30 rounded-full top-[20%] left-[15%] animate-particle-float" style={{ '--tx': '-40px', '--ty': '-60px', animationDelay: '1s', animationDuration: '10s' } as React.CSSProperties} />
        <div className="absolute w-2 h-2 bg-white/50 rounded-full top-[30%] right-[10%] animate-particle-float" style={{ '--tx': '50px', '--ty': '-70px', animationDelay: '2s', animationDuration: '9s' } as React.CSSProperties} />
        <div className="absolute w-4 h-4 bg-white/20 rounded-full top-[15%] right-[20%] animate-particle-float" style={{ '--tx': '-30px', '--ty': '-40px', animationDelay: '1.5s', animationDuration: '11s' } as React.CSSProperties} />
        <div className="absolute w-2 h-2 bg-white/40 rounded-full bottom-[25%] left-[25%] animate-particle-float" style={{ '--tx': '20px', '--ty': '-55px', animationDelay: '3s', animationDuration: '7s' } as React.CSSProperties} />
        <div className="absolute w-3 h-3 bg-white/35 rounded-full bottom-[35%] right-[15%] animate-particle-float" style={{ '--tx': '-35px', '--ty': '-45px', animationDelay: '2.5s', animationDuration: '9.5s' } as React.CSSProperties} />
        <div className="absolute w-2 h-2 bg-white/45 rounded-full top-[40%] left-[30%] animate-particle-float" style={{ '--tx': '45px', '--ty': '-65px', animationDelay: '1s', animationDuration: '8.5s' } as React.CSSProperties} />
        <div className="absolute w-3 h-3 bg-white/25 rounded-full bottom-[15%] left-[40%] animate-particle-float" style={{ '--tx': '-25px', '--ty': '-50px', animationDelay: '4s', animationDuration: '10.5s' } as React.CSSProperties} />
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center z-10">
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
            className="h-20 px-16 text-2xl font-bold bg-white text-[hsl(270,60%,65%)] hover:bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_50px_rgba(0,0,0,0.4)] transition-all duration-300 hover:scale-110 mb-10 animate-glow-button"
          >
            Start Free Trial
            <ArrowRight className="ml-3 w-7 h-7" />
          </Button>
        </ScrollReveal>

        <ScrollReveal delay={300}>
          <div className="flex flex-wrap justify-center gap-10 text-lg text-white/90">
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Shield className="w-6 h-6" />
              </div>
              <span className="font-medium">No credit card required</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6" />
              </div>
              <span className="font-medium">Cancel anytime</span>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-6 h-6 animate-gentle-float" />
              </div>
              <span className="font-medium">Full access for 14 days</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
