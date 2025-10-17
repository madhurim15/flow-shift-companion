import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Check } from "lucide-react";

export const PricingSection = () => {
  const navigate = useNavigate();

  const features = [
    "Unlimited psychology-based nudges",
    "Full insights dashboard",
    "All mood & energy-based actions",
    "System-wide monitoring",
    "Privacy-first design"
  ];

  return (
    <section className="relative py-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Spotlight Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-soft-pulse"></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 animate-fade-in-up">
          Start Your <span className="gradient-text">Free Trial</span>
        </h2>
        <p className="text-muted-foreground text-xl mb-16 max-w-2xl mx-auto leading-relaxed animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Experience the full app free for 14 days. No credit card required.
        </p>
        
        <div className="max-w-md mx-auto p-10 rounded-3xl glass-card glow-shadow animate-scale-in" style={{ animationDelay: "200ms" }}>
          {/* Free Trial Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6">
            <Check className="w-4 h-4" />
            <span>14-Day Free Trial</span>
          </div>

          <div className="mb-8">
            <div className="text-5xl font-bold text-foreground mb-4">
              Free for 14 days
            </div>
            <div className="text-lg text-muted-foreground px-6 py-3 rounded-xl bg-muted/50">
              Stay tuned for subscription options
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              We're finalizing the best pricing for our users
            </p>
          </div>
          
          <ul className="space-y-4 mb-10 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-3 group">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="text-foreground text-lg">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            size="lg" 
            className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground scale-hover"
            onClick={() => navigate('/auth')}
          >
            Start Your Free Trial
          </Button>
          
          <p className="text-sm text-muted-foreground mt-6">
            No commitment • Privacy-first • Full access
          </p>
        </div>
      </div>
    </section>
  );
};
