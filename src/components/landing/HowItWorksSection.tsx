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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[hsl(200,60%,92%)] via-[hsl(220,55%,90%)] to-[hsl(250,60%,92%)]">
      <div className="max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-center mb-20 text-gray-900">
            How It Works
          </h2>
        </ScrollReveal>
        
        {/* Timeline Layout */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/20 via-accent/40 to-gradient-teal/20 -translate-y-1/2"></div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => {
              const stepColors = [
                { bg: 'bg-[hsl(270,60%,88%)]', icon: 'bg-[hsl(270,60%,75%)]' },
                { bg: 'bg-[hsl(210,65%,88%)]', icon: 'bg-[hsl(210,65%,75%)]' },
                { bg: 'bg-[hsl(180,55%,88%)]', icon: 'bg-[hsl(180,55%,75%)]' },
                { bg: 'bg-[hsl(340,65%,88%)]', icon: 'bg-[hsl(340,65%,75%)]' }
              ];
              
              return (
                <ScrollReveal key={index} delay={0}>
                  <div className={`relative flex flex-col items-center text-center group ${stepColors[index].bg} p-8 rounded-3xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg md:hover:shadow-2xl`}>
                    {/* Step number and icon */}
                    <div className="relative mb-6">
                      <div className={`w-24 h-24 rounded-full ${stepColors[index].icon} flex items-center justify-center text-3xl font-bold text-white group-hover:scale-110 transition-all duration-300 shadow-lg animate-gentle-float`} style={{ animationDelay: `${index * 0.5}s` }}>
                        {index + 1}
                      </div>
                      <div className={`absolute -bottom-2 -right-2 w-16 h-16 rounded-xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                        <step.icon className="w-8 h-8 text-gray-700" />
                      </div>
                    </div>

                    <h3 className="text-2xl font-heading font-bold mb-4 text-gray-900">{step.title}</h3>
                    <p className="text-xl text-gray-800 leading-relaxed max-w-sm">
                      {step.description}
                    </p>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
