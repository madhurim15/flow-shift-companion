import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const FinalCTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-primary/10 via-flow-gentle/20 to-primary/10">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ready to Break the Loop?
        </h2>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Start your 14-day free trial and see how much time you reclaim when procrastination patterns become productive actions.
        </p>
        
        <Button 
          size="lg" 
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8"
          onClick={() => navigate('/auth')}
        >
          Start Free Trial
        </Button>
        
        <p className="text-sm text-muted-foreground mt-6">
          No credit card required • Privacy-first • Cancel anytime
        </p>
      </div>
    </section>
  );
};
