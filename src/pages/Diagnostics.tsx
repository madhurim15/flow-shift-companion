import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { MonitoringStatus } from '@/components/MonitoringStatus';
import { Capacitor } from '@capacitor/core';
import { 
  Smartphone, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Info, 
  TestTube,
  ArrowLeft,
  PlayCircle,
  Square,
  Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemMonitoring } from '@/plugins/system-monitoring';

const Diagnostics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const localNotifications = useLocalNotifications();
  const [diagnosticsData, setDiagnosticsData] = useState<any>({});
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  
  const isNativeAndroid = Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();

  useEffect(() => {
    const gatherDiagnostics = async () => {
      const platform = Capacitor.getPlatform();
      const isNative = Capacitor.isNativePlatform();
      
      // Check notification permission
      let notificationPermission = 'unknown';
      if (!isNative && 'Notification' in window) {
        notificationPermission = Notification.permission;
      }

      // Check service worker status
      let serviceWorkerStatus = 'not-supported';
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.getRegistration();
          serviceWorkerStatus = registration ? 'registered' : 'not-registered';
        } catch (error) {
          serviceWorkerStatus = 'error';
        }
      }

      // Check usage access on native Android
      let usageAccess = false;
      if (isNativeAndroid) {
        try {
          const permissions = await SystemMonitoring.checkPermissions();
          usageAccess = permissions.usageAccess;
          setHasUsageAccess(usageAccess);
        } catch (error) {
          console.error('Failed to check usage access:', error);
        }
      }

      setDiagnosticsData({
        platform,
        isNative,
        userAgent: navigator.userAgent,
        url: window.location.href,
        notificationPermission,
        serviceWorkerStatus,
        localNotificationsState: localNotifications,
        usageAccess,
        timestamp: new Date().toISOString(),
        capacitorVersion: '7.4.2', // From package.json
        environment: import.meta.env.MODE
      });
    };

    gatherDiagnostics();
  }, [localNotifications, isNativeAndroid]);

  const handleRequestPermissions = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await localNotifications.initLocalNotifications();
        const granted = await localNotifications.requestPermissions();
        toast({
          title: granted ? "Permissions granted" : "Permissions denied",
          description: granted ? "Local notifications are now enabled" : "Please check app settings",
          variant: granted ? "default" : "destructive"
        });
      } else {
        const permission = await Notification.requestPermission();
        toast({
          title: permission === 'granted' ? "Permissions granted" : "Permissions denied",
          description: permission === 'granted' ? "Browser notifications are now enabled" : "Please check browser settings"
        });
      }
      // Refresh diagnostics
      window.location.reload();
    } catch (error) {
      console.error('Error requesting permissions:', error);
      toast({
        title: "Permission request failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        const success = await localNotifications.scheduleHighPriorityReminder(
          "Diagnostic Test",
          "Local notifications are working! 🎉",
          1
        );
        toast({
          title: success ? "Test scheduled" : "Test failed",
          description: success 
            ? "Check for heads-up notification" 
            : "Check permissions and try again",
          variant: success ? "default" : "destructive"
        });
      } else {
        if (Notification.permission === 'granted') {
          new Notification("Diagnostic Test", {
            body: "Browser notifications are working! 🎉",
            icon: "/favicon.ico"
          });
          toast({
            title: "Test notification sent",
            description: "Check for browser notification"
          });
        } else {
          toast({
            title: "Cannot send test",
            description: "Notifications not permitted",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleStartMonitoring = async () => {
    try {
      await SystemMonitoring.startMonitoring({ debug: true });
      toast({
        title: "Monitoring Started",
        description: "FlowLight monitoring active with debug thresholds",
        duration: 4000
      });
    } catch (error) {
      toast({
        title: "Failed to Start",
        description: "Could not start monitoring. Check Usage Access permission.",
        variant: "destructive"
      });
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await SystemMonitoring.stopMonitoring();
      toast({
        title: "Monitoring Stopped",
        description: "FlowLight monitoring has been paused",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Failed to Stop",
        description: "Could not stop monitoring service",
        variant: "destructive"
      });
    }
  };

  const handleOpenUsageSettings = async () => {
    try {
      await SystemMonitoring.requestPermissions();
      toast({
        title: "Opening Settings",
        description: "Please enable Usage Access for FlowLight",
        duration: 5000
      });
      setTimeout(() => {
        window.location.reload();
      }, 3000);
    } catch (error) {
      toast({
        title: "Settings Error",
        description: "Could not open Usage Access settings",
        variant: "destructive"
      });
    }
  };

  const handleOpenBatterySettings = async () => {
    try {
      await SystemMonitoring.openBatteryOptimizationSettings();
      toast({
        title: "Opening Battery Settings",
        description: "Disable battery optimization for FlowLight to ensure monitoring works reliably",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Settings Error",
        description: "Could not open battery settings",
        variant: "destructive"
      });
    }
  };

  const handleOpenAppSettings = async () => {
    try {
      await SystemMonitoring.openAppSettings();
      toast({
        title: "Opening App Settings",
        description: "Check notifications and other permissions",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Settings Error",
        description: "Could not open app settings",
        variant: "destructive"
      });
    }
  };

  const handleRunSelfCheck = async () => {
    try {
      const permissions = await SystemMonitoring.checkPermissions();
      
      if (!permissions.usageAccess) {
        toast({
          title: "Missing Permission",
          description: "Usage Access is required. Opening settings...",
          variant: "destructive"
        });
        await SystemMonitoring.requestPermissions();
        setTimeout(async () => {
          const recheckPerms = await SystemMonitoring.checkPermissions();
          if (recheckPerms.usageAccess) {
            await SystemMonitoring.startMonitoring({ debug: true });
            toast({
              title: "✅ Self-Check Passed",
              description: "Monitoring started successfully!",
            });
            window.location.reload();
          } else {
            toast({
              title: "Permission Still Missing",
              description: "Please enable Usage Access manually",
              variant: "destructive"
            });
          }
        }, 3000);
        return;
      }

      // Permission granted, try to start monitoring
      try {
        await SystemMonitoring.startMonitoring({ debug: true });
        toast({
          title: "✅ Self-Check Passed",
          description: "All systems operational!",
        });
        window.location.reload();
      } catch (startError: any) {
        toast({
          title: "Failed to Start Monitoring",
          description: startError?.message || "Unknown error. Check battery optimization settings.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "Self-Check Failed",
        description: error?.message || "Could not complete self-check",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (condition: boolean, trueText: string, falseText: string) => (
    <Badge variant={condition ? "default" : "destructive"} className="ml-2">
      {condition ? <CheckCircle className="h-3 w-3 mr-1" /> : <XCircle className="h-3 w-3 mr-1" />}
      {condition ? trueText : falseText}
    </Badge>
  );

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">App Diagnostics</h1>
        </div>

        {/* Platform Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Platform Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span>Platform:</span>
              <Badge variant="outline">{diagnosticsData.platform}</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span>Native App:</span>
              {getStatusBadge(diagnosticsData.isNative, "Yes", "No")}
            </div>
            <div className="flex justify-between items-center">
              <span>Environment:</span>
              <Badge variant="outline">{diagnosticsData.environment}</Badge>
            </div>
            <Separator />
            <div className="text-xs text-muted-foreground break-all">
              <div><strong>URL:</strong> {diagnosticsData.url}</div>
              <div><strong>User Agent:</strong> {diagnosticsData.userAgent}</div>
            </div>
          </CardContent>
        </Card>

        {/* System-Wide Monitoring Status */}
        <MonitoringStatus />

        {/* Native Android Monitoring Controls */}
        {isNativeAndroid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Native Monitoring Controls
              </CardTitle>
              <CardDescription>
                Direct controls for system monitoring service
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span>Usage Access Permission:</span>
                {getStatusBadge(hasUsageAccess, "Granted", "Required")}
              </div>
              
              <div className="flex justify-between items-center">
                <span>Persistent Notification:</span>
                <Badge variant="outline" className="text-xs">
                  Check for "FlowLight monitoring active"
                </Badge>
              </div>

              <Separator />
              
              <div className="grid grid-cols-1 gap-3">
                <Button onClick={handleRunSelfCheck} className="w-full" variant="default">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Self-Check & Auto-Fix
                </Button>

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={handleOpenUsageSettings} variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Usage Access
                  </Button>
                  
                  <Button onClick={handleOpenBatterySettings} variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Battery Settings
                  </Button>
                </div>

                <Button onClick={handleOpenAppSettings} variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  Open App Settings
                </Button>
                
                {hasUsageAccess && (
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={handleStartMonitoring} variant="default" size="sm">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Monitoring
                    </Button>
                    
                    <Button onClick={handleStopMonitoring} variant="outline" size="sm">
                      <Square className="h-4 w-4 mr-2" />
                      Stop Monitoring  
                    </Button>
                  </div>
                )}
              </div>

              <div className="text-xs text-muted-foreground p-3 bg-green-50 dark:bg-green-950/20 rounded">
                <div className="font-medium text-green-800 dark:text-green-200 mb-1">
                  Quick Test Process:
                </div>
                <ol className="text-green-700 dark:text-green-300 space-y-1 list-decimal list-inside">
                  <li>Start monitoring service</li>
                  <li>Open Instagram app</li>
                  <li>Use for 25 seconds</li>
                  <li>Expect intervention nudge</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notification System
            </CardTitle>
            <CardDescription>
              Current notification permissions and capabilities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Local Notifications Enabled:</span>
              {getStatusBadge(diagnosticsData.localNotificationsState?.isEnabled, "Enabled", "Disabled")}
            </div>
            
            {!diagnosticsData.isNative && (
              <>
                <div className="flex justify-between items-center">
                  <span>Browser Permission:</span>
                  <Badge variant={diagnosticsData.notificationPermission === 'granted' ? "default" : "destructive"}>
                    {diagnosticsData.notificationPermission}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Service Worker:</span>
                  <Badge variant={diagnosticsData.serviceWorkerStatus === 'registered' ? "default" : "destructive"}>
                    {diagnosticsData.serviceWorkerStatus}
                  </Badge>
                </div>
              </>
            )}

            <Separator />
            
            <div className="flex gap-2 flex-wrap">
              <Button onClick={handleRequestPermissions} size="sm">
                <Bell className="h-4 w-4 mr-2" />
                Request Permissions
              </Button>
              <Button onClick={handleTestNotification} variant="outline" size="sm">
                <TestTube className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
              <Button onClick={() => window.open('#/permission-helper', '_blank', 'noopener,noreferrer')} variant="outline" size="sm">
                Open Permission Helper
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Debug Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Debug Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(diagnosticsData, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          Generated at: {diagnosticsData.timestamp}
        </div>
      </div>
    </div>
  );
};

export default Diagnostics;