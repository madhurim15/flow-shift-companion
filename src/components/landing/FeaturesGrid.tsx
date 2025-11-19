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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[hsl(270,55%,90%)] to-[hsl(260,60%,88%)]">
      <div className="relative max-w-7xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gray-900">
              Why FlowLight Works
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium">
              Built on procrastination research, not willpower myths
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const featureColors = [
              { bg: 'bg-[hsl(340,65%,88%)]', icon: 'bg-[hsl(340,65%,75%)]' },
              { bg: 'bg-[hsl(210,65%,88%)]', icon: 'bg-[hsl(210,65%,75%)]' },
              { bg: 'bg-[hsl(160,50%,88%)]', icon: 'bg-[hsl(160,50%,75%)]' },
              { bg: 'bg-[hsl(30,70%,88%)]', icon: 'bg-[hsl(30,70%,75%)]' },
              { bg: 'bg-[hsl(260,60%,88%)]', icon: 'bg-[hsl(260,60%,75%)]' },
              { bg: 'bg-[hsl(180,55%,88%)]', icon: 'bg-[hsl(180,55%,75%)]' }
            ];
            
            return (
              <ScrollReveal key={index} delay={0}>
                <div className={`${featureColors[index].bg} p-10 rounded-3xl group hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg md:hover:shadow-2xl`}>
                  <div className={`w-20 h-20 mb-6 rounded-2xl ${featureColors[index].icon} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md`}>
                    <feature.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-gray-900">{feature.title}</h3>
                  <p className="text-xl text-gray-800 leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
