import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, ExternalLink, MessageSquare, Star, Heart, Bug, Clock, CheckCircle } from 'lucide-react';
import BetaTesterBadge from '@/components/BetaTesterBadge';

const FEEDBACK_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdId9R5dugT1pETsTxADCTS2tPjkJyPFa24o-0pG3VLGw9ydQ/viewform?usp=dialog';

const Feedback = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);

  if (!user) return null;

  const openFeedbackForm = () => {
    window.open(FEEDBACK_FORM_URL, '_blank');
  };

  return (
    <div 
      className="min-h-screen bg-background"
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 120px)'
      }}
    >
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="font-medium">Back</span>
          </button>
          <BetaTesterBadge />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <Card className="p-6 text-center space-y-4">
          <div className="flex justify-center">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-foreground">
              We'd love your feedback!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your thoughts help us build a better FlowFocus for everyone.
            </p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>Takes about 3 minutes</span>
          </div>
        </Card>

        {/* What the form covers */}
        <Card className="p-4 bg-muted/30">
          <h3 className="text-sm font-medium text-foreground mb-3">What we'll ask about:</h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Overall experience</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Feature usage</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Nudge frequency</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-primary" />
              <span>Feature requests</span>
            </div>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={openFeedbackForm}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Rate Your Experience</h3>
                <p className="text-xs text-muted-foreground">Tell us what's working well</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={openFeedbackForm}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <Bug className="h-5 w-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Report a Bug</h3>
                <p className="text-xs text-muted-foreground">Help us squash issues</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>

          <Card className="p-4 hover:bg-muted/50 transition-colors cursor-pointer" onClick={openFeedbackForm}>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Heart className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Feature Request</h3>
                <p className="text-xs text-muted-foreground">What would make FlowFocus better?</p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground" />
            </div>
          </Card>
        </div>

        <div className="pt-4">
          <Button 
            onClick={openFeedbackForm}
            className="w-full"
            size="lg"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Open Feedback Form
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Your feedback is anonymous and helps shape the future of FlowFocus.
        </p>
      </div>
    </div>
  );
};

export default Feedback;
