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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[hsl(50,80%,90%)] to-[hsl(30,70%,88%)]">
      <div className="relative max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gray-900">
              What You'll See in 14 Days
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium mb-12">
              Real results from understanding your patterns
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <ScrollReveal delay={0}>
            <div className="bg-[hsl(340,65%,88%)] p-10 rounded-3xl text-center shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl font-bold text-[hsl(340,65%,55%)] mb-3">
                <AnimatedCounter end={4} duration={2000} suffix="+" />
              </div>
              <p className="text-xl text-gray-800 font-medium">Hours Saved Weekly</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0}>
            <div className="bg-[hsl(210,65%,88%)] p-10 rounded-3xl text-center shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl font-bold text-[hsl(210,65%,55%)] mb-3">
                <AnimatedCounter end={60} duration={2000} suffix="%" />
              </div>
              <p className="text-xl text-gray-800 font-medium">Less Scrolling</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0}>
            <div className="bg-[hsl(160,50%,88%)] p-10 rounded-3xl text-center shadow-lg hover:scale-105 hover:-translate-y-2 transition-all duration-300">
              <div className="text-6xl font-bold text-[hsl(160,50%,45%)] mb-3">
                <AnimatedCounter end={12} duration={2000} suffix="+" />
              </div>
              <p className="text-xl text-gray-800 font-medium">Actions Taken Daily</p>
            </div>
          </ScrollReveal>
        </div>
        
        <ScrollReveal delay={400}>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {outcomes.map((outcome, index) => (
              <div key={index} className="flex items-start gap-4 bg-white/95 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="w-10 h-10 rounded-full bg-[hsl(140,50%,75%)] flex items-center justify-center flex-shrink-0 mt-1 animate-scale-pulse" style={{ animationDelay: `${index * 150}ms` }}>
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <p className="text-xl text-gray-800 font-medium">{outcome}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
