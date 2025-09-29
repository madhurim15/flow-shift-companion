import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useToast } from '@/hooks/use-toast';

export const MonitoringBootstrap = () => {
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  const [isBootstrapped, setIsBootstrapped] = useState(false);
  const [toastIds, setToastIds] = useState<string[]>([]);
  const { initLocalNotifications, requestPermissions: requestNotificationPermissions } = useLocalNotifications();
  const { toast, dismiss } = useToast();
  
  // Refs to prevent unnecessary re-renders and stabilize callbacks
  const bootstrapInProgressRef = useRef(false);
  const lastPermissionCheckRef = useRef(0);
  const activeToastTypesRef = useRef(new Set<string>());

  const isDebugMode = typeof window !== 'undefined' && (
    new URLSearchParams(window.location.search).get('debug') === '1' ||
    new URLSearchParams(window.location.hash.split('?')[1] || '').get('debug') === '1' ||
    localStorage.getItem('debug-panel-enabled') === 'true'
  );

  // Debounced toast function to prevent spam and flickering
  const showToast = useCallback((type: string, title: string, description: string, duration: number = 4000) => {
    // Prevent duplicate toasts of the same type
    if (activeToastTypesRef.current.has(type)) {
      return;
    }
    
    activeToastTypesRef.current.add(type);
    
    const toastResult = toast({
      title,
      description,
      duration
    });
    
    setToastIds(prev => [...prev, toastResult.id]);
    
    // Remove type from active set after toast duration
    setTimeout(() => {
      activeToastTypesRef.current.delete(type);
    }, duration + 500);
    
    return toastResult;
  }, [toast]);

  // Debounced permission check to prevent rapid UI updates
  const checkPermissionsWithDebounce = useCallback(async () => {
    const now = Date.now();
    if (now - lastPermissionCheckRef.current < 2000) {
      return null; // Skip if checked recently
    }
    
    lastPermissionCheckRef.current = now;
    
    try {
      const permissionStatus = await SystemMonitoring.checkPermissions();
      setHasUsageAccess(permissionStatus.usageAccess);
      return permissionStatus;
    } catch (error) {
      console.error('[MonitoringBootstrap] Permission check failed:', error);
      return null;
    }
  }, []);

  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android' || isBootstrapped || bootstrapInProgressRef.current) {
      return;
    }

    const bootstrapMonitoring = async () => {
      if (bootstrapInProgressRef.current) return;
      bootstrapInProgressRef.current = true;
      
      try {
        console.log('[MonitoringBootstrap] Starting bootstrap process');
        
        // Show debug mode confirmation if enabled (with deduplication)
        if (isDebugMode) {
          showToast(
            'debug-mode',
            "🐛 Debug Mode Active",
            "Short thresholds enabled for testing (30-60 seconds instead of 15 minutes)",
            5000
          );
        }
        
        // 1. Initialize local notifications
        await initLocalNotifications();
        
        // 2. Request notification permissions if needed
        const notificationGranted = await requestNotificationPermissions();
        if (!notificationGranted) {
          console.warn('[MonitoringBootstrap] Notification permission denied');
        }

        // 3. Check usage access permission with debouncing
        const permissionStatus = await checkPermissionsWithDebounce();
        if (!permissionStatus) {
          bootstrapInProgressRef.current = false;
          return;
        }

        if (!permissionStatus.usageAccess) {
          console.log('[MonitoringBootstrap] Usage Access permission not granted - opening settings');
          // Add delay before showing permission toast to avoid overlap
          setTimeout(() => {
            showToast(
              'permission-required',
              "🔑 Permission Required", 
              "FlowLight needs Usage Access to monitor apps. Enable it in settings, then return to the app.",
              12000
            );
          }, isDebugMode ? 1000 : 500);

          try {
            // Open usage access settings
            await SystemMonitoring.requestPermissions();
            
            // Don't start monitoring yet - wait for user to return with permission
            console.log('[MonitoringBootstrap] Waiting for Usage Access permission...');
            bootstrapInProgressRef.current = false;
            return;
          } catch (error) {
            console.error('[MonitoringBootstrap] Failed to open Usage Access settings:', error);
            showToast(
              'settings-error',
              "Settings Error",
              "Could not open Usage Access settings. Please enable manually in Android Settings.",
              8000
            );
            bootstrapInProgressRef.current = false;
            return;
          }
        }

        // 4. Start monitoring service with debug flag (only if we have permission)
        await SystemMonitoring.startMonitoring({ debug: isDebugMode });
        console.log(`[MonitoringBootstrap] Monitoring started ${isDebugMode ? '(Debug Mode - 25s Instagram threshold)' : '(Production Mode - 15min Instagram threshold)'}`);

        setIsBootstrapped(true);

        // Success confirmation with delay to avoid overlap
        setTimeout(() => {
          showToast(
            'monitoring-active',
            "✅ FlowLight Active",
            `Monitoring started ${isDebugMode ? '(Debug: 25s Instagram threshold)' : '(15min Instagram threshold)'}. Check for persistent notification.`,
            6000
          );
        }, 1000);

      } catch (error) {
        console.error('[MonitoringBootstrap] Failed to bootstrap:', error);
        showToast(
          'setup-error',
          "Setup Issue", 
          "Could not start monitoring. Please check app permissions.",
          5000
        );
      } finally {
        bootstrapInProgressRef.current = false;
      }
    };

    bootstrapMonitoring();
  }, [isBootstrapped, initLocalNotifications, requestNotificationPermissions, showToast, checkPermissionsWithDebounce, isDebugMode]);

  // Re-check permissions when app resumes with debouncing
  useEffect(() => {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') {
      return;
    }

    const handleAppResume = async () => {
      if (document.hidden) return; // Only handle when app becomes visible
      
      try {
        const permissionStatus = await checkPermissionsWithDebounce();
        if (!permissionStatus) return;
        
        if (permissionStatus.usageAccess && !isBootstrapped && !bootstrapInProgressRef.current) {
          // User granted permission - restart monitoring
          bootstrapInProgressRef.current = true;
          
          try {
            await SystemMonitoring.startMonitoring({ debug: isDebugMode });
            setIsBootstrapped(true);
            
            console.log('[MonitoringBootstrap] Monitoring started after resume');
            
            // Show success toast after resume (with deduplication)
            setTimeout(() => {
              showToast(
                'monitoring-resumed',
                "✅ FlowLight Resumed",
                "Monitoring reactivated after permission granted",
                3000
              );
            }, 500);
          } finally {
            bootstrapInProgressRef.current = false;
          }
        }
      } catch (error) {
        console.error('[MonitoringBootstrap] Error checking permissions on resume:', error);
        bootstrapInProgressRef.current = false;
      }
    };

    // Use document events for app resume detection with debouncing
    let resumeTimeout: NodeJS.Timeout;
    const debouncedHandleAppResume = () => {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(handleAppResume, 1000); // Debounce rapid visibility changes
    };

    document.addEventListener('visibilitychange', debouncedHandleAppResume);
    return () => {
      document.removeEventListener('visibilitychange', debouncedHandleAppResume);
      clearTimeout(resumeTimeout);
      
      // Cleanup any active toasts on unmount
      toastIds.forEach(id => dismiss(id));
      activeToastTypesRef.current.clear();
    };
  }, [hasUsageAccess, isBootstrapped, showToast, checkPermissionsWithDebounce, toastIds, dismiss, isDebugMode]);

  // This component renders nothing - it's just for side effects
  return null;
};