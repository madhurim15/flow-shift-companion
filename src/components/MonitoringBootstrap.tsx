import { useEffect, useState, useCallback, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
    new URLSearchParams(window.location.hash.split('?')[1] || '').get('debug') === '1'
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
        console.log('[MonitoringBootstrap] Starting lightweight bootstrap process');
        
        // Fetch user's preferred name from profile
        let userName = 'friend';
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('preferred_name, full_name')
              .eq('id', user.id)
              .single();
            
            if (profile?.preferred_name) {
              userName = profile.preferred_name;
            } else if (profile?.full_name) {
              userName = profile.full_name.split(' ')[0];
            }
            console.log('[MonitoringBootstrap] Using userName:', userName);
          }
        } catch (error) {
          console.log('[MonitoringBootstrap] Could not fetch user name, using default:', error);
        }
        
        // Request notification permission before starting monitoring
        try {
          await requestNotificationPermissions();
        } catch (error) {
          console.log('[MonitoringBootstrap] Notification permission request failed, but continuing:', error);
        }

        // Check if we already have usage access permission
        const permissionStatus = await checkPermissionsWithDebounce();
        if (!permissionStatus) {
          bootstrapInProgressRef.current = false;
          return;
        }

        if (permissionStatus.usageAccess) {
          // Auto-start monitoring if permission is already granted with retry
          try {
            await SystemMonitoring.startMonitoring({ 
              debug: isDebugMode,
              userName: userName
            });
            console.log(`[MonitoringBootstrap] Monitoring auto-started ${isDebugMode ? '(Debug Mode)' : '(Production Mode)'} for ${userName}`);
          } catch (startError) {
            console.warn('[MonitoringBootstrap] First start attempt failed, retrying...', startError);
            await new Promise(resolve => setTimeout(resolve, 1000));
            await SystemMonitoring.startMonitoring({ 
              debug: isDebugMode,
              userName: userName
            });
            console.log('[MonitoringBootstrap] Monitoring started on retry');
          }

          setIsBootstrapped(true);

          // Success confirmation
          setTimeout(() => {
            showToast(
              'monitoring-active',
              "✅ FlowLight Active",
              "Monitoring started. Check for persistent notification.",
              4000
            );
          }, 1000);
        } else {
          console.log('[MonitoringBootstrap] No usage access - waiting for onboarding to complete');
          setIsBootstrapped(false);
        }

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

  // Re-check permissions when app resumes with debouncing and native resume listener
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
            // Fetch user's preferred name
            let userName = 'friend';
            try {
              const { data: { user } } = await supabase.auth.getUser();
              if (user) {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('preferred_name, full_name')
                  .eq('id', user.id)
                  .single();
                
                if (profile?.preferred_name) {
                  userName = profile.preferred_name;
                } else if (profile?.full_name) {
                  userName = profile.full_name.split(' ')[0];
                }
              }
            } catch (error) {
              console.log('[MonitoringBootstrap] Could not fetch user name on resume:', error);
            }
            
            // Request notification permission before starting
            await requestNotificationPermissions();
            
            // Start monitoring with retry for Samsung
            try {
              await SystemMonitoring.startMonitoring({ 
                debug: isDebugMode,
                userName: userName
              });
            } catch (startError) {
              console.warn('[MonitoringBootstrap] Resume start failed, retrying...', startError);
              await new Promise(resolve => setTimeout(resolve, 1000));
              await SystemMonitoring.startMonitoring({ 
                debug: isDebugMode,
                userName: userName
              });
            }
            
            setIsBootstrapped(true);
            
            console.log('[MonitoringBootstrap] Monitoring started after resume for:', userName);
            
            // Show success toast after resume (with deduplication)
            setTimeout(() => {
              showToast(
                'monitoring-resumed',
                "✅ FlowLight Active",
                "Monitoring started successfully",
                3000
              );
            }, 500);
            } catch (error) {
              console.error('[MonitoringBootstrap] Failed to start monitoring after resume:', error);
              showToast(
                'monitoring-start-error',
                "Monitoring Error",
                "Failed to start: " + (error as Error).message,
                5000
              );
            } finally {
              bootstrapInProgressRef.current = false;
            }
        }
      } catch (error) {
        console.error('[MonitoringBootstrap] Error checking permissions on resume:', error);
        bootstrapInProgressRef.current = false;
      }
    };

    // Use both document events and native app resume listener
    let resumeTimeout: NodeJS.Timeout;
    const debouncedHandleAppResume = () => {
      clearTimeout(resumeTimeout);
      resumeTimeout = setTimeout(handleAppResume, 1500); // Increased debounce for Samsung reliability
    };

    document.addEventListener('visibilitychange', debouncedHandleAppResume);
    
    // Add native Capacitor resume listener for Samsung reliability
    const resumeListener = App.addListener('resume', () => {
      console.log('[MonitoringBootstrap] Native app resume detected');
      debouncedHandleAppResume();
    });
    
    return () => {
      document.removeEventListener('visibilitychange', debouncedHandleAppResume);
      resumeListener.then(handle => handle.remove());
      clearTimeout(resumeTimeout);
      
      // Cleanup any active toasts on unmount
      toastIds.forEach(id => dismiss(id));
      activeToastTypesRef.current.clear();
    };
  }, [hasUsageAccess, isBootstrapped, showToast, checkPermissionsWithDebounce, toastIds, dismiss, isDebugMode, requestNotificationPermissions]);

  // This component renders nothing - it's just for side effects
  return null;
};