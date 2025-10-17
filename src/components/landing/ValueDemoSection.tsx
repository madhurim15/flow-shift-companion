import { CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export const ValueDemoSection = () => {
  const outcomes = [
    "Hours of time reclaimed from mindless scrolling",
    "Reduced anxiety from constant app checking",
    "A streak of productive micro-actions",
    "Better awareness of your procrastination patterns",
    "Momentum toward what actually matters to you"
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      
      <div className="relative max-w-5xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
              What You'll See in <span className="gradient-text">14 Days</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              Real progress you can measure
            </p>

            {/* Stats Preview */}
            <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
              <div className="p-6 rounded-2xl glass-card">
                <div className="text-4xl font-bold gradient-text mb-2">
                  <AnimatedCounter end={15} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Hours Saved</div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="text-4xl font-bold gradient-text mb-2">
                  <AnimatedCounter end={47} suffix="%" />
                </div>
                <div className="text-sm text-muted-foreground">Less Scrolling</div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="text-4xl font-bold gradient-text mb-2">
                  <AnimatedCounter end={89} suffix="+" />
                </div>
                <div className="text-sm text-muted-foreground">Actions Taken</div>
              </div>
            </div>
          </div>
        </ScrollReveal>
        
        <div className="grid sm:grid-cols-2 gap-6">
          {outcomes.map((outcome, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <div className="flex items-start gap-4 p-6 rounded-2xl glass-card lift-hover">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                </div>
                <p className="text-foreground text-lg leading-relaxed">{outcome}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
