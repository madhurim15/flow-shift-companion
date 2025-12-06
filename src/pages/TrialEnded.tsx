import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTrialContext } from '@/contexts/TrialContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, MessageSquare, Sparkles } from 'lucide-react';
import BetaTesterBadge from '@/components/BetaTesterBadge';

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdId9R5dugT1pETsTxADCTS2tPjkJyPFa24o-0pG3VLGw9ydQ/viewform?usp=dialog';

const TrialEnded = () => {
  const { user } = useAuth();
  const { trialEnded, trialStartDate } = useTrialContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
    // Allow access even if trial not ended (for beta testers)
  }, [user, navigate]);

  if (!user) return null;

  const daysSinceStart = trialStartDate 
    ? Math.floor((new Date().getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div 
      className="min-h-screen bg-background flex items-center justify-center p-4"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)'
      }}
    >
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Heart className="h-8 w-8 text-primary" />
          </div>
        </div>

        <div className="space-y-3">
          <BetaTesterBadge size="md" />
          <h1 className="text-2xl font-bold text-foreground">
            Thanks for being a beta tester! 🙏
          </h1>
          <p className="text-muted-foreground">
            You've been using FlowFocus for {daysSinceStart} days.
          </p>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            <span>Your journey so far</span>
          </div>
          <p className="text-sm text-foreground">
            We're still building FlowFocus and your feedback is invaluable. 
            As a thank you, you have continued access during our beta period.
          </p>
        </div>

        <div className="space-y-3 pt-4">
          <Button 
            onClick={() => window.open(FEEDBACK_FORM_URL, '_blank')}
            className="w-full"
            variant="default"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Share Your Feedback
          </Button>
          
          <Button 
            onClick={() => navigate('/')}
            variant="outline"
            className="w-full"
          >
            Continue Using FlowFocus
          </Button>
        </div>

        <p className="text-xs text-muted-foreground pt-4">
          Premium features coming soon. Stay tuned! ✨
        </p>
      </Card>
    </div>
  );
};

export default TrialEnded;
