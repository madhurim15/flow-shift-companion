import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const MonitoringStatus = () => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkPermissions = async () => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      setIsLoading(false);
      return;
    }

    try {
      const result = await SystemMonitoring.checkPermissions();
      setHasUsageAccess(result.usageAccess);
    } catch (error) {
      console.error('Failed to check permissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openUsageAccessSettings = async () => {
    try {
      await SystemMonitoring.requestPermissions();
      toast({
        title: "Settings Opened",
        description: "Enable FlowFocus in Usage Access, then return to the app.",
        duration: 5000
      });
      
      // Re-check after a delay to see if user granted permission
      setTimeout(checkPermissions, 2000);
    } catch (error) {
      console.error('Failed to open settings:', error);
      toast({
        title: "Error",
        description: "Could not open Usage Access settings.",
        duration: 3000
      });
    }
  };

  useEffect(() => {
    checkPermissions();
    
    // Re-check when app resumes
    const handleResume = () => {
      setTimeout(checkPermissions, 1000);
    };
    
    document.addEventListener('resume', handleResume);
    return () => document.removeEventListener('resume', handleResume);
  }, []);

  if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Monitoring</CardTitle>
          <CardDescription>Android-only feature</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cross-app monitoring and nudges are only available on Android devices.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>System Monitoring</CardTitle>
          <CardDescription>Checking status...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>System Monitoring Status</CardTitle>
        <CardDescription>Cross-app nudges and usage tracking</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Usage Access Permission</span>
          <Badge variant={hasUsageAccess ? "default" : "destructive"}>
            {hasUsageAccess ? "Granted" : "Required"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Monitoring Service</span>
          <Badge variant={hasUsageAccess ? "default" : "secondary"}>
            {hasUsageAccess ? "Active" : "Inactive"}
          </Badge>
        </div>

        {!hasUsageAccess && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              FlowFocus needs Usage Access permission to provide mindful nudges while you use other apps.
            </p>
            <Button onClick={openUsageAccessSettings} variant="outline" size="sm">
              Open Usage Access Settings
            </Button>
          </div>
        )}

        {hasUsageAccess && (
          <div className="space-y-2">
            <p className="text-sm text-green-600">
              ✅ FlowFocus is monitoring your app usage and ready to provide mindful nudges.
            </p>
            <p className="text-xs text-muted-foreground">
              Add ?debug=1 to the URL for testing with shorter thresholds (30s instead of 15min).
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};