import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Bell, CheckCircle, PartyPopper, Lightbulb, Battery } from 'lucide-react';
import MobileNotificationSetup from './MobileNotificationSetup';
import UsageAccessSetup from './UsageAccessSetup';
import { Capacitor } from '@capacitor/core';

type WelcomeScreenProps = {
  onStart: () => void;
};

type OnboardingStep = 'welcome' | 'beta-welcome' | 'notifications' | 'usage-access' | 'first-week-tips' | 'complete';

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [permissionsGranted, setPermissionsGranted] = useState({
    notifications: false,
    usageAccess: false
  });

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      setPermissionsGranted(prev => ({
        ...prev,
        notifications: Notification.permission === 'granted'
      }));
    }
  }, []);

  const getStepProgress = () => {
    const steps = ['welcome', 'beta-welcome', 'notifications', 'usage-access', 'first-week-tips', 'complete'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const getStepNumber = () => {
    const stepMap: Record<OnboardingStep, number> = {
      'welcome': 1,
      'beta-welcome': 2,
      'notifications': 3,
      'usage-access': 4,
      'first-week-tips': 5,
      'complete': 6
    };
    return stepMap[currentStep];
  };

  const handleStart = () => {
    setCurrentStep('beta-welcome');
  };

  const handleBetaWelcomeContinue = () => {
    if (notificationPermission === 'default') {
      setCurrentStep('notifications');
    } else {
      setPermissionsGranted(prev => ({ ...prev, notifications: true }));
      setCurrentStep('usage-access');
    }
  };

  const handleNotificationSetup = () => {
    setPermissionsGranted(prev => ({ ...prev, notifications: true }));
    setCurrentStep('usage-access');
  };

  const handleNotificationSkip = () => {
    setCurrentStep('usage-access');
  };

  const handleUsageAccessSetup = () => {
    setPermissionsGranted(prev => ({ ...prev, usageAccess: true }));
    setCurrentStep('first-week-tips');
  };

  const handleUsageAccessSkip = () => {
    setCurrentStep('first-week-tips');
  };

  const handleFirstWeekTipsContinue = () => {
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    onStart();
  };

  // Step 1: Welcome
  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">Step {getStepNumber()} of 6</p>
            </div>

            <div className="space-y-2">
              <div className="animate-gentle-float">
                <Sparkles className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h1 className="text-3xl font-bold text-foreground">
                FlowFocus
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
              onClick={handleStart}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Let's start flowing ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 2: Beta Welcome
  if (currentStep === 'beta-welcome') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">Step {getStepNumber()} of 6</p>
            </div>

            <div className="space-y-3">
              <div className="animate-gentle-float">
                <PartyPopper className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-semibold text-primary">Beta Tester</span>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground">
                You're a Beta Tester!
              </h2>
              <p className="text-muted-foreground">
                Thank you for being among the first to try FlowFocus
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-3">
              <p className="text-sm text-foreground">
                <strong>Your feedback shapes the future of this app.</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span>💬</span>
                  <span>Found a bug or have an idea? We want to hear it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🎁</span>
                  <span>As a thank you, you have full access during beta</span>
                </li>
                <li className="flex items-start gap-2">
                  <span>🤝</span>
                  <span>You're helping build something meaningful</span>
                </li>
              </ul>
            </div>

            <Button 
              onClick={handleBetaWelcomeContinue}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Continue Setup ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 3: Notifications
  if (currentStep === 'notifications') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">Step {getStepNumber()} of 6</p>
            </div>
            
            <div className="space-y-2">
              <div className="animate-gentle-float">
                <Bell className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Stay Connected
              </h2>
              <p className="text-muted-foreground">
                Get gentle reminders throughout your day to check in with yourself
              </p>
            </div>

            <MobileNotificationSetup onPermissionGranted={handleNotificationSetup} />

            <Button 
              onClick={handleNotificationSkip}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 4: Usage Access
  if (currentStep === 'usage-access') {
    return <UsageAccessSetup onPermissionGranted={handleUsageAccessSetup} onSkip={handleUsageAccessSkip} />;
  }

  // Step 5: First Week Tips
  if (currentStep === 'first-week-tips') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">Step {getStepNumber()} of 6</p>
            </div>

            <div className="space-y-2">
              <div className="animate-gentle-float">
                <Lightbulb className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Your First Week
              </h2>
              <p className="text-muted-foreground">
                What to expect as you get started
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Stats build over time</p>
                  <p className="text-xs text-muted-foreground">Give it 5-7 days for accurate patterns to emerge</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-lg">🔔</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Nudges get smarter</p>
                  <p className="text-xs text-muted-foreground">We learn your habits and adjust timing accordingly</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-lg">🔥</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Build your streak</p>
                  <p className="text-xs text-muted-foreground">Even 2 minutes of action counts toward your daily streak</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="text-lg">💬</span>
                <div>
                  <p className="text-sm font-medium text-foreground">Share feedback anytime</p>
                  <p className="text-xs text-muted-foreground">Found a bug or have an idea? Tap "Feedback" in the menu</p>
                </div>
              </div>
            </div>

            {Capacitor.isNativePlatform() && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-left">
                <div className="flex items-start gap-2">
                  <Battery className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Battery Tip</p>
                    <p className="text-xs text-yellow-700">
                      For best results, disable battery optimization for FlowFocus in your device settings
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button 
              onClick={handleFirstWeekTipsContinue}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Got it! ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 6: Complete
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={100} className="w-full" />
              <p className="text-xs text-muted-foreground">Setup Complete!</p>
            </div>
            
            <div className="space-y-3">
              <div className="animate-gentle-float">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              </div>
              
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30">
                <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                <span className="font-semibold text-primary">Beta Tester</span>
              </div>
              
              <h2 className="text-2xl font-bold text-foreground">
                You're All Set!
              </h2>
              <p className="text-muted-foreground">
                FlowFocus is ready to be your gentle companion
              </p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {permissionsGranted.notifications ? 'Notifications enabled' : 'Notifications skipped'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  {permissionsGranted.usageAccess ? 'App monitoring enabled' : 'App monitoring skipped'}
                </span>
              </div>
              {Capacitor.isNativePlatform() && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Gentle nudges ready
                  </span>
                </div>
              )}
            </div>

            <Button 
              onClick={handleComplete}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Start Your Journey ✨
            </Button>
            
            <p className="text-xs text-muted-foreground">
              Remember: Your feedback is invaluable. Find "Feedback" in the menu anytime!
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return null;
};

export default WelcomeScreen;
