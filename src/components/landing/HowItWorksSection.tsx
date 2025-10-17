import { Eye, Lightbulb, Zap, TrendingUp } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const HowItWorksSection = () => {
  const steps = [
    {
      icon: Eye,
      title: "Detects Triggers",
      description: "System-wide monitoring across your apps"
    },
    {
      icon: Lightbulb,
      title: "Psychology-Based Nudges",
      description: "References your patterns without judgment"
    },
    {
      icon: Zap,
      title: "Instant Micro-Actions",
      description: "Journal, breathe, stretch, walk, reflect"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Patterns, streaks, and time saved"
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-foreground mb-20">
            How It <span className="gradient-text">Works</span>
          </h2>
        </ScrollReveal>
        
        {/* Timeline Layout */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/40 to-gradient-teal/20 -translate-y-1/2"></div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {steps.map((step, index) => (
              <ScrollReveal key={index} delay={index * 100}>
                <div className="relative text-center group">
                  {/* Step Number */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm border-2 border-primary/20">
                    {index + 1}
                  </div>
                  
                  {/* Icon Container */}
                  <div className="relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <step.icon className="w-10 h-10 text-primary" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
