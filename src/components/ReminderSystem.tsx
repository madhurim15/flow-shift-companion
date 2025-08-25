
import { Card } from '@/components/ui/card';
import { useReminderSystem } from '@/hooks/useReminderSystem';
import ReminderLoading from '@/components/ReminderLoading';
import ReminderToggle from '@/components/ReminderToggle';
import NotificationWarning from '@/components/NotificationWarning';
import ReminderTimes from '@/components/ReminderTimes';
import MobileNotificationSetup from '@/components/MobileNotificationSetup';

const ReminderSystem = () => {
  const {
    notificationsEnabled,
    reminderSettings,
    loading,
    browserPermissionWarning,
    toggleNotifications,
    requestBrowserPermission,
    testNotification
  } = useReminderSystem();

  if (loading) {
    return <ReminderLoading />;
  }

  return (
    <div className="space-y-4">
      <MobileNotificationSetup onPermissionGranted={requestBrowserPermission} />
      
      <Card className="p-6 space-y-4">
        <ReminderToggle 
          notificationsEnabled={notificationsEnabled}
          onToggle={toggleNotifications}
        />

        {browserPermissionWarning && notificationsEnabled && (
          <NotificationWarning onRequestPermission={requestBrowserPermission} />
        )}

        {notificationsEnabled && (
          <ReminderTimes 
            reminderSettings={reminderSettings}
            onTestNotification={testNotification}
          />
        )}

        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">
            These gentle nudges help you stay connected with yourself throughout the day ✨
          </p>
        </div>
      </Card>
    </div>
  );
};

export default ReminderSystem;
