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
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-muted/30 to-background">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.08),transparent_50%)]"></div>
      
      <div className="relative max-w-5xl mx-auto text-center">
        <ScrollReveal>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-16">
            You're Not Scrolling.<br />You're <span className="gradient-text">Avoiding</span>.
          </h2>
        </ScrollReveal>
        
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {problems.map((problem, index) => (
            <ScrollReveal key={index} delay={index * 100}>
              <div className="group p-8 bg-card rounded-2xl glass-shadow lift-hover">
                <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <problem.icon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-lg text-foreground leading-relaxed">{problem.text}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
        
        <ScrollReveal delay={300}>
          <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            It's not laziness. It's a psychological loop. <span className="font-semibold gradient-text">FlowLight helps you break it.</span>
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
};
