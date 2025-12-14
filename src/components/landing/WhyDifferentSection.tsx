import { Unlock, Heart, Brain, Compass } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-[hsl(160,50%,92%)] to-[hsl(180,45%,90%)]">
      <div className="relative max-w-6xl mx-auto">
        <ScrollReveal>
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 text-gray-900">
              Not Another Productivity App
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto font-medium">
              We understand you. We don't block, shame, or force. We guide.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {differentiators.map((item, index) => {
            const cardColors = [
              'bg-[hsl(270,60%,88%)]',
              'bg-[hsl(340,65%,88%)]',
              'bg-[hsl(210,65%,88%)]',
              'bg-[hsl(50,80%,88%)]'
            ];
            const iconBgColors = [
              'bg-[hsl(270,60%,75%)]',
              'bg-[hsl(340,65%,75%)]',
              'bg-[hsl(210,65%,75%)]',
              'bg-[hsl(50,80%,75%)]'
            ];
            
            return (
              <ScrollReveal key={index} delay={0}>
                <div className={`${cardColors[index]} p-10 rounded-3xl group hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg md:hover:shadow-2xl`}>
                  <div className={`w-20 h-20 mb-6 rounded-2xl ${iconBgColors[index]} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                    <item.icon className="w-10 h-10 text-white animate-gentle-float" style={{ animationDelay: `${index * 0.3}s` }} />
                  </div>
                  <h3 className="text-2xl font-heading font-bold mb-4 text-gray-900">{item.title}</h3>
                  <p className="text-xl text-gray-800 leading-relaxed">{item.description}</p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        <ScrollReveal delay={400}>
          <div className="bg-white/95 p-10 md:p-12 rounded-3xl text-center border-2 border-[hsl(270,60%,75%)] shadow-xl">
            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-gray-800">
              <span className="font-bold text-[hsl(0,70%,55%)]">Other apps:</span> "You failed again. Try harder."<br />
              <span className="font-bold text-[hsl(270,60%,65%)]">FlowFocus:</span> "What's really going on? Let's fix the root cause."
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
