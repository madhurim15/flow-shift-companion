import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface LocalNotificationState {
  isEnabled: boolean;
  isNative: boolean;
  hasPermission: boolean;
}

// Global throttle to prevent LocalNotifications.requestPermissions spam
let lastPermissionRequestTs = 0;
let permissionRequestInFlight = false;
let cachedPermissionResult: boolean | null = null;
const PERMISSION_THROTTLE_MS = 10000; // 10 seconds

export const useLocalNotifications = () => {
  const [state, setState] = useState<LocalNotificationState>({
    isEnabled: false,
    isNative: false,
    hasPermission: false
  });

  // Removed auto-initialization to prevent Android crashes
  // Local notifications will be initialized explicitly when user opts in

  const initLocalNotifications = async () => {
    try {
      // Create high-importance notification channel for Android heads-up banners
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'flowfocus_nudge_channel',
          name: 'FlowFocus Reminders',
          description: 'High priority notifications that appear as heads-up banners',
          importance: 5, // IMPORTANCE_MAX for heads-up display
          visibility: 1, // VISIBILITY_PUBLIC
          sound: 'default',
          vibration: true,
          lights: true,
          lightColor: '#488AFF'
        });
      }

      const permission = await LocalNotifications.checkPermissions();
      
      setState(prev => ({
        ...prev,
        isNative: true,
        hasPermission: permission.display === 'granted',
        isEnabled: permission.display === 'granted'
      }));

      // If not granted, request permission
      if (permission.display !== 'granted') {
        const result = await LocalNotifications.requestPermissions();
        setState(prev => ({
          ...prev,
          hasPermission: result.display === 'granted',
          isEnabled: result.display === 'granted'
        }));
      }
    } catch (error) {
      console.error('Failed to initialize local notifications:', error);
    }
  };

  const scheduleHighPriorityReminder = async (title: string, body: string, delaySeconds: number = 0) => {
    if (!state.isEnabled || !state.isNative) {
      return false;
    }

    try {
      const notification: any = {
        title,
        body,
        id: Math.floor(Math.random() * 100000),
        schedule: { at: new Date(Date.now() + (delaySeconds * 1000)) },
        extra: {
          type: 'reminder',
          timestamp: Date.now()
        }
      };

      // Use FlowFocus nudge channel for Android heads-up banners
      if (Capacitor.getPlatform() === 'android') {
        notification.channelId = 'flowfocus_nudge_channel';
      }

      await LocalNotifications.schedule({
        notifications: [notification]
      });
      return true;
    } catch (error) {
      console.error('Failed to schedule local notification:', error);
      return false;
    }
  };

  const requestPermissions = async () => {
    if (!Capacitor.isNativePlatform()) {
      return false;
    }

    // Global throttle check
    const now = Date.now();
    if (permissionRequestInFlight) {
      console.log('[useLocalNotifications] Permission request already in flight, returning cached result');
      return cachedPermissionResult ?? false;
    }
    
    if (now - lastPermissionRequestTs < PERMISSION_THROTTLE_MS) {
      console.log('[useLocalNotifications] Throttled (within 10s), returning cached result');
      return cachedPermissionResult ?? false;
    }

    try {
      permissionRequestInFlight = true;
      lastPermissionRequestTs = now;
      console.log('[useLocalNotifications] Requesting permissions (throttle cleared)');
      
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      cachedPermissionResult = granted;
      
      setState(prev => ({
        ...prev,
        hasPermission: granted,
        isEnabled: granted
      }));
      
      return granted;
    } catch (error) {
      console.error('Failed to request local notification permissions:', error);
      cachedPermissionResult = false;
      return false;
    } finally {
      permissionRequestInFlight = false;
    }
  };

  return {
    ...state,
    scheduleHighPriorityReminder,
    requestPermissions,
    initLocalNotifications
  };
};