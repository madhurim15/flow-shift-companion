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

  useEffect(() => {
    if (state.isNative) {
      initializePushNotifications();
    }
  }, [state.isNative]);

  const initializePushNotifications = async () => {
    try {
      // Check permissions
      const permissionStatus = await PushNotifications.checkPermissions();
      
      if (permissionStatus.receive === 'prompt') {
        // Request permissions
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.log('Push notification permission denied');
          return;
        }
      } else if (permissionStatus.receive !== 'granted') {
        console.log('Push notification permission not granted');
        return;
      }

      // Register for push notifications
      await PushNotifications.register();

      // Listen for registration events
      PushNotifications.addListener('registration', async (token) => {
        console.log('Push registration success, token: ', token.value);
        await saveFCMToken(token.value);
        setState(prev => ({
          ...prev,
          isEnabled: true,
          token: token.value,
          isRegistered: true
        }));
      });

      // Listen for registration errors
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Error on registration: ', error);
        toast({
          title: "Push notification setup failed",
          description: "Unable to register for push notifications",
          variant: "destructive"
        });
      });

      // Listen for push notifications received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received: ', notification);
        // Handle foreground notifications if needed
      });

      // Listen for notification actions (when user taps)
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed: ', notification);
        // Handle notification tap actions
      });

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
      
      if (granted) {
        await PushNotifications.register();
      }
      
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