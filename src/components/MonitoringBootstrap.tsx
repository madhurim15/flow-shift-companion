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
  const [monitoringActive, setMonitoringActive] = useState(false);
  const [toastIds, setToastIds] = useState<string[]>([]);
  const [bootstrapStatus, setBootstrapStatus] = useState({
    componentMounted: false,
    bootstrapAttempted: false,
    lastError: null as string | null,
    notificationRequestCount: 0,
    lastNotificationRequest: 0,
  });
  const { initLocalNotifications, requestPermissions: requestNotificationPermissions } = useLocalNotifications();
  const { toast, dismiss } = useToast();
  
  // Refs to prevent unnecessary re-renders and stabilize callbacks
  const bootstrapInProgressRef = useRef(false);
  const lastPermissionCheckRef = useRef(0);
  const lastPermissionResultRef = useRef<any>(null); // Cache last permission result
  const activeToastTypesRef = useRef(new Set<string>());
  const monitoringCheckTimeoutRef = useRef<NodeJS.Timeout>();
  const notificationRequestCountRef = useRef(0);
  const notificationRequestTimesRef = useRef<number[]>([]);
  
  // Refs to track state without triggering re-renders (prevents infinite loop)
  const hasUsageAccessRef = useRef(false);
  const isBootstrappedRef = useRef(false);
  const toastIdsRef = useRef<string[]>([]);

  // Sync refs with state
  useEffect(() => {
    hasUsageAccessRef.current = hasUsageAccess;
  }, [hasUsageAccess]);

  useEffect(() => {
    isBootstrappedRef.current = isBootstrapped;
  }, [isBootstrapped]);

  // Expose bootstrap status to window for diagnostics
  useEffect(() => {
    console.log('[MonitoringBootstrap] Component mounted');
    setBootstrapStatus(prev => ({ ...prev, componentMounted: true }));
    (window as any).__monitoringBootstrapStatus = bootstrapStatus;
  }, []);

  useEffect(() => {
    (window as any).__monitoringBootstrapStatus = bootstrapStatus;
  }, [bootstrapStatus]);

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
    
    // Store in ref instead of state to prevent re-renders
    toastIdsRef.current = [...toastIdsRef.current, toastResult.id];
    
    // Remove type from active set after toast duration
    setTimeout(() => {
      activeToastTypesRef.current.delete(type);
    }, duration + 500);
    
    return toastResult;
  }, [toast]);

  // Circuit breaker for notification requests
  const canRequestNotifications = useCallback(() => {
    const now = Date.now();
    // Remove requests older than 10 seconds
    notificationRequestTimesRef.current = notificationRequestTimesRef.current.filter(
      time => now - time < 10000
    );
    
    if (notificationRequestTimesRef.current.length >= 3) {
      console.error('[MonitoringBootstrap] CIRCUIT BREAKER: Too many notification requests (3 in 10s), stopping');
      setBootstrapStatus(prev => ({ 
        ...prev, 
        lastError: 'Circuit breaker triggered: Too many notification permission requests'
      }));
      return false;
    }
    
    notificationRequestTimesRef.current.push(now);
    notificationRequestCountRef.current++;
    setBootstrapStatus(prev => ({ 
      ...prev, 
      notificationRequestCount: notificationRequestCountRef.current,
      lastNotificationRequest: now
    }));
    return true;
  }, []);

  // Debounced permission check to prevent rapid UI updates
  const checkPermissionsWithDebounce = useCallback(async () => {
    const now = Date.now();
    if (now - lastPermissionCheckRef.current < 1000) {
      console.warn('[MonitoringBootstrap] Debounce active, returning cached result');
      return lastPermissionResultRef.current; // Return cached result instead of null
    }
    
    lastPermissionCheckRef.current = now;
    
    try {
      console.log('[MonitoringBootstrap] About to call SystemMonitoring.checkPermissions');
      const permissionStatus = await SystemMonitoring.checkPermissions();
      console.log('[MonitoringBootstrap] checkPermissions result:', permissionStatus);
      lastPermissionResultRef.current = permissionStatus; // Cache the result
      setHasUsageAccess(permissionStatus.usageAccess);
      return permissionStatus;
    } catch (error) {
      console.error('[MonitoringBootstrap] Permission check FAILED:', error);
      setBootstrapStatus(prev => ({ 
        ...prev, 
        lastError: `checkPermissions failed: ${error}`
      }));
      return null;
    }
  }, []);

  useEffect(() => {
    console.log('[MonitoringBootstrap] useEffect triggered', {
      isNative: Capacitor.isNativePlatform(),
      platform: Capacitor.getPlatform(),
      isBootstrapped,
      bootstrapInProgress: bootstrapInProgressRef.current
    });

    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android' || isBootstrapped || bootstrapInProgressRef.current) {
      console.log('[MonitoringBootstrap] useEffect early return - conditions not met');
      return;
    }

    const bootstrapMonitoring = async () => {
      if (bootstrapInProgressRef.current) return;
      bootstrapInProgressRef.current = true;
      setBootstrapStatus(prev => ({ ...prev, bootstrapAttempted: true }));
      
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
        
        // Request notification permission before starting monitoring (with circuit breaker)
        try {
          if (!canRequestNotifications()) {
            console.error('[MonitoringBootstrap] Skipping notification request due to circuit breaker');
          } else {
            console.log('[MonitoringBootstrap] Requesting notification permissions');
            await requestNotificationPermissions();
            console.log('[MonitoringBootstrap] Notification permissions handled');
          }
        } catch (error) {
          console.log('[MonitoringBootstrap] Notification permission request failed, but continuing:', error);
          setBootstrapStatus(prev => ({ 
            ...prev, 
            lastError: `Notification permission error: ${error}`
          }));
        }

        // Check if we already have usage access permission (with explicit error handling)
        console.log('[MonitoringBootstrap] About to check permissions via SystemMonitoring');
        const permissionStatus = await checkPermissionsWithDebounce();
        if (!permissionStatus) {
          console.log('[MonitoringBootstrap] Permission check returned null, aborting');
          bootstrapInProgressRef.current = false;
          setBootstrapStatus(prev => ({ 
            ...prev, 
            lastError: 'Permission check returned null'
          }));
          return;
        }

        if (permissionStatus.usageAccess) {
          // Samsung-specific delay + simple retry logic
          const isSamsung = /samsung/i.test(navigator.userAgent) || /SM-[A-Z]\d+/i.test(navigator.userAgent);
          const delayMs = isSamsung ? 1500 : 500;
          
          console.log(`[MonitoringBootstrap] Starting with ${delayMs}ms delay (Samsung: ${isSamsung})`);
          
          setTimeout(async () => {
            try {
              console.log('[MonitoringBootstrap] About to call SystemMonitoring.startMonitoring');
              await SystemMonitoring.startMonitoring({ 
                debug: isDebugMode,
                userName: userName 
              });
              console.log('[MonitoringBootstrap] Monitoring started successfully');
              setBootstrapStatus(prev => ({ ...prev, lastError: null }));
              
              // Verify service actually started by checking status
              setTimeout(async () => {
                try {
                  console.log('[MonitoringBootstrap] About to call SystemMonitoring.getStatus');
                  const status = await SystemMonitoring.getStatus();
                  console.log('[MonitoringBootstrap] Status check:', status);
                  
                  if (!status.serviceRunning && status.usageAccess) {
                    console.warn('[MonitoringBootstrap] Service not running, attempting restart');
                    showToast('restart-monitoring', 'Restarting service', 'Attempting to restart monitoring...', 3000);
                    
                    try {
                      console.log('[MonitoringBootstrap] About to call SystemMonitoring.restartMonitoring');
                      const restartResult = await SystemMonitoring.restartMonitoring({ 
                        debug: isDebugMode,
                        userName: userName 
                      });
                      console.log('[MonitoringBootstrap] Restart result:', restartResult);
                      
                      if (restartResult.restarted) {
                        setMonitoringActive(true);
                        showToast('monitoring-started', 'Monitoring active', 'Successfully restarted monitoring service', 3000);
                      } else {
                        showToast('restart-failed', 'Service not running', 'Could not restart monitoring. Check settings.', 5000);
                        setBootstrapStatus(prev => ({ 
                          ...prev, 
                          lastError: 'Service restart failed after initial start'
                        }));
                      }
                    } catch (restartError) {
                      console.error('[MonitoringBootstrap] Restart error:', restartError);
                      setBootstrapStatus(prev => ({ 
                        ...prev, 
                        lastError: `Restart error: ${restartError}`
                      }));
                    }
                  } else {
                    setMonitoringActive(true);
                    showToast('monitoring-started', 'Monitoring active', 'System monitoring started', 3000);
                  }
                  
                  // Check for notification permission on API 33+
                  if (!status.notificationsEnabled) {
                    showToast('warning', 'Enable Notifications', 
                      'Please enable notifications for FlowFocus in App Settings', 8000);
                  }
                } catch (statusError) {
                  console.error('[MonitoringBootstrap] Status check error:', statusError);
                  setBootstrapStatus(prev => ({ 
                    ...prev, 
                    lastError: `Status check error: ${statusError}`
                  }));
                }
              }, 2000);
              
              setIsBootstrapped(true);
              showToast('success', 'Welcome!', 'Monitoring active 🎉');
            } catch (error: any) {
              console.error('[MonitoringBootstrap] CRITICAL: startMonitoring failed:', error);
              const errorMessage = error?.message || String(error);
              
              // Samsung fix: Detect "not implemented" error and stop retries
              if (errorMessage.toLowerCase().includes('not implemented')) {
                console.error('[MonitoringBootstrap] Plugin not implemented - stopping retries');
                setBootstrapStatus(prev => ({ 
                  ...prev, 
                  bootstrapAttempted: true,
                  lastError: 'Native plugin missing - rebuild required'
                }));
                
                showToast(
                  'native-mismatch',
                  'Native Plugin Missing',
                  'The SystemMonitoring plugin is not in this build. Uninstall the app, then run: npm ci && npm run build && npx cap sync android. Rebuild in Android Studio and reinstall.',
                  0 // Don't auto-dismiss
                );
                
                bootstrapInProgressRef.current = false;
                return;
              }
              
              setBootstrapStatus(prev => ({ 
                ...prev, 
                lastError: `startMonitoring failed: ${errorMessage}`
              }));
              
              if (errorMessage.includes('not implemented')) {
                showToast(
                  'plugin-missing',
                  'Plugin not found',
                  'SystemMonitoring plugin is not available in this build',
                  10000
                );
                setIsBootstrapped(true);
                return;
              } else if (errorMessage.includes('notifications_denied')) {
                showToast('warning', 'Notifications Required', 
                  'Please enable notifications in App Settings', 8000);
                setIsBootstrapped(true);
                return;
              } else if (errorMessage.includes('usage_access_denied')) {
                showToast(
                  'usage-access-denied',
                  'Usage access required',
                  'Please grant usage access permission',
                  8000
                );
                setIsBootstrapped(true);
                return;
              }
              
              // Single retry after 2 seconds
              console.log('[MonitoringBootstrap] Attempting retry in 2 seconds');
              setTimeout(async () => {
                try {
                  console.log('[MonitoringBootstrap] About to call SystemMonitoring.startMonitoring (retry)');
                  await SystemMonitoring.startMonitoring({ 
                    debug: isDebugMode,
                    userName 
                  });
                  console.log('[MonitoringBootstrap] Retry successful');
                  setIsBootstrapped(true);
                  setMonitoringActive(true);
                  showToast('success', 'Ready!', 'Monitoring started');
                } catch (retryError) {
                  console.error('[MonitoringBootstrap] Retry failed - limited mode:', retryError);
                  setBootstrapStatus(prev => ({ 
                    ...prev, 
                    lastError: `Retry failed: ${retryError}`
                  }));
                  setIsBootstrapped(true);
                  showToast('warning', 'Limited Mode', 'Please restart if issues persist', 6000);
                }
              }, 2000);
            }
          }, delayMs);

          setIsBootstrapped(true);

          // Success confirmation
          setTimeout(() => {
            showToast(
              'monitoring-active',
              "✅ FlowFocus Active",
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
        
        // Use refs to prevent unnecessary effect re-runs
        if (permissionStatus.usageAccess && !isBootstrappedRef.current && !bootstrapInProgressRef.current) {
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
            
            // Start monitoring with robust retry (3 attempts)
            let attempt = 0;
            const maxAttempts = 3;
            let started = false;
            
            while (attempt < maxAttempts && !started) {
              try {
                const delay = attempt * 1000; // 0ms, 1s, 2s
                if (delay > 0) {
                  await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                await SystemMonitoring.startMonitoring({ 
                  debug: isDebugMode,
                  userName: userName
                });
                started = true;
                setMonitoringActive(true);
                console.log(`[MonitoringBootstrap] Resume monitoring started on attempt ${attempt + 1}`);
              } catch (startError) {
                attempt++;
                console.warn(`[MonitoringBootstrap] Resume attempt ${attempt} failed:`, startError);
                if (attempt >= maxAttempts) {
                  throw startError; // Will be caught by outer catch
                }
              }
            }
            
            setIsBootstrapped(true);
            
            console.log('[MonitoringBootstrap] Monitoring started after resume for:', userName);
            
            // Show success toast after resume (with deduplication)
            setTimeout(() => {
              showToast(
                'monitoring-resumed',
                "✅ FlowFocus Active",
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
      
      // Cleanup any active toasts on unmount using ref
      toastIdsRef.current.forEach(id => dismiss(id));
      activeToastTypesRef.current.clear();
      
      // Clear monitoring check timeout
      if (monitoringCheckTimeoutRef.current) {
        clearTimeout(monitoringCheckTimeoutRef.current);
      }
    };
  }, [showToast, checkPermissionsWithDebounce, isDebugMode, requestNotificationPermissions]);

  // This component renders nothing - it's just for side effects
  return null;
};