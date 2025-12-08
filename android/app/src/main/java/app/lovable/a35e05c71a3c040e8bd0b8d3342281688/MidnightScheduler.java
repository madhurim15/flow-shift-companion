package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.AlarmManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.util.Log;
import java.util.Calendar;

/**
 * BroadcastReceiver that triggers at midnight to reschedule daily notifications
 */
public class MidnightScheduler extends BroadcastReceiver {
    
    private static final String TAG = "FlowFocus";
    private static final String ACTION_MIDNIGHT_RESCHEDULE = "app.lovable.flowfocus.MIDNIGHT_RESCHEDULE";
    
    @Override
    public void onReceive(Context context, Intent intent) {
        Log.i(TAG, "MidnightScheduler triggered at " + System.currentTimeMillis());
        
        if (ACTION_MIDNIGHT_RESCHEDULE.equals(intent.getAction())) {
            // Send event to JavaScript layer to trigger rescheduling
            Intent webViewIntent = new Intent(context, MainActivity.class);
            webViewIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            webViewIntent.putExtra("trigger_notification_reschedule", true);
            context.startActivity(webViewIntent);
            
            Log.i(TAG, "MidnightScheduler: Sent reschedule trigger to MainActivity");
        }
        
        // Always reschedule for next midnight
        scheduleMidnightAlarm(context);
    }
    
    /**
     * Schedule alarm for next midnight (12:01 AM)
     */
    public static void scheduleMidnightAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) {
            Log.e(TAG, "MidnightScheduler: AlarmManager not available");
            return;
        }
        
        // Create intent for this receiver
        Intent intent = new Intent(context, MidnightScheduler.class);
        intent.setAction(ACTION_MIDNIGHT_RESCHEDULE);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            9001, // Unique request code for midnight scheduler
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Calculate next midnight (12:01 AM)
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, 1);
        calendar.set(Calendar.HOUR_OF_DAY, 0);
        calendar.set(Calendar.MINUTE, 1);
        calendar.set(Calendar.SECOND, 0);
        calendar.set(Calendar.MILLISECOND, 0);
        
        long triggerAtMillis = calendar.getTimeInMillis();
        
        // Use setExactAndAllowWhileIdle for precise midnight triggering even in Doze mode
        alarmManager.setExactAndAllowWhileIdle(
            AlarmManager.RTC_WAKEUP,
            triggerAtMillis,
            pendingIntent
        );
        
        Log.i(TAG, "MidnightScheduler: Scheduled for " + calendar.getTime());
    }
    
    /**
     * Cancel the midnight alarm
     */
    public static void cancelMidnightAlarm(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        if (alarmManager == null) return;
        
        Intent intent = new Intent(context, MidnightScheduler.class);
        intent.setAction(ACTION_MIDNIGHT_RESCHEDULE);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context,
            9001,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        alarmManager.cancel(pendingIntent);
        Log.i(TAG, "MidnightScheduler: Cancelled midnight alarm");
    }
}
