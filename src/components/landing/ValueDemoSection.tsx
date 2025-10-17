import { CheckCircle2 } from "lucide-react";

export const ValueDemoSection = () => {
  const outcomes = [
    "Hours of time reclaimed from mindless scrolling",
    "Reduced anxiety from constant app checking",
    "A streak of productive micro-actions",
    "Better awareness of your procrastination patterns",
    "Momentum toward what actually matters to you"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          What You'll See in 14 Days
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          Real progress you can measure
        </p>
        
        <div className="grid sm:grid-cols-2 gap-6 text-left">
          {outcomes.map((outcome, index) => (
            <div key={index} className="flex items-start gap-3 p-4 rounded-lg bg-card">
              <CheckCircle2 className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
              <p className="text-foreground">{outcome}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
