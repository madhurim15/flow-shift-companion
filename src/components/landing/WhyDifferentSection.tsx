import { Unlock, Heart, Brain, Compass } from "lucide-react";

export const WhyDifferentSection = () => {
  const differentiators = [
    {
      icon: Unlock,
      title: "No Strict Blocking",
      description: "Unlike traditional blockers, we don't force you to stop. We help you understand why you're reaching for your phone and offer gentle alternatives."
    },
    {
      icon: Heart,
      title: "Zero Guilt-Tripping",
      description: "No shame counters, no red warnings, no 'you failed again' messages. Just supportive nudges that respect your autonomy."
    },
    {
      icon: Brain,
      title: "Psychology-First Approach",
      description: "Built on procrastination research, not punishment. We address the root cause: avoidance behavior, not the symptom."
    },
    {
      icon: Compass,
      title: "Understands Your Context",
      description: "Adapts to your mood, energy, time of day, and patterns. What works at 9am doesn't work at 9pm—and we get that."
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent"></div>
      
      <div className="relative max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16 animate-fade-in-up">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Not Another <span className="gradient-text">Productivity App</span>
          </h2>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            We understand you. We don't block, shame, or force. We guide.
          </p>
        </div>

        {/* Differentiators Grid */}
        <div className="grid sm:grid-cols-2 gap-8 mb-12">
          {differentiators.map((item, index) => (
            <div
              key={index}
              className="group relative p-8 rounded-2xl glass-card lift-hover"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-gradient-teal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
              
              {/* Icon */}
              <div className="w-16 h-16 mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <item.icon className="w-8 h-8 text-primary" />
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Comparison Callout */}
        <div className="max-w-3xl mx-auto text-center p-8 rounded-2xl bg-gradient-to-r from-primary/10 via-accent/10 to-gradient-teal/10 border border-primary/20">
          <p className="text-lg text-foreground">
            <span className="font-semibold">Other apps</span> focus on restriction. <span className="font-semibold gradient-text">FlowLight</span> focuses on understanding and transformation.
          </p>
        </div>
      </div>
    </section>
  );
};
