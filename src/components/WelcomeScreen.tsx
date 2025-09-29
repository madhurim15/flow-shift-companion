
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Bell, CheckCircle } from 'lucide-react';
import MobileNotificationSetup from './MobileNotificationSetup';
import UsageAccessSetup from './UsageAccessSetup';
import { Capacitor } from '@capacitor/core';

type WelcomeScreenProps = {
  onStart: () => void;
};

type OnboardingStep = 'welcome' | 'notifications' | 'usage-access' | 'complete';

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
    const steps = ['welcome', 'notifications', 'usage-access', 'complete'];
    return ((steps.indexOf(currentStep) + 1) / steps.length) * 100;
  };

  const handleStart = () => {
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
    setCurrentStep('complete');
  };

  const handleUsageAccessSkip = () => {
    setCurrentStep('complete');
  };

  const handleComplete = () => {
    onStart();
  };

  // Step 2: Notifications
  if (currentStep === 'notifications') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={getStepProgress()} className="w-full" />
              <p className="text-xs text-muted-foreground">Step 2 of 4</p>
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

  // Step 3: Usage Access
  if (currentStep === 'usage-access') {
    return <UsageAccessSetup onPermissionGranted={handleUsageAccessSetup} onSkip={handleUsageAccessSkip} />;
  }

  // Step 4: Complete
  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <Progress value={100} className="w-full" />
              <p className="text-xs text-muted-foreground">Setup Complete!</p>
            </div>
            
            <div className="space-y-2">
              <div className="animate-gentle-float">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                All Set!
              </h2>
              <p className="text-muted-foreground">
                FlowLight is ready to be your gentle companion
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
              Start FlowLight ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Step 1: Welcome
  return (
    <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <Progress value={getStepProgress()} className="w-full" />
            <p className="text-xs text-muted-foreground">Step 1 of 4</p>
          </div>

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
};

export default WelcomeScreen;
