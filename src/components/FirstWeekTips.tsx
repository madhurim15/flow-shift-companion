import { useState, useEffect } from 'react';
import { X, Sparkles, BarChart3, Dice5, MessageSquare, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getFlowFocusItem, setFlowFocusItem } from '@/utils/localStorageMigration';

const TIPS = [
  {
    icon: BarChart3,
    title: "Stats build over time",
    description: "Your usage patterns become more accurate after 5-7 days of tracking."
  },
  {
    icon: Dice5,
    title: "Roll the dice!",
    description: "Feeling stuck? Try the Action Dice for a quick mood-boosting activity."
  },
  {
    icon: Flame,
    title: "Build your streak",
    description: "Complete daily actions to build momentum and track your progress."
  },
  {
    icon: MessageSquare,
    title: "Share feedback",
    description: "Found a bug or have ideas? Tap Settings → Feedback anytime."
  }
];

const MAX_VISITS = 3;
const VISITS_KEY = 'first_week_tips_visits';
const DISMISSED_KEY = 'first_week_tips_dismissed';

export const FirstWeekTips = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  useEffect(() => {
    // Check if permanently dismissed
    const dismissed = getFlowFocusItem(DISMISSED_KEY);
    if (dismissed === 'true') {
      return;
    }

    // Check visit count
    const visits = parseInt(getFlowFocusItem(VISITS_KEY) || '0', 10);
    
    if (visits < MAX_VISITS) {
      // Show tips and increment visit count
      setIsVisible(true);
      setFlowFocusItem(VISITS_KEY, String(visits + 1));
      
      // Rotate through tips based on visit
      setCurrentTipIndex(visits % TIPS.length);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
  };

  const handleDismissForever = () => {
    setFlowFocusItem(DISMISSED_KEY, 'true');
    setIsVisible(false);
  };

  const goToPrevTip = () => {
    setCurrentTipIndex((prev) => (prev === 0 ? TIPS.length - 1 : prev - 1));
  };

  const goToNextTip = () => {
    setCurrentTipIndex((prev) => (prev === TIPS.length - 1 ? 0 : prev + 1));
  };

  const goToTip = (index: number) => {
    setCurrentTipIndex(index);
  };

  if (!isVisible) return null;

  const currentTip = TIPS[currentTipIndex];
  const TipIcon = currentTip.icon;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 duration-500 max-h-[calc(100vh-12rem)] overflow-y-auto">
      <div className="bg-gradient-to-br from-primary/10 via-background to-accent/10 backdrop-blur-lg border border-primary/20 rounded-2xl p-3 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/20 rounded-lg">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-primary">First Week Tip</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 -mr-1 -mt-1"
            onClick={handleDismiss}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Tip Content with Navigation Arrows */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goToPrevTip}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="p-2 bg-primary/10 rounded-xl shrink-0">
              <TipIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground text-sm mb-1">
                {currentTip.title}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {currentTip.description}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={goToNextTip}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {/* Footer with Clickable Dots */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
          <div className="flex gap-1.5">
            {TIPS.map((_, index) => (
              <button
                key={index}
                onClick={() => goToTip(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentTipIndex 
                    ? 'bg-primary' 
                    : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to tip ${index + 1}`}
              />
            ))}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-7 text-muted-foreground hover:text-foreground"
            onClick={handleDismissForever}
          >
            Don't show again
          </Button>
        </div>
      </div>
    </div>
  );
};
