import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  Clock, 
  CheckCircle, 
  X, 
  Heart,
  Smile
} from 'lucide-react';
import { type ReminderType, reminderMessages } from '@/utils/reminderUtils';

interface InAppNotification {
  id: string;
  type: ReminderType;
  message: string;
  timestamp: Date;
  read: boolean;
}

interface InAppNotificationCenterProps {
  isVisible: boolean;
  onClose: () => void;
  onNotificationAction: (type: ReminderType) => void;
}

const InAppNotificationCenter = ({ 
  isVisible, 
  onClose, 
  onNotificationAction 
}: InAppNotificationCenterProps) => {
  const [notifications, setNotifications] = useState<InAppNotification[]>([]);

  useEffect(() => {
    // Load persisted notifications from localStorage
    const stored = localStorage.getItem('flowfocus-inapp-notifications');
    if (stored) {
      try {
        const parsed = JSON.parse(stored).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
        setNotifications(parsed);
      } catch (error) {
        console.error('Error loading stored notifications:', error);
      }
    }
  }, []);

  const addNotification = (type: ReminderType) => {
    const newNotification: InAppNotification = {
      id: Date.now().toString(),
      type,
      message: reminderMessages[type],
      timestamp: new Date(),
      read: false
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev].slice(0, 10); // Keep only latest 10
      localStorage.setItem('flowfocus-inapp-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('flowfocus-inapp-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      localStorage.setItem('flowfocus-inapp-notifications', JSON.stringify(updated));
      return updated;
    });
  };

  const getTypeIcon = (type: ReminderType) => {
    switch (type) {
      case 'morning': return '🌅';
      case 'afternoon': return '🌱';
      case 'evening': return '🌆';
      case 'night': return '🌙';
      default: return '✨';
    }
  };

  const getTypeColor = (type: ReminderType) => {
    switch (type) {
      case 'morning': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'afternoon': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'evening': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
      case 'night': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // Expose addNotification globally for the reminder system to use
  useEffect(() => {
    (window as any).flowfocusAddInAppNotification = addNotification;
    return () => {
      delete (window as any).flowfocusAddInAppNotification;
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-primary/5 to-primary/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Gentle Reminders</h2>
              {unreadCount > 0 && (
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-96">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reminders yet</p>
              <p className="text-xs mt-1">Your gentle check-ins will appear here</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    !notification.read 
                      ? 'bg-primary/5 border-l-4 border-l-primary' 
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">{getTypeIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getTypeColor(notification.type)}`}
                        >
                          {notification.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {notification.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-3">
                        {notification.message}
                      </p>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => {
                            onNotificationAction(notification.type);
                            markAsRead(notification.id);
                          }}
                          className="h-7 px-3 text-xs"
                        >
                          <Heart className="h-3 w-3 mr-1" />
                          Check In
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 px-3 text-xs"
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Mark Read
                        </Button>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeNotification(notification.id)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 border-t bg-muted/30">
          <p className="text-xs text-muted-foreground text-center">
            💡 Enable browser notifications for reminders even when the app is closed
          </p>
        </div>
      </Card>
    </div>
  );
};

export default InAppNotificationCenter;