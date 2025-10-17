import { Heart, Shield, Bell, Clock, BarChart3, Lock } from "lucide-react";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center text-foreground mb-12">
          Built for Real Change
        </h2>
        
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="p-6 bg-card rounded-lg soft-shadow gentle-hover">
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
