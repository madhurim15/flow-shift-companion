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
    "Cancel anytime"
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground text-lg mb-12">
          Try it free for 14 days. No credit card required.
        </p>
        
        <div className="max-w-md mx-auto p-8 bg-card rounded-2xl soft-shadow">
          <div className="mb-6">
            <div className="text-sm text-muted-foreground mb-2">
              14-Day Free Trial
            </div>
            <div className="text-4xl font-bold text-foreground mb-2">
              Then $9.99<span className="text-xl text-muted-foreground">/month</span>
            </div>
            <div className="text-sm text-muted-foreground">
              or $79.99/year (save ~33%)
            </div>
          </div>
          
          <ul className="space-y-3 mb-8 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <Check className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-foreground">{feature}</span>
              </li>
            ))}
          </ul>
          
          <Button 
            size="lg" 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => navigate('/auth')}
          >
            Start 14-Day Free Trial
          </Button>
        </div>
      </div>
    </section>
  );
};
