import { Clock, Smartphone, Brain } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export const ProblemSection = () => {
  const problems = [
    {
      icon: Clock,
      text: "Hours disappear to endless feeds"
    },
    {
      icon: Smartphone,
      text: "You check your phone more than you think"
    },
    {
      icon: Brain,
      text: "You know what matters—yet open your phone anyway"
    }
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[hsl(20,70%,92%)] to-[hsl(10,60%,90%)]">
      <div className="relative max-w-5xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-5xl md:text-6xl font-heading font-bold text-center mb-20 text-gray-900">
            You're Not Scrolling. You're Avoiding.
          </h2>
        </ScrollReveal>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((problem, index) => {
            const cardColors = [
              'bg-[hsl(340,65%,88%)]',
              'bg-[hsl(210,65%,88%)]',
              'bg-[hsl(160,50%,88%)]'
            ];
            const iconBgColors = [
              'bg-[hsl(340,65%,75%)]',
              'bg-[hsl(210,65%,75%)]',
              'bg-[hsl(160,50%,75%)]'
            ];
            
            return (
              <ScrollReveal key={index} delay={0}>
                <div className={`${cardColors[index]} p-10 rounded-3xl text-center group hover:scale-105 hover:-translate-y-2 transition-all duration-300 shadow-lg md:hover:shadow-2xl`}>
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl ${iconBgColors[index]} flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                    <problem.icon className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-xl text-gray-800 leading-relaxed font-medium">
                    {problem.text}
                  </p>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
        
        <ScrollReveal delay={300}>
          <p className="text-xl text-center text-gray-800 max-w-3xl mx-auto leading-relaxed font-medium">
            FlowLight breaks this loop—not by forcing you to stop, but by helping you understand why you reach for your phone in the first place.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
