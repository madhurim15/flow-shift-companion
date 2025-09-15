import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

export interface LocalNotificationState {
  isEnabled: boolean;
  isNative: boolean;
  hasPermission: boolean;
}

export const useLocalNotifications = () => {
  const [state, setState] = useState<LocalNotificationState>({
    isEnabled: false,
    isNative: false,
    hasPermission: false
  });

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeLocalNotifications();
    }
  }, []);

  const initializeLocalNotifications = async () => {
    try {
      // Create high-importance notification channel for Android heads-up banners
      if (Capacitor.getPlatform() === 'android') {
        await LocalNotifications.createChannel({
          id: 'flowlight_high',
          name: 'FlowLight High Priority',
          description: 'High priority notifications that appear as heads-up banners',
          importance: 4, // IMPORTANCE_HIGH for heads-up display
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

      // Use high priority channel for Android heads-up banners
      if (Capacitor.getPlatform() === 'android') {
        notification.channelId = 'flowlight_high';
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

    try {
      const result = await LocalNotifications.requestPermissions();
      const granted = result.display === 'granted';
      
      setState(prev => ({
        ...prev,
        hasPermission: granted,
        isEnabled: granted
      }));
      
      return granted;
    } catch (error) {
      console.error('Failed to request local notification permissions:', error);
      return false;
    }
  };

  return {
    ...state,
    scheduleHighPriorityReminder,
    requestPermissions
  };
};