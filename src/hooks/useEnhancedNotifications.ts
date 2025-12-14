import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type NotificationState = 
  | 'unknown' 
  | 'default' 
  | 'granted' 
  | 'denied' 
  | 'blocked-settings' 
  | 'blocked-permanently';

export interface EnhancedNotificationState {
  permission: NotificationState;
  isSupported: boolean;
  hasAskedBefore: boolean;
  canRequestAgain: boolean;
  serviceWorkerReady: boolean;
  browserType: string;
}

export const useEnhancedNotifications = () => {
  const [state, setState] = useState<EnhancedNotificationState>({
    permission: 'unknown',
    isSupported: false,
    hasAskedBefore: false,
    canRequestAgain: false,
    serviceWorkerReady: false,
    browserType: 'unknown'
  });
  const { toast } = useToast();

  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome')) return 'chrome';
    if (userAgent.includes('firefox')) return 'firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari';
    if (userAgent.includes('edge')) return 'edge';
    return 'unknown';
  };

  const getDetailedPermissionState = (): NotificationState => {
    if (!('Notification' in window)) return 'blocked-permanently';
    
    const permission = Notification.permission;
    const hasAskedBefore = localStorage.getItem('flowfocus-notification-asked') === 'true';
    
    if (permission === 'granted') return 'granted';
    if (permission === 'default' && !hasAskedBefore) return 'default';
    if (permission === 'default' && hasAskedBefore) return 'blocked-settings';
    if (permission === 'denied') return 'denied';
    
    return 'unknown';
  };

  const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) return false;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      return !!registration;
    } catch {
      return false;
    }
  };

  const updateState = async () => {
    const permission = getDetailedPermissionState();
    const hasAskedBefore = localStorage.getItem('flowfocus-notification-asked') === 'true';
    const serviceWorkerReady = await checkServiceWorkerStatus();
    
    setState({
      permission,
      isSupported: 'Notification' in window,
      hasAskedBefore,
      canRequestAgain: permission === 'default' || permission === 'blocked-settings',
      serviceWorkerReady,
      browserType: detectBrowser()
    });
  };

  useEffect(() => {
    updateState();
    
    // Listen for permission changes
    const interval = setInterval(updateState, 5000);
    return () => clearInterval(interval);
  }, []);

  const requestPermission = async (): Promise<boolean> => {
    if (!state.isSupported) {
      toast({
        title: "Notifications not supported",
        description: "Your browser doesn't support notifications",
        variant: "destructive"
      });
      return false;
    }

    if (state.permission === 'granted') return true;

    if (!state.canRequestAgain) {
      toast({
        title: "Notifications blocked",
        description: "Please enable notifications manually in your browser settings",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Mark that we've asked before
      localStorage.setItem('flowfocus-notification-asked', 'true');
      
      const permission = await Notification.requestPermission();
      await updateState();
      
      if (permission === 'granted') {
        toast({
          title: "Notifications enabled! 🎉",
          description: "You'll now receive gentle reminders"
        });
        return true;
      } else {
        toast({
          title: "Notifications blocked",
          description: "You can still use the app - check our guide to enable them manually",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      await updateState();
      return false;
    }
  };

  const sendTestNotification = async (): Promise<boolean> => {
    if (state.permission !== 'granted') {
      toast({
        title: "Cannot send test",
        description: "Notifications not permitted",
        variant: "destructive"
      });
      return false;
    }

    try {
      // Try service worker first
      if (state.serviceWorkerReady) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('FlowFocus Test', {
          body: 'Your notifications are working perfectly! ✨',
          icon: '/favicon.ico',
          tag: 'test-notification',
          requireInteraction: false
        });
      } else {
        // Fallback to direct notification
        new Notification('FlowFocus Test', {
          body: 'Your notifications are working perfectly! ✨',
          icon: '/favicon.ico',
          tag: 'test-notification'
        });
      }

      toast({
        title: "Test notification sent!",
        description: "Check if you received it"
      });
      return true;
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test failed",
        description: "Could not send test notification",
        variant: "destructive"
      });
      return false;
    }
  };

  const resetPermissionTracking = () => {
    localStorage.removeItem('flowfocus-notification-asked');
    updateState();
  };

  return {
    ...state,
    requestPermission,
    sendTestNotification,
    resetPermissionTracking,
    refreshState: updateState
  };
};