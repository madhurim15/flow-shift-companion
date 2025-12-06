import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLocalNotifications } from '@/hooks/useLocalNotifications';
import { Capacitor } from '@capacitor/core';

interface MobileNotificationSetupProps {
  onPermissionGranted: () => void;
}

// Mobile Notification Setup Component
const MobileNotificationSetup = ({ onPermissionGranted }: MobileNotificationSetupProps) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();
  const localNotifications = useLocalNotifications();
  const isNative = Capacitor.isNativePlatform();

  useEffect(() => {
    const initializeNotifications = async () => {
      // Check if mobile or native
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || Capacitor.isNativePlatform();
      setIsMobile(isMobileDevice);

      if (isNative) {
        // Native mobile - use Capacitor push notifications
        setIsServiceWorkerReady(true);
        setPermissionStatus('default');
      } else {
        // Web browser - check notification permission
        if ('Notification' in window) {
          setPermissionStatus(Notification.permission);
        }

        // Check service worker status
        if ('serviceWorker' in navigator) {
          try {
            await navigator.serviceWorker.ready;
            setIsServiceWorkerReady(true);
          } catch (error) {
            console.log('Service worker not ready');
          }
        }
      }
    };

    initializeNotifications();
  }, [isNative]);

  const requestNotificationPermission = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // For native platforms, use local notifications only (safer)
        // Only call init once, then request
        console.log('[MobileNotificationSetup] User clicked request - initializing and requesting');
        await localNotifications.initLocalNotifications();
        const granted = await localNotifications.requestPermissions();
        if (granted) {
          setPermissionStatus('granted');
          toast({
            title: "Notifications enabled!",
            description: "You'll receive gentle reminders throughout the day.",
          });
          onPermissionGranted();
        } else {
          setPermissionStatus('denied');
          toast({
            title: "Permission denied",
            description: "You can enable notifications in your device settings.",
            variant: "destructive"
          });
        }
      } else {
        // Web browser notifications
        if (!('Notification' in window)) {
          toast({
            title: "Not supported",
            description: "This browser does not support notifications",
            variant: "destructive"
          });
          return;
        }

        const permission = await Notification.requestPermission();
        setPermissionStatus(permission);
        
        if (permission === 'granted') {
          onPermissionGranted();
          
          // Show welcome notification
          if ('serviceWorker' in navigator && isServiceWorkerReady) {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification('FlowFocus Setup Complete! ✨', {
              body: 'You\'ll now receive gentle reminders throughout your day',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'setup-complete',
              requireInteraction: false
            });
          } else {
            new Notification('FlowFocus Setup Complete! ✨', {
              body: 'You\'ll now receive gentle reminders throughout your day',
              icon: '/favicon.ico'
            });
          }
          
          toast({
            title: "Notifications enabled!",
            description: "You'll receive gentle reminders throughout the day.",
          });
        } else if (permission === 'denied') {
          toast({
            title: "Permission denied",
            description: "You can enable notifications in your browser settings.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast({
        title: "Error",
        description: "Failed to enable notifications. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleTestNotification = async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        // For native platforms, send a test local notification
        const success = await localNotifications.scheduleHighPriorityReminder(
          "Test Notification",
          "FlowFocus notifications are working! 🎉",
          1 // 1 second delay
        );
        if (success) {
          toast({
            title: "Test notification scheduled",
            description: "You should see a heads-up banner notification shortly",
          });
        } else {
          toast({
            title: "Test failed",
            description: "Unable to schedule notification. Please check permissions.",
            variant: "destructive"
          });
        }
      } else {
        // Web browser test notification
        if ('serviceWorker' in navigator && isServiceWorkerReady) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification('FlowFocus Test Notification 🧪', {
            body: 'This is a test notification to make sure everything works!',
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'test-notification',
            requireInteraction: false
          });
        } else {
          new Notification('FlowFocus Test Notification 🧪', {
            body: 'This is a test notification to make sure everything works!',
            icon: '/favicon.ico'
          });
        }
        
        toast({
          title: "Test notification sent!",
          description: "Check if you received the notification."
        });
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Error",
        description: "Failed to send test notification.",
        variant: "destructive"
      });
    }
  };

  const getStatusInfo = () => {
    const isReady = isNative ? permissionStatus === 'granted' : (permissionStatus === 'granted' && isServiceWorkerReady);
    
    if (isReady) {
      return {
        status: 'ready',
        icon: CheckCircle,
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800',
        title: 'Notifications Ready! 🎉',
        description: isNative ? 'Native push notifications are enabled' : 'You\'ll receive gentle reminders throughout your day'
      };
    } else if (permissionStatus === 'denied') {
      return {
        status: 'blocked',
        icon: AlertTriangle,
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        title: 'Notifications Blocked',
        description: isNative ? 'Enable in device settings to get reminders' : 'Enable in browser settings to get reminders'
      };
    } else {
      return {
        status: 'pending',
        icon: Clock,
        color: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-800',
        title: 'Setup Needed',
        description: 'Enable notifications for the best experience'
      };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <Card className={`p-6 space-y-4 ${statusInfo.color}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <StatusIcon className={`h-5 w-5 ${statusInfo.textColor}`} />
        </div>
        <div className="flex-1">
          <h3 className={`font-medium ${statusInfo.textColor}`}>
            {statusInfo.title}
          </h3>
          <p className={`text-sm ${statusInfo.textColor} opacity-80 mt-1`}>
            {statusInfo.description}
          </p>
        </div>
        {isMobile && (
          <Badge variant="secondary" className="text-xs">
            <Smartphone className="h-3 w-3 mr-1" />
            Mobile
          </Badge>
        )}
      </div>

      <div className="flex flex-col gap-2">
        {permissionStatus !== 'granted' && (
          <Button
            onClick={requestNotificationPermission}
            className="w-full"
            size="sm"
          >
            <Bell className="h-4 w-4 mr-2" />
            Enable Notifications
          </Button>
        )}

        {(permissionStatus === 'granted' && (isNative || isServiceWorkerReady)) && (
          <Button
            variant="outline"
            onClick={handleTestNotification}
            className="w-full"
            size="sm"
          >
            Send Test Notification
          </Button>
        )}
      </div>
    </Card>
  );
};

export default MobileNotificationSetup;