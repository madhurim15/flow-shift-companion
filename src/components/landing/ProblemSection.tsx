import { Clock, Smartphone, Brain } from "lucide-react";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
          You're Not Scrolling. You're Avoiding.
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {problems.map((problem, index) => (
            <div key={index} className="p-6 bg-card rounded-lg soft-shadow">
              <problem.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-foreground">{problem.text}</p>
            </div>
          ))}
        </div>
        
        <p className="text-lg text-muted-foreground">
          It's not laziness. It's a psychological loop. <span className="font-semibold text-foreground">FlowLight helps you break it.</span>
        </p>
      </div>
    </section>
  );
};
