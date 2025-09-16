import { useState, useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface PushNotificationState {
  isEnabled: boolean;
  token: string | null;
  isNative: boolean;
  isRegistered: boolean;
}

export const usePushNotifications = () => {
  const [state, setState] = useState<PushNotificationState>({
    isEnabled: false,
    token: null,
    isNative: Capacitor.isNativePlatform(),
    isRegistered: false
  });
  const { toast } = useToast();

// Removed auto-initialization to avoid crashes on Android without FCM config
// Previously initialized push notifications on native platforms here.

  const initializePushNotifications = async () => {
    try {
      if (!state.isNative) return;
      // Check permissions only; do not auto-register to avoid Android crash without FCM config
      const permissionStatus = await PushNotifications.checkPermissions();

      if (permissionStatus.receive === 'prompt') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }
      } else if (permissionStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Mark enabled (permission granted). Registration for token must be triggered explicitly elsewhere.
      setState(prev => ({ ...prev, isEnabled: true }));
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      toast({
        title: "Push notification error",
        description: "Failed to initialize push notifications",
        variant: "destructive"
      });
    }
  };

  const saveFCMToken = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('fcm_tokens' as any)
        .upsert({
          user_id: user.id,
          token: token,
          platform: Capacitor.getPlatform(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving FCM token:', error);
      } else {
        console.log('FCM token saved successfully');
      }
    } catch (error) {
      console.error('Error saving FCM token:', error);
    }
  };

  const requestPermissions = async (): Promise<boolean> => {
    if (!state.isNative) {
      // Fallback to web notifications for non-native platforms
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }

    try {
      const result = await PushNotifications.requestPermissions();
      const granted = result.receive === 'granted';
      // Do NOT auto-register here to avoid Android crash when FCM is not configured
      return granted;
    } catch (error) {
      console.error('Error requesting push permissions:', error);
      return false;
    }
  };

  const sendTestNotification = async () => {
    if (!state.token) {
      toast({
        title: "No push token available",
        description: "Please ensure push notifications are properly set up",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          token: state.token,
          title: 'FlowLight Test Notification 🧪',
          body: 'This is a test push notification!',
          data: { type: 'test' }
        }
      });

      if (error) {
        console.error('Error sending test notification:', error);
        toast({
          title: "Test notification failed",
          description: "Unable to send test notification",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Test notification sent!",
          description: "Check if you received the push notification"
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test notification failed",
        description: "Unable to send test notification",
        variant: "destructive"
      });
    }
  };

  return {
    ...state,
    requestPermissions,
    sendTestNotification,
    initializePushNotifications
  };
};