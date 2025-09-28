import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useToast } from '@/hooks/use-toast';

export const MonitoringBootstrap = () => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const { initLocalNotifications, requestPermissions: requestNotificationPermissions } = useLocalNotifications();
  const { toast } = useToast();

  const isDebugMode = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('debug') === '1';

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android' || isBootstrapped) {
      return;
    }

    const bootstrapMonitoring = async () => {
      try {
        console.log('[MonitoringBootstrap] Starting bootstrap process');
        
        // 1. Initialize local notifications
        await initLocalNotifications();
        
        // 2. Request notification permissions if needed
        const notificationGranted = await requestNotificationPermissions();
        if (!notificationGranted) {
          console.warn('[MonitoringBootstrap] Notification permission denied');
        }

        // 3. Check usage access permission
        const permissionStatus = await SystemMonitoring.checkPermissions();
        setHasUsageAccess(permissionStatus.usageAccess);

        if (!permissionStatus.usageAccess) {
          // Show toast and open settings
          toast({
            title: "Permission Required",
            description: "FlowLight needs Usage Access to provide mindful nudges across apps. Opening settings...",
            duration: 6000
          });

          // Open usage access settings
          await SystemMonitoring.requestPermissions();
        }

        // 4. Start monitoring service with debug flag
        await SystemMonitoring.startMonitoring({ debug: isDebugMode });
        console.log(`[MonitoringBootstrap] Monitoring started ${isDebugMode ? '(Debug Mode - Short Thresholds)' : ''}`);

        setIsBootstrapped(true);

      } catch (error) {
        console.error('[MonitoringBootstrap] Failed to bootstrap:', error);
        toast({
          title: "Setup Issue",
          description: "Could not start monitoring. Please check app permissions.",
          duration: 5000
        });
      }
    };

    bootstrapMonitoring();
  }, [isBootstrapped, initLocalNotifications, requestNotificationPermissions, toast, isDebugMode]);

  // Re-check permissions when app resumes
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const handleAppResume = async () => {
      try {
        const permissionStatus = await SystemMonitoring.checkPermissions();
        setHasUsageAccess(permissionStatus.usageAccess);
        
        if (permissionStatus.usageAccess && !isBootstrapped) {
          // User granted permission - restart monitoring
          await SystemMonitoring.startMonitoring({ debug: isDebugMode });
          setIsBootstrapped(true);
          
          toast({
            title: "Ready to Go!",
            description: "FlowLight is now monitoring your app usage for mindful nudges.",
            duration: 4000
          });
        }
      } catch (error) {
        console.error('[MonitoringBootstrap] Error checking permissions on resume:', error);
      }
    };

    document.addEventListener('resume', handleAppResume);
    return () => document.removeEventListener('resume', handleAppResume);
  }, [isBootstrapped, toast, isDebugMode]);

  // This component renders nothing - it's just for side effects
  return null;
};