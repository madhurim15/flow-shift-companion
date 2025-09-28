package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.IntentFilter;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class SystemMonitoringService extends Service {
  private static final String CHANNEL_ID = "flowlight_monitor";
  private static final String NUDGE_CHANNEL_ID = "flowlight_nudge";
  private static final int NOTIF_ID = 98765;
  private static final int NUDGE_NOTIF_ID = 98766;

  private Handler handler;
  private Runnable pollTask;
  private Runnable durationTask;
  private String lastPackage;
  private long sessionStartTime;
  private String currentAppName;
  private boolean debugMode = false;
  
  // Per-session nudge state
  private int lastNudgeLevel = 0;
  private long nextAllowedNudgeTime = 0;
  private int dismissalCount = 0;
  
  private BroadcastReceiver nudgeActionReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if ("FLOWLIGHT_NUDGE_SNOOZED".equals(action)) {
        // Snooze for 5 minutes
        nextAllowedNudgeTime = System.currentTimeMillis() + (5 * 60 * 1000);
      } else if ("FLOWLIGHT_NUDGE_DISMISSED".equals(action)) {
        // Increase dismissal count and reduce future cooldowns
        dismissalCount++;
      }
    }
  };

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
    createNudgeNotificationChannel();
    
    // Register receiver for nudge actions
    IntentFilter actionFilter = new IntentFilter();
    actionFilter.addAction("FLOWLIGHT_NUDGE_SNOOZED");
    actionFilter.addAction("FLOWLIGHT_NUDGE_DISMISSED");
    registerReceiver(nudgeActionReceiver, actionFilter);
    
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("FlowLight monitoring active")
      .setContentText("Keeping you mindful across apps")
      .setSmallIcon(getApplicationInfo().icon)
      .setOngoing(true)
      .build();
    startForeground(NOTIF_ID, notification);

    handler = new Handler();
    
    // Poll for app changes every 5 seconds
    pollTask = new Runnable() {
      @Override
      public void run() {
        try {
          String current = getForegroundAppPackage();
          if (current != null && !current.equals(lastPackage)) {
            lastPackage = current;
            String appName = getAppName(current);
            currentAppName = appName;
            sessionStartTime = System.currentTimeMillis();
            
            // Reset nudge state for new app
            lastNudgeLevel = 0;
            nextAllowedNudgeTime = 0;
            dismissalCount = 0;
            
            Intent i = new Intent("FLOWLIGHT_APP_CHANGED");
            i.putExtra("package", current);
            i.putExtra("appName", appName);
            sendBroadcast(i);
          }
        } catch (Exception ignored) {}
        handler.postDelayed(this, 5000); // poll every 5s
      }
    };
    
    // Broadcast duration updates every 30 seconds for current app
    durationTask = new Runnable() {
      @Override
      public void run() {
        try {
          if (lastPackage != null && sessionStartTime > 0) {
            long currentTime = System.currentTimeMillis();
            int durationSeconds = (int) ((currentTime - sessionStartTime) / 1000);
            
            Intent i = new Intent("FLOWLIGHT_DURATION_UPDATE");
            i.putExtra("package", lastPackage);
            i.putExtra("appName", currentAppName);
            i.putExtra("durationSeconds", durationSeconds);
            sendBroadcast(i);
            
            // Check for nudge intervention
            checkForNudge(lastPackage, currentAppName, durationSeconds);
          }
        } catch (Exception ignored) {}
        handler.postDelayed(this, 30000); // broadcast every 30s
      }
    };
    
    handler.post(pollTask);
    handler.post(durationTask);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent != null) {
      debugMode = intent.getBooleanExtra("debug", false);
    }
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (handler != null) {
      if (pollTask != null) {
        handler.removeCallbacks(pollTask);
      }
      if (durationTask != null) {
        handler.removeCallbacks(durationTask);
      }
    }
    try {
      unregisterReceiver(nudgeActionReceiver);
    } catch (Exception ignored) {}
  }

  @Nullable
  @Override
  public IBinder onBind(Intent intent) {
    return null;
  }

  private void createNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        CHANNEL_ID,
        "FlowLight Monitoring",
        NotificationManager.IMPORTANCE_MIN
      );
      channel.setDescription("Background monitoring for mindful nudges");
      NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      nm.createNotificationChannel(channel);
    }
  }

  private void createNudgeNotificationChannel() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel(
        NUDGE_CHANNEL_ID,
        "FlowLight Nudges",
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Mindful nudges that appear as heads-up notifications");
      channel.enableVibration(true);
      channel.enableLights(true);
      channel.setLightColor(0xFF488AFF);
      channel.setShowBadge(true);
      NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
      nm.createNotificationChannel(channel);
    }
  }

  private String getForegroundAppPackage() {
    UsageStatsManager usm = (UsageStatsManager) getSystemService(Context.USAGE_STATS_SERVICE);
    long end = System.currentTimeMillis();
    long begin = end - 10000; // last 10s
    UsageEvents events = usm.queryEvents(begin, end);
    UsageEvents.Event event = new UsageEvents.Event();

    String lastPkg = null;
    long lastTime = 0;
    while (events.hasNextEvent()) {
      events.getNextEvent(event);
      int type = event.getEventType();
      if (type == UsageEvents.Event.MOVE_TO_FOREGROUND || (Build.VERSION.SDK_INT >= 29 && type == UsageEvents.Event.ACTIVITY_RESUMED)) {
        if (event.getTimeStamp() > lastTime) {
          lastTime = event.getTimeStamp();
          lastPkg = event.getPackageName();
        }
      }
    }
    return lastPkg;
  }

  private String getAppName(String pkg) {
    try {
      PackageManager pm = getPackageManager();
      ApplicationInfo ai = pm.getApplicationInfo(pkg, 0);
      CharSequence label = pm.getApplicationLabel(ai);
      return label != null ? label.toString() : pkg;
    } catch (Exception e) {
      return pkg;
    }
  }

  private void checkForNudge(String packageName, String appName, int durationSeconds) {
    AppThresholds.AppConfig config = AppThresholds.getAppConfig(packageName);
    int[] thresholds = debugMode ? config.debugThresholds : config.thresholds;
    
    // Find current level based on duration
    int newLevel = 0;
    for (int i = 0; i < thresholds.length; i++) {
      if (durationSeconds >= thresholds[i]) {
        newLevel = i + 1;
      }
    }

    long now = System.currentTimeMillis();
    
    if (newLevel > lastNudgeLevel && now >= nextAllowedNudgeTime) {
      showNudgeNotification(packageName, appName, newLevel, config.psychState);
      lastNudgeLevel = newLevel;
      
      // Set next allowed nudge time based on dismissal count
      long cooldownMs = Math.max(60000, 300000 / (dismissalCount + 1)); // 5min to 1min based on dismissals
      nextAllowedNudgeTime = now + cooldownMs;
    }
  }

  private void showNudgeNotification(String packageName, String appName, int level, String psychState) {
    String[] messageData = AppThresholds.getNudgeMessages(psychState, level);
    String title = messageData[0];
    String message = messageData[1];

    // Create action intents
    Intent snoozeIntent = new Intent(this, NudgeActions.class);
    snoozeIntent.setAction(NudgeActions.ACTION_SNOOZE);
    PendingIntent snoozePendingIntent = PendingIntent.getBroadcast(this, 0, snoozeIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Intent dismissIntent = new Intent(this, NudgeActions.class);
    dismissIntent.setAction(NudgeActions.ACTION_DISMISS);
    PendingIntent dismissPendingIntent = PendingIntent.getBroadcast(this, 1, dismissIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    Intent openIntent = new Intent(this, NudgeActions.class);
    openIntent.setAction(NudgeActions.ACTION_OPEN_APP);
    PendingIntent openPendingIntent = PendingIntent.getBroadcast(this, 2, openIntent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);

    NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NUDGE_CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(message)
      .setSmallIcon(getApplicationInfo().icon)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setAutoCancel(true)
      .setContentIntent(openPendingIntent)
      .addAction(R.drawable.ic_launcher_foreground, "Snooze 5min", snoozePendingIntent)
      .addAction(R.drawable.ic_launcher_foreground, "I'm OK", dismissPendingIntent);

    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    nm.notify(NUDGE_NOTIF_ID, builder.build());
  }
}
