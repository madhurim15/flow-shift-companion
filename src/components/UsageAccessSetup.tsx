import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Settings, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';

type UsageAccessSetupProps = {
  onPermissionGranted: () => void;
  onSkip: () => void;
};

const UsageAccessSetup = ({ onPermissionGranted, onSkip }: UsageAccessSetupProps) => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();

  const checkUsageAccess = async () => {
    if (!Capacitor.isNativePlatform()) {
      // Skip for web - no usage access needed
      onPermissionGranted();
      return;
    }

    try {
      setIsChecking(true);
      const result = await SystemMonitoring.checkPermissions();
      setHasUsageAccess(result.usageAccess);
      
      if (result.usageAccess) {
        toast({
          title: "Permission Granted!",
          description: "Usage access enabled successfully.",
        });
        onPermissionGranted();
      }
    } catch (error) {
      console.error('Error checking usage access:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    // Check initial state
    checkUsageAccess();

    // Check when app becomes visible (user returns from settings)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkUsageAccess();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const requestUsageAccess = async () => {
    try {
      await SystemMonitoring.requestPermissions();
      toast({
        title: "Opening Settings",
        description: "Please enable Usage Access for FlowLight in the settings that just opened.",
      });
    } catch (error) {
      console.error('Error requesting usage access:', error);
      toast({
        title: "Settings Error",
        description: "Please manually enable Usage Access in your device settings.",
        variant: "destructive"
      });
    }
  };

  // For web platforms, automatically grant
  if (!Capacitor.isNativePlatform()) {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="animate-gentle-float">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Ready to Go!
              </h2>
              <p className="text-muted-foreground">
                FlowLight is ready to help you stay mindful of your digital habits.
              </p>
            </div>

            <Button 
              onClick={onPermissionGranted}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Continue ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (hasUsageAccess) {
    return (
      <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
        <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <div className="animate-gentle-float">
                <CheckCircle className="h-12 w-12 text-primary mx-auto" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                Permission Granted!
              </h2>
              <p className="text-muted-foreground">
                FlowLight can now monitor your app usage and send gentle nudges.
              </p>
            </div>

            <Button 
              onClick={onPermissionGranted}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              Complete Setup ✨
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flow-gradient flex items-center justify-center p-4">
      <Card className="max-w-md mx-auto p-8 soft-shadow border-2 border-white/20 bg-white/90 backdrop-blur-sm">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="animate-gentle-float">
              <Shield className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              App Monitoring Permission
            </h2>
            <p className="text-muted-foreground">
              To send mindful nudges, FlowLight needs to monitor app usage
            </p>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
            <p className="text-sm text-muted-foreground">
              <strong>Example:</strong> When you use Instagram for 15+ minutes, we'll gently suggest a break with a caring reminder.
            </p>
          </div>

          <div className="space-y-3">
            <Button 
              onClick={requestUsageAccess}
              disabled={isChecking}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground gentle-hover"
              size="lg"
            >
              <Settings className="w-4 h-4 mr-2" />
              {isChecking ? 'Checking...' : 'Grant Permission'}
            </Button>

            <Button 
              onClick={onSkip}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            We'll open your device settings. Look for "Usage Access" or "Apps with usage access" and enable FlowLight.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UsageAccessSetup;