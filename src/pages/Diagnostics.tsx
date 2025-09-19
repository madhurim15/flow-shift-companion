import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { Capacitor } from '@capacitor/core';
import { 
  Smartphone, 
  Bell, 
  CheckCircle, 
  XCircle, 
  Info, 
  TestTube,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Diagnostics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const localNotifications = useLocalNotifications();
  const [diagnosticsData, setDiagnosticsData] = useState<any>({});

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

      setDiagnosticsData({
        platform,
        isNative,
        userAgent: navigator.userAgent,
        url: window.location.href,
        notificationPermission,
        serviceWorkerStatus,
        localNotificationsState: localNotifications,
        timestamp: new Date().toISOString(),
        capacitorVersion: '7.4.2', // From package.json
        environment: import.meta.env.MODE
      });
    };

    gatherDiagnostics();
  }, [localNotifications]);

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