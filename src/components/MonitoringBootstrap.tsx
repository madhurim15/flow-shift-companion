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

  const isDebugMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('debug') === '1' ||
    new URLSearchParams(window.location.hash.split('?')[1] || '').get('debug') === '1'
  );

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android' || isBootstrapped) {
      return;
    }

    const bootstrapMonitoring = async () => {
      try {
        console.log('[MonitoringBootstrap] Starting bootstrap process');
        
        // Show debug mode confirmation if enabled
        if (isDebugMode) {
          toast({
            title: "🐛 Debug Mode Active",
            description: "Short thresholds enabled for testing (30-60 seconds instead of 15 minutes)",
            duration: 5000
          });
        }
        
        // 1. Initialize local notifications
        await initLocalNotifications();
        
        // 2. Request notification permissions if needed
        const notificationGranted = await requestNotificationPermissions();
        if (!notificationGranted) {
          console.warn('[MonitoringBootstrap] Notification permission denied');
        }

        // 3. Check usage access permission with retry logic
        const permissionStatus = await SystemMonitoring.checkPermissions();
        setHasUsageAccess(permissionStatus.usageAccess);

        if (!permissionStatus.usageAccess) {
          // Show persistent toast about required permission
          toast({
            title: "🔑 Permission Required",
            description: "FlowLight needs Usage Access to monitor apps. Please enable it in the settings that will open.",
            duration: 10000
          });

          try {
            // Open usage access settings
            await SystemMonitoring.requestPermissions();
            
            // Don't start monitoring yet - wait for user to return with permission
            console.log('[MonitoringBootstrap] Waiting for Usage Access permission...');
            return;
          } catch (error) {
            console.error('[MonitoringBootstrap] Failed to open Usage Access settings:', error);
            toast({
              title: "Settings Error",
              description: "Could not open Usage Access settings. Please enable manually in Android Settings.",
              duration: 8000
            });
            return;
          }
        }

        // 4. Start monitoring service with debug flag (only if we have permission)
        await SystemMonitoring.startMonitoring({ debug: isDebugMode });
        console.log(`[MonitoringBootstrap] Monitoring started ${isDebugMode ? '(Debug Mode - Short Thresholds)' : ''}`);

        setIsBootstrapped(true);

        // Success confirmation
        toast({
          title: "✅ FlowLight Active",
          description: `Monitoring started ${isDebugMode ? '(Debug Mode - Quick nudges!)' : ''}`,
          duration: 4000
        });

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