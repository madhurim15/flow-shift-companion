package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Build;
import android.os.PowerManager;
import android.util.Log;

import androidx.core.app.NotificationCompat;

import java.util.Calendar;

/**
 * Native AlarmManager-based daily reminder scheduler.
 * Schedules 4 daily notifications (morning, afternoon, evening, night) that work even when app is closed.
 * Uses setExactAndAllowWhileIdle() to ensure alarms fire reliably through Doze mode.
 */
public class DailyReminderScheduler extends BroadcastReceiver {
    private static final String TAG = "FlowFocus";
    private static final String PREFS_NAME = "flowfocus_daily_reminders";
    private static final String CHANNEL_ID = "flowfocus_daily_reminder";
    
    // Request codes for each reminder type
    public static final int MORNING_REQUEST_CODE = 1001;
    public static final int AFTERNOON_REQUEST_CODE = 1002;
    public static final int EVENING_REQUEST_CODE = 1003;
    public static final int NIGHT_REQUEST_CODE = 1004;
    
    // Notification IDs
    public static final int MORNING_NOTIF_ID = 2001;
    public static final int AFTERNOON_NOTIF_ID = 2002;
    public static final int EVENING_NOTIF_ID = 2003;
    public static final int NIGHT_NOTIF_ID = 2004;
    
    // Default times (HH:mm format)
    public static final String DEFAULT_MORNING = "09:00";
    public static final String DEFAULT_AFTERNOON = "13:00";
    public static final String DEFAULT_EVENING = "18:00";
    public static final String DEFAULT_NIGHT = "21:00";
    
    // Reminder messages
    private static final String[] MORNING_MESSAGES = {
        "Good morning! 🌅 How are you feeling today?",
        "Rise and shine! ☀️ Let's set an intention for today.",
        "New day, fresh start! 🌻 Take a moment to check in.",
        "Morning! 🌄 What's one thing you want to accomplish today?"
    };
    
    private static final String[] AFTERNOON_MESSAGES = {
        "Afternoon check-in 🌤️ How's your day going?",
        "Mid-day pause ⏸️ Time for a mindful moment.",
        "Hey there! 👋 Taking a breath?",
        "Quick check-in 📝 How are you feeling right now?"
    };
    
    private static final String[] EVENING_MESSAGES = {
        "Evening reflection 🌆 How was your day?",
        "Winding down 🌇 Take a moment to reflect.",
        "Day's almost done 🌙 How are you feeling?",
        "Evening pause 🍂 Time to check in with yourself."
    };
    
    private static final String[] NIGHT_MESSAGES = {
        "Night check-in 🌙 How did today go?",
        "Before bed 😴 One thing you're grateful for?",
        "Goodnight soon 🌟 How are you feeling?",
        "End of day reflection ✨ What went well today?"
    };
    
    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) {
            action = intent.getStringExtra("reminder_type");
        }
        
        Log.i(TAG, "DailyReminderScheduler.onReceive: " + action);
        
        if (action != null) {
            // Acquire wake lock to ensure notification is shown
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wakeLock = pm.newWakeLock(
                PowerManager.PARTIAL_WAKE_LOCK,
                "FlowFocus::DailyReminderWakeLock"
            );
            wakeLock.acquire(10000);
            
            try {
                showReminderNotification(context, action);
                // Reschedule this reminder for tomorrow
                rescheduleReminder(context, action);
            } finally {
                if (wakeLock.isHeld()) {
                    wakeLock.release();
                }
            }
        }
    }
    
    /**
     * Schedule all 4 daily reminders using native AlarmManager
     */
    public static void scheduleAllReminders(Context context) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        String morningTime = prefs.getString("morning_time", DEFAULT_MORNING);
        String afternoonTime = prefs.getString("afternoon_time", DEFAULT_AFTERNOON);
        String eveningTime = prefs.getString("evening_time", DEFAULT_EVENING);
        String nightTime = prefs.getString("night_time", DEFAULT_NIGHT);
        
        Log.i(TAG, "Scheduling all daily reminders - M:" + morningTime + " A:" + afternoonTime + " E:" + eveningTime + " N:" + nightTime);
        
        scheduleReminder(context, "morning", morningTime, MORNING_REQUEST_CODE);
        scheduleReminder(context, "afternoon", afternoonTime, AFTERNOON_REQUEST_CODE);
        scheduleReminder(context, "evening", eveningTime, EVENING_REQUEST_CODE);
        scheduleReminder(context, "night", nightTime, NIGHT_REQUEST_CODE);
        
        // Create notification channel
        createNotificationChannel(context);
    }
    
    /**
     * Save user's preferred reminder times
     */
    public static void saveReminderTimes(Context context, String morning, String afternoon, String evening, String night) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = prefs.edit();
        
        if (morning != null) editor.putString("morning_time", morning);
        if (afternoon != null) editor.putString("afternoon_time", afternoon);
        if (evening != null) editor.putString("evening_time", evening);
        if (night != null) editor.putString("night_time", night);
        
        editor.apply();
        Log.i(TAG, "Saved reminder times - M:" + morning + " A:" + afternoon + " E:" + evening + " N:" + night);
        
        // Reschedule with new times
        scheduleAllReminders(context);
    }
    
    /**
     * Cancel all scheduled reminders
     */
    public static void cancelAllReminders(Context context) {
        AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
        
        cancelReminder(context, alarmManager, "morning", MORNING_REQUEST_CODE);
        cancelReminder(context, alarmManager, "afternoon", AFTERNOON_REQUEST_CODE);
        cancelReminder(context, alarmManager, "evening", EVENING_REQUEST_CODE);
        cancelReminder(context, alarmManager, "night", NIGHT_REQUEST_CODE);
        
        Log.i(TAG, "Cancelled all daily reminders");
    }
    
    private static void cancelReminder(Context context, AlarmManager alarmManager, String type, int requestCode) {
        Intent intent = new Intent(context, DailyReminderScheduler.class);
        intent.putExtra("reminder_type", type);
        
        PendingIntent pendingIntent = PendingIntent.getBroadcast(
            context, requestCode, intent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        alarmManager.cancel(pendingIntent);
    }
    
    private static void scheduleReminder(Context context, String type, String timeStr, int requestCode) {
        try {
            String[] parts = timeStr.split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            
            Calendar calendar = Calendar.getInstance();
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            
            // If time has already passed today, schedule for tomorrow
            if (calendar.getTimeInMillis() <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1);
            }
            
            Intent intent = new Intent(context, DailyReminderScheduler.class);
            intent.putExtra("reminder_type", type);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            
            // Use setExactAndAllowWhileIdle for reliable delivery through Doze
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            }
            
            Log.i(TAG, "Scheduled " + type + " reminder for " + calendar.getTime());
        } catch (Exception e) {
            Log.e(TAG, "Failed to schedule " + type + " reminder", e);
        }
    }
    
    private void rescheduleReminder(Context context, String type) {
        SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
        
        String timeStr;
        int requestCode;
        
        switch (type) {
            case "morning":
                timeStr = prefs.getString("morning_time", DEFAULT_MORNING);
                requestCode = MORNING_REQUEST_CODE;
                break;
            case "afternoon":
                timeStr = prefs.getString("afternoon_time", DEFAULT_AFTERNOON);
                requestCode = AFTERNOON_REQUEST_CODE;
                break;
            case "evening":
                timeStr = prefs.getString("evening_time", DEFAULT_EVENING);
                requestCode = EVENING_REQUEST_CODE;
                break;
            case "night":
                timeStr = prefs.getString("night_time", DEFAULT_NIGHT);
                requestCode = NIGHT_REQUEST_CODE;
                break;
            default:
                return;
        }
        
        // Schedule for tomorrow at the same time
        try {
            String[] parts = timeStr.split(":");
            int hour = Integer.parseInt(parts[0]);
            int minute = Integer.parseInt(parts[1]);
            
            Calendar calendar = Calendar.getInstance();
            calendar.add(Calendar.DAY_OF_YEAR, 1); // Tomorrow
            calendar.set(Calendar.HOUR_OF_DAY, hour);
            calendar.set(Calendar.MINUTE, minute);
            calendar.set(Calendar.SECOND, 0);
            calendar.set(Calendar.MILLISECOND, 0);
            
            Intent intent = new Intent(context, DailyReminderScheduler.class);
            intent.putExtra("reminder_type", type);
            
            PendingIntent pendingIntent = PendingIntent.getBroadcast(
                context, requestCode, intent,
                PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
            );
            
            AlarmManager alarmManager = (AlarmManager) context.getSystemService(Context.ALARM_SERVICE);
            
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.getTimeInMillis(),
                    pendingIntent
                );
            }
            
            Log.i(TAG, "Rescheduled " + type + " reminder for tomorrow: " + calendar.getTime());
        } catch (Exception e) {
            Log.e(TAG, "Failed to reschedule " + type + " reminder", e);
        }
    }
    
    private void showReminderNotification(Context context, String type) {
        String title = "FlowFocus Check-in";
        String message;
        int notifId;
        
        // Get random message for this reminder type
        int randomIndex = (int) (Math.random() * 4);
        
        switch (type) {
            case "morning":
                title = "Good Morning! ☀️";
                message = MORNING_MESSAGES[randomIndex];
                notifId = MORNING_NOTIF_ID;
                break;
            case "afternoon":
                title = "Afternoon Check-in 🌤️";
                message = AFTERNOON_MESSAGES[randomIndex];
                notifId = AFTERNOON_NOTIF_ID;
                break;
            case "evening":
                title = "Evening Reflection 🌆";
                message = EVENING_MESSAGES[randomIndex];
                notifId = EVENING_NOTIF_ID;
                break;
            case "night":
                title = "Night Check-in 🌙";
                message = NIGHT_MESSAGES[randomIndex];
                notifId = NIGHT_NOTIF_ID;
                break;
            default:
                return;
        }
        
        // Create intent to open app at mood check
        Intent openIntent = new Intent(Intent.ACTION_VIEW);
        openIntent.setData(Uri.parse("flowfocus://action/mood"));
        openIntent.setPackage(context.getPackageName());
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        openIntent.setClassName(context, "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.MainActivity");
        
        PendingIntent pendingIntent = PendingIntent.getActivity(
            context, notifId, openIntent,
            PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
        );
        
        // Build notification
        NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(message)
            .setSmallIcon(context.getApplicationInfo().icon)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setSound(android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION))
            .setVibrate(new long[]{0, 300, 150, 300});
        
        // Add "Check In" action button
        builder.addAction(0, "😊 Check In", pendingIntent);
        
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.notify(notifId, builder.build());
        
        Log.i(TAG, "Showed " + type + " reminder notification: " + message);
    }
    
    private static void createNotificationChannel(Context context) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
            
            // Delete and recreate to ensure settings are applied
            if (nm.getNotificationChannel(CHANNEL_ID) != null) {
                nm.deleteNotificationChannel(CHANNEL_ID);
            }
            
            NotificationChannel channel = new NotificationChannel(
                CHANNEL_ID,
                "Daily Check-in Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            channel.setDescription("Gentle reminders to check in throughout your day");
            channel.enableVibration(true);
            channel.setVibrationPattern(new long[]{0, 300, 150, 300});
            channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
            channel.setSound(
                android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION),
                new android.media.AudioAttributes.Builder()
                    .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
            );
            
            nm.createNotificationChannel(channel);
            Log.i(TAG, "Created daily reminder notification channel");
        }
    }
}
