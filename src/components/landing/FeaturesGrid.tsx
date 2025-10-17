import { Heart, Shield, Bell, Clock, BarChart3, Lock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const FeaturesGrid = () => {
  const features = [
    {
      icon: Heart,
      title: "Mood & Energy-Based Actions",
      description: "Get suggestions that match how you're actually feeling"
    },
    {
      icon: Shield,
      title: "System-Wide Monitoring",
      description: "Works across social media, video platforms, shopping apps"
    },
    {
      icon: Bell,
      title: "Smart Trigger Detection",
      description: "Notices patterns before you get too deep"
    },
    {
      icon: Clock,
      title: "Time-Context Intelligence",
      description: "Different nudges for morning, afternoon, evening"
    },
    {
      icon: BarChart3,
      title: "Progressive Accountability",
      description: "Gentle reminders that become more structured over time"
    },
    {
      icon: Lock,
      title: "Privacy-First",
      description: "Your data stays with you—we never sell it"
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)] opacity-20"></div>
      
      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-center text-foreground mb-6">
            Built for <span className="gradient-text">Real Change</span>
          </h2>
          <p className="text-xl text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
            Everything you need to transform procrastination into productive action
          </p>
        </ScrollReveal>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <div className="group relative p-8 bg-card rounded-2xl glass-card lift-hover h-full">
                {/* Gradient Border on Hover */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                
                {/* Icon */}
                <div className="w-14 h-14 mb-6 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};
