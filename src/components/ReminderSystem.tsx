
import { Card } from '@/components/ui/card';
import { useReminderSystem } from '@/hooks/useReminderSystem';
import { useEnhancedNotifications } from '@/hooks/useEnhancedNotifications';
import ReminderLoading from '@/components/ReminderLoading';
import ReminderToggle from '@/components/ReminderToggle';
import EnhancedNotificationWarning from '@/components/EnhancedNotificationWarning';
import ReminderTimes from '@/components/ReminderTimes';
import MobileNotificationSetup from '@/components/MobileNotificationSetup';
import InAppNotificationCenter from '@/components/InAppNotificationCenter';

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
  
  const enhancedNotifications = useEnhancedNotifications();

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

        {notificationsEnabled && enhancedNotifications.permission !== 'granted' && (
          <EnhancedNotificationWarning 
            state={enhancedNotifications}
            onRequestPermission={enhancedNotifications.requestPermission}
            onRefresh={enhancedNotifications.refreshState}
          />
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
