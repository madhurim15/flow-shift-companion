import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Bell, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MobileNotificationSetupProps {
  onPermissionGranted: () => void;
}

// Mobile Notification Setup Component
const MobileNotificationSetup = ({ onPermissionGranted }: MobileNotificationSetupProps) => {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isServiceWorkerReady, setIsServiceWorkerReady] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(isMobileDevice);

    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }

    // Check service worker status
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setIsServiceWorkerReady(true);
      });
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setPermissionStatus(permission);
      
      if (permission === 'granted') {
        onPermissionGranted();
        
        // Show welcome notification
        if ('serviceWorker' in navigator && isServiceWorkerReady) {
          const registration = await navigator.serviceWorker.ready;
          registration.showNotification('FlowLight Setup Complete! ✨', {
          body: 'You\'ll now receive gentle reminders throughout your day',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'setup-complete',
          requireInteraction: false
        });
        }
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  const sendTestNotification = async () => {
    if ('serviceWorker' in navigator && isServiceWorkerReady) {
      const registration = await navigator.serviceWorker.ready;
      registration.showNotification('FlowLight Test Notification 🧪', {
        body: 'This is a test notification to make sure everything works!',
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'test-notification',
        requireInteraction: false
      });
    }
  };

  const getStatusInfo = () => {
    if (permissionStatus === 'granted' && isServiceWorkerReady) {
      return {
        status: 'ready',
        icon: CheckCircle,
        color: 'bg-green-50 border-green-200',
        textColor: 'text-green-800',
        title: 'Notifications Ready! 🎉',
        description: 'You\'ll receive gentle reminders throughout your day'
      };
    } else if (permissionStatus === 'denied') {
      return {
        status: 'blocked',
        icon: AlertTriangle,
        color: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        title: 'Notifications Blocked',
        description: 'Enable in browser settings to get reminders'
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

        {permissionStatus === 'granted' && isServiceWorkerReady && (
          <Button
            variant="outline"
            onClick={sendTestNotification}
            className="w-full"
            size="sm"
          >
            Send Test Notification
          </Button>
        )}
      </div>

      <div className="pt-2 border-t border-current border-opacity-20">
        <div className="text-xs space-y-1 opacity-70">
          <div>Status: {permissionStatus}</div>
          <div>Service Worker: {isServiceWorkerReady ? 'Ready' : 'Loading...'}</div>
          <div>Device: {isMobile ? 'Mobile' : 'Desktop'}</div>
        </div>
      </div>
    </Card>
  );
};

export default MobileNotificationSetup;