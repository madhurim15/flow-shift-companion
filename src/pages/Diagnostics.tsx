import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { MonitoringStatus } from '@/components/MonitoringStatus';
import { BuildInfoBanner } from '@/components/BuildInfoBanner';
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
  Settings,
  RefreshCw,
  Code
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const Diagnostics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const localNotifications = useLocalNotifications();
  const [diagnosticsData, setDiagnosticsData] = useState<any>({});
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [pluginStatus, setPluginStatus] = useState<any>(null);
  const [bootstrapStatus, setBootstrapStatus] = useState<any>(null);
  const [pluginTestResult, setPluginTestResult] = useState<string>('');
  const [buildInstructionsOpen, setBuildInstructionsOpen] = useState(false);
  
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
      let pluginDetected = false;
      let serviceStatus = null;
      if (isNativeAndroid) {
        try {
          const permissions = await SystemMonitoring.checkPermissions();
          usageAccess = permissions.usageAccess;
          setHasUsageAccess(usageAccess);
          pluginDetected = true;
          
          // Get detailed status
          const status = await SystemMonitoring.getStatus();
          setPluginStatus(status);
          serviceStatus = status;
        } catch (error) {
          console.error('Failed to check status:', error);
          pluginDetected = false;
        }
      }

      // Get bootstrap status if available
      const bootstrapStatusFromWindow = (window as any).__monitoringBootstrapStatus;
      setBootstrapStatus(bootstrapStatusFromWindow);

      setDiagnosticsData({
        platform,
        isNative,
        userAgent: navigator.userAgent,
        url: window.location.href,
        notificationPermission,
        serviceWorkerStatus,
        localNotificationsState: localNotifications,
        usageAccess,
        pluginDetected,
        serviceStatus,
        bootstrapStatus: bootstrapStatusFromWindow,
        timestamp: new Date().toISOString(),
        capacitorVersion: '7.4.2', // From package.json
        environment: import.meta.env.MODE
      });
    };

    gatherDiagnostics();
    
    // Refresh every 2 seconds to get live bootstrap status
    const interval = setInterval(gatherDiagnostics, 2000);
    return () => clearInterval(interval);
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
      // First, get current status
      const status = await SystemMonitoring.getStatus();
      setPluginStatus(status);
      
      if (!status.usageAccess) {
        toast({
          title: "Usage Access Required",
          description: "Opening settings...",
          duration: 3000
        });
        await handleOpenUsageSettings();
        return;
      }
      
      if (!status.notificationsEnabled) {
        toast({
          title: "Notifications Required",
          description: "Opening app settings to enable notifications...",
          duration: 3000
        });
        await handleOpenAppSettings();
        return;
      }

      if (!status.serviceRunning) {
        toast({
          title: "Starting Monitoring",
          description: "Attempting to start the monitoring service...",
          duration: 3000
        });
        
        await SystemMonitoring.startMonitoring({ debug: true });
        
        // Re-check status
        setTimeout(async () => {
          const newStatus = await SystemMonitoring.getStatus();
          setPluginStatus(newStatus);
          
          if (newStatus.serviceRunning) {
            toast({
              title: "✅ All Systems Go",
              description: "Monitoring is now active",
              variant: "default"
            });
          } else {
            toast({
              title: "Service Start Failed",
              description: "Check Android Studio logs for details",
              variant: "destructive"
            });
          }
        }, 2000);
      } else {
        toast({
          title: "✅ All Systems Operational",
          description: "Monitoring service is running",
          variant: "default"
        });
      }
    } catch (error) {
      console.error('Self-check failed:', error);
      toast({
        title: "Self-Check Failed",
        description: String(error),
        variant: "destructive"
      });
    }
  };

  const handleTestPluginBridge = async () => {
    try {
      setPluginTestResult('Testing plugin bridge...');
      const result = await SystemMonitoring.checkPermissions();
      setPluginTestResult(JSON.stringify(result, null, 2));
      toast({
        title: "Plugin Test Success",
        description: "Plugin bridge is working correctly",
      });
    } catch (error: any) {
      const errorMsg = error.message || String(error);
      setPluginTestResult(`ERROR: ${errorMsg}`);
      
      // Check if plugin is not implemented
      if (errorMsg.includes('not implemented') || error?.code === 'UNIMPLEMENTED') {
        toast({
          title: "Native Plugin Missing",
          description: "The SystemMonitoring plugin is not included in this build. See rebuild instructions below.",
          variant: "destructive",
          duration: 10000
        });
      } else {
        toast({
          title: "Plugin Test Failed",
          description: "Check the result below for details",
          variant: "destructive"
        });
      }
    }
  };

  const handleRestartMonitoring = async () => {
    try {
      toast({
        title: "Restarting Service",
        description: "Stopping and restarting monitoring...",
        duration: 2000
      });
      
      await SystemMonitoring.restartMonitoring({ debug: true });
      
      setTimeout(async () => {
        const status = await SystemMonitoring.getStatus();
        setPluginStatus(status);
        
        if (status.serviceRunning) {
          toast({
            title: "✅ Restart Successful",
            description: "Monitoring service is now running",
            variant: "default"
          });
        } else {
          toast({
            title: "Restart Issue",
            description: "Service may not have started. Check logs.",
            variant: "destructive"
          });
        }
      }, 2000);
    } catch (error) {
      console.error('Restart failed:', error);
      toast({
        title: "Restart Failed",
        description: String(error),
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

        {/* Build Info Banner */}
        <BuildInfoBanner />
        
        {/* Native Bridge Check - Samsung Fix */}
        {isNativeAndroid && (
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Native Bridge Status
              </CardTitle>
              <CardDescription>
                Quick check for native component health
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Platform:</span>
                  <Badge variant={diagnosticsData.isNative ? "default" : "secondary"}>
                    {diagnosticsData.platform}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Plugin Detected:</span>
                  <Badge variant={diagnosticsData.pluginDetected ? "default" : "destructive"}>
                    {diagnosticsData.pluginDetected ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>BUILD_STAMP:</span>
                  <span className="font-mono text-xs">1731601200000</span>
                </div>
              </div>
              
              {!diagnosticsData.pluginDetected && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 flex-1">
                      <p className="font-semibold text-destructive">Native Plugin Not Found</p>
                      <p className="text-sm text-muted-foreground">
                        The SystemMonitoring plugin is not included in this APK. You need to rebuild and reinstall the app.
                      </p>
                      <div className="bg-background/50 rounded p-3 mt-2">
                        <p className="text-xs font-semibold mb-2">Rebuild Steps:</p>
                        <code className="text-xs block bg-muted p-2 rounded mb-1">
                          npm ci && npm run build && npx cap sync android
                        </code>
                        <p className="text-xs text-muted-foreground mt-2">
                          Then in Android Studio: Build → Clean Project → Rebuild Project → Run
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Uninstall the old APK from your device first!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {bootstrapStatus && (
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <p className="text-sm font-semibold">Bootstrap Status</p>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Component Mounted:</span>
                      <span>{bootstrapStatus.componentMounted ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bootstrap Attempted:</span>
                      <span>{bootstrapStatus.bootstrapAttempted ? '✓' : '✗'}</span>
                    </div>
                    {bootstrapStatus.lastError && (
                      <div className="flex flex-col gap-1 mt-2 p-2 bg-destructive/10 rounded">
                        <span className="text-destructive font-semibold">Last Error:</span>
                        <span className="font-mono text-destructive break-all">{bootstrapStatus.lastError}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Notification Requests:</span>
                      <span>{bootstrapStatus.notificationRequestCount || 0}</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleOpenUsageSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Usage Access
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleOpenBatterySettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Battery Settings
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={handleOpenAppSettings}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  App Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

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
              {/* Capacitor Platform Detection */}
              <div className="p-3 bg-muted/50 rounded-md space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Capacitor Platform:</span>
                  <Badge variant="outline">{Capacitor.getPlatform()}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Is Native Platform:</span>
                  {getStatusBadge(Capacitor.isNativePlatform(), 'Yes', 'No')}
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Plugin Bridge:</span>
                  {getStatusBadge(diagnosticsData.pluginDetected, 'Connected', 'Missing')}
                </div>
              </div>

              <Separator />
              
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
                  <>
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
                    
                    <Button onClick={handleRestartMonitoring} variant="secondary" size="sm" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Service
                    </Button>
                  </>
                )}
              </div>

              {pluginStatus && (
                <div className="p-3 bg-muted/30 rounded-md space-y-2">
                  <div className="font-medium text-sm">Service Status:</div>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span>Plugin Bridge:</span>
                      <Badge variant={diagnosticsData.pluginDetected ? "default" : "destructive"}>
                        {diagnosticsData.pluginDetected ? "Connected" : "Missing"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage Access:</span>
                      <Badge variant={pluginStatus.usageAccess ? "default" : "destructive"}>
                        {pluginStatus.usageAccess ? "Granted" : "Denied"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Notifications:</span>
                      <Badge variant={pluginStatus.notificationsEnabled ? "default" : "destructive"}>
                        {pluginStatus.notificationsEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Service Running:</span>
                      <Badge variant={pluginStatus.serviceRunning ? "default" : "destructive"}>
                        {pluginStatus.serviceRunning ? "Active" : "Stopped"}
                      </Badge>
                    </div>
                  </div>
                </div>
              )}

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

        {/* Build & Install Instructions - Native Android */}
        {isNativeAndroid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Build & Install Instructions
              </CardTitle>
              <CardDescription>
                Commands for rebuilding and installing the APK
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={buildInstructionsOpen} onOpenChange={setBuildInstructionsOpen}>
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {buildInstructionsOpen ? 'Hide' : 'Show'} Full Rebuild Commands
                    <Code className="h-4 w-4" />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4">
                  <div className="font-mono text-xs space-y-2 bg-muted p-4 rounded border">
                    <div className="font-bold text-sm mb-2">Full Rebuild Procedure:</div>
                    <div className="space-y-1">
                      <div><span className="text-primary">1.</span> npm run build</div>
                      <div><span className="text-primary">2.</span> npx cap copy android</div>
                      <div><span className="text-primary">3.</span> npx cap sync android</div>
                      <div><span className="text-primary">4.</span> cd android && ./gradlew clean :app:assembleDebug</div>
                      <div><span className="text-primary">5.</span> adb uninstall app.lovable.a35e05c71a3c040e8bd0b8d3342281688</div>
                      <div><span className="text-primary">6.</span> adb install -r app/build/outputs/apk/debug/app-debug.apk</div>
                    </div>
                    <Separator className="my-3" />
                    <div className="font-bold text-sm mb-2">Verify Installation:</div>
                    <div className="bg-background p-2 rounded">
                      adb logcat -c && adb logcat -s FlowLight Capacitor
                    </div>
                    <div className="mt-2 text-yellow-600 dark:text-yellow-500 font-medium">
                      📋 Look for BUILD_STAMP: 1731960000000 in logs
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              <div className="mt-4">
                <Button onClick={handleTestPluginBridge} variant="secondary" className="w-full">
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Plugin Bridge
                </Button>
                
                {pluginTestResult && (
                  <div className="mt-3">
                    <div className="text-sm font-medium mb-2">Plugin Test Result:</div>
                    <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-48 border">
                      {pluginTestResult}
                    </pre>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Bootstrap Status Section */}
        {bootstrapStatus && isNativeAndroid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Bootstrap Status
              </CardTitle>
              <CardDescription>
                Monitoring initialization and permission request tracking
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span>Component Mounted:</span>
                  {getStatusBadge(bootstrapStatus.componentMounted, 'Yes', 'No')}
                </div>
                
                <div className="flex justify-between">
                  <span>Bootstrap Attempted:</span>
                  {getStatusBadge(bootstrapStatus.bootstrapAttempted, 'Yes', 'No')}
                </div>
                
                <div className="flex justify-between col-span-2">
                  <span>Notification Permission Requests:</span>
                  <Badge variant="outline">{bootstrapStatus.notificationRequestCount || 0}</Badge>
                </div>
                
                {bootstrapStatus.lastNotificationRequest > 0 && (
                  <div className="flex justify-between col-span-2 text-xs text-muted-foreground">
                    <span>Last Request:</span>
                    <span>{new Date(bootstrapStatus.lastNotificationRequest).toLocaleTimeString()}</span>
                  </div>
                )}
              </div>
              
              {bootstrapStatus.lastError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <div className="font-medium text-sm text-destructive mb-1">Last Error:</div>
                  <div className="text-xs text-destructive/80 break-all font-mono">
                    {bootstrapStatus.lastError}
                  </div>
                </div>
              )}
              
              {!bootstrapStatus.lastError && bootstrapStatus.bootstrapAttempted && (
                <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                  <div className="text-sm text-green-800 dark:text-green-200">
                    ✓ Bootstrap completed successfully
                  </div>
                </div>
              )}
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