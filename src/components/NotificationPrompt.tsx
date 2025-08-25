import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface NotificationPromptProps {
  onPermissionGranted: () => void;
  onDismiss: () => void;
}

const NotificationPrompt = ({ onPermissionGranted, onDismiss }: NotificationPromptProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show the prompt after a short delay for better UX
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleEnableNotifications = async () => {
    if ('Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Send a welcome notification if service worker is available
          if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            registration.showNotification('Flowlight Notifications Enabled! 🎉', {
              body: 'You\'ll now receive gentle reminders to check in with yourself.',
              icon: '/favicon.ico',
              badge: '/favicon.ico',
              tag: 'welcome',
              requireInteraction: false,
              silent: false
            });
          }
          onPermissionGranted();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  if (!isVisible || !('Notification' in window) || Notification.permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 right-4 z-50 animate-slide-down">
      <Card className="mx-auto max-w-sm bg-background/95 backdrop-blur-sm border border-border/50 shadow-lg">
        <div className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <Bell className="h-4 w-4 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  Enable gentle reminders?
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Get notified for check-ins throughout your day
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              onClick={handleDismiss}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
          
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleEnableNotifications}
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Enable
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="sm"
              className="flex-1 h-8 text-xs"
            >
              Not now
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationPrompt;