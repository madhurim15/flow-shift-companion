
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';

type WelcomeScreenProps = {
  onStart: () => void;
};

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  return (
    <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="animate-gentle-float">
              <Sparkles className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">
              Flowlight
            </h1>
            <p className="text-muted-foreground">
              Your gentle companion for moving from stuck to flowing
            </p>
          </div>

          <div className="space-y-4 text-left text-sm text-muted-foreground">
            <p>
              Hey there. I'm here to help you take tiny steps when everything feels impossible.
            </p>
            <p>
              No judgment, no pressure—just gentle nudges in the right direction. 
              Because sometimes the smallest movement creates the biggest shift.
            </p>
            <p className="text-center text-primary font-medium">
              Ready to check in with yourself?
            </p>
          </div>

          <Button 
            onClick={onStart}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
            size="lg"
          >
            Let's start flowing ✨
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;
