import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Shield, Settings, CheckCircle, Smartphone, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { supabase } from '@/integrations/supabase/client';

type UsageAccessSetupProps = {
  onPermissionGranted: () => void;
  onSkip: () => void;
};

// Helper function to fetch user's preferred name
const fetchUserName = async (): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferred_name, full_name')
        .eq('id', user.id)
        .maybeSingle();
      
      if (profile?.preferred_name) {
        return profile.preferred_name;
      } else if (profile?.full_name) {
        return profile.full_name.split(' ')[0];
      }
    }
  } catch (e) {
    console.log('[UsageAccessSetup] Failed to fetch user name:', e);
  }
  return 'friend';
};

const UsageAccessSetup = ({ onPermissionGranted, onSkip }: UsageAccessSetupProps) => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const { toast } = useToast();
  const { requestPermissions: requestNotificationPermissions } = useLocalNotifications();

  const checkUsageAccess = async () => {
    if (!Capacitor.isNativePlatform()) {
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
          description: "Starting FlowFocus monitoring...",
        });

        try {
          await requestNotificationPermissions();
        } catch (e) {
          console.log('[UsageAccessSetup] Notification permission request failed (continuing):', e);
        }

        // Fetch user's preferred name
        const userName = await fetchUserName();
        console.log('[UsageAccessSetup] Using userName for nudges:', userName);

        // Samsung-specific delay before starting monitoring
        const isSamsung = /samsung/i.test(navigator.userAgent) || /SM-[A-Z]\d+/i.test(navigator.userAgent);
        const delayMs = isSamsung ? 1500 : 500;
        console.log(`[UsageAccessSetup] Starting monitoring with ${delayMs}ms delay (Samsung: ${isSamsung})`);
        
        setTimeout(async () => {
          try {
            await SystemMonitoring.startMonitoring({ userName });
            console.log('[UsageAccessSetup] Monitoring started successfully');
            onPermissionGranted();
          } catch (error) {
            console.error('[UsageAccessSetup] Failed to start monitoring:', error);
            // Retry logic
            setTimeout(async () => {
              try {
                await SystemMonitoring.startMonitoring({ userName });
                console.log('[UsageAccessSetup] Monitoring started on retry');
                onPermissionGranted();
              } catch (err) {
                console.error('[UsageAccessSetup] Retry failed:', err);
              }
            }, 2000);
          }
        }, delayMs);
      }
    } catch (error) {
      console.error('Error checking usage access:', error);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkUsageAccess();

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
    } catch (error) {
      console.error('Error requesting usage access:', error);
      toast({
        title: "Could not open settings",
        description: "Open Settings → Apps → Special access → Usage data access and enable FlowFocus.",
      });
    }
  };

  const openAppSettings = async () => {
    try {
      await SystemMonitoring.openAppSettings();
      toast({
        title: "Opening App Settings",
        description: "Navigate to Special access → Usage data access → enable FlowFocus.",
      });
    } catch (error) {
      toast({
        title: "Manual navigation needed",
        description: "Settings → Apps → FlowFocus → Special access → Usage data access → enable.",
      });
    }
  };

  const isSamsung = /samsung/i.test(navigator.userAgent) || /SM-[A-Z]\d+/i.test(navigator.userAgent);

  const openBatterySettings = async () => {
    try {
      await SystemMonitoring.openBatteryOptimizationSettings();
      toast({
        title: "Opening Battery Settings",
        description: "Disable battery optimization for FlowFocus to ensure monitoring works.",
      });
    } catch (error) {
      toast({
        title: "Manual navigation needed",
        description: "Settings → Battery → Battery optimization → FlowFocus → Don't optimize.",
      });
    }
  };

  const checkAgainNow = async () => {
    setIsChecking(true);
    try {
      const result = await SystemMonitoring.hasUsageStatsPermission();
      console.log('[UsageAccessSetup] hasUsageStatsPermission result:', result);
      
      if (result.granted) {
        setHasUsageAccess(true);
        toast({
          title: "Permission Found!",
          description: "Starting monitoring now...",
        });
        
        try {
          await requestNotificationPermissions();
          
          // Fetch user's preferred name
          const userName = await fetchUserName();
          console.log('[UsageAccessSetup] Using userName for nudges:', userName);
          
          await SystemMonitoring.startMonitoring({ userName });
          onPermissionGranted();
        } catch (e) {
          console.error('[UsageAccessSetup] Failed to start monitoring:', e);
          toast({
            title: "Monitoring Error",
            description: "Permission granted but failed to start: " + (e as Error).message,
          });
        }
      } else {
        toast({
          title: "Permission not found",
          description: "Please enable Usage data access for FlowFocus in Settings.",
        });
      }
    } catch (error) {
      console.error('[UsageAccessSetup] Manual check failed:', error);
      toast({
        title: "Check failed",
        description: "Could not verify permissions: " + (error as Error).message,
      });
    } finally {
      setIsChecking(false);
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
                FlowFocus is ready to help you stay mindful of your digital habits.
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
                FlowFocus can now monitor your app usage and send gentle nudges.
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
        <div className="space-y-6">
          {/* Progress indicator */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">Step 3 of 4</p>
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '75%' }} />
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="animate-gentle-float">
              <Shield className="h-12 w-12 text-primary mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">
              App Monitoring Permission
            </h2>
            <p className="text-muted-foreground">
              To send mindful nudges, FlowFocus needs to monitor app usage
            </p>
            
            {/* Samsung-specific hint */}
            {Capacitor.getPlatform() === 'android' && isSamsung && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-lg text-sm">
                <p className="font-semibold mb-1">📱 Samsung Device Detected</p>
                <p className="text-muted-foreground text-xs mb-2">
                  After granting permissions, disable battery optimization for best results
                </p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={openBatterySettings}
                    className="text-xs"
                  >
                    Battery Settings
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={openAppSettings}
                    className="text-xs"
                  >
                    App Settings
                  </Button>
                </div>
              </div>
            )}
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

            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  onClick={openAppSettings}
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Smartphone className="w-4 h-4 mr-2" />
                  App Settings
                </Button>
                
                <Button 
                  onClick={openBatterySettings}
                  disabled={isChecking}
                  variant="outline"
                  className="flex-1"
                  size="sm"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Battery
                </Button>
              </div>

              <Button 
                onClick={checkAgainNow}
                disabled={isChecking}
                variant="outline"
                className="w-full"
                size="sm"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check Again Now
              </Button>
            </div>

            <Button 
              onClick={onSkip}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Skip for now
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Samsung: Settings → Apps → FlowFocus → Special access → Usage data access → enable.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UsageAccessSetup;
