import { Eye, Lightbulb, Zap, TrendingUp } from "lucide-react";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
          How It Works
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <step.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {step.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
