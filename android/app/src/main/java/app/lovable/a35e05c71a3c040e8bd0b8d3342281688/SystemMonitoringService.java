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
import android.os.PowerManager;
import android.net.Uri;
import android.util.Log;
import java.util.Calendar;

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
  private String userName = "friend";
  private PowerManager powerManager;
  private boolean isScreenOn = true;
  
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

  private BroadcastReceiver screenStateReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if (Intent.ACTION_SCREEN_OFF.equals(action)) {
        isScreenOn = false;
        Log.d("FlowLight", "Screen OFF - pausing tracking");
      } else if (Intent.ACTION_SCREEN_ON.equals(action)) {
        isScreenOn = true;
        Log.d("FlowLight", "Screen ON - resuming tracking");
      }
    }
  };

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
    createNudgeNotificationChannel();
    
    powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
    
    // Register receiver for screen state changes
    IntentFilter screenFilter = new IntentFilter();
    screenFilter.addAction(Intent.ACTION_SCREEN_ON);
    screenFilter.addAction(Intent.ACTION_SCREEN_OFF);
    registerReceiver(screenStateReceiver, screenFilter);
    
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
      userName = intent.getStringExtra("userName");
      if (userName == null || userName.isEmpty()) {
        userName = "friend";
      }
      Log.d("FlowLight", "Service started with userName: " + userName + ", debug: " + debugMode);
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
    try {
      unregisterReceiver(screenStateReceiver);
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
    // 1. Check hardcoded map first for common apps
    java.util.Map<String, String> knownApps = new java.util.HashMap<>();
    knownApps.put("com.google.android.youtube", "YouTube");
    knownApps.put("com.android.youtube", "YouTube");
    knownApps.put("com.android.youtube.com", "YouTube");
    knownApps.put("com.instagram.android", "Instagram");
    knownApps.put("com.zhiliaoapp.musically", "TikTok");
    knownApps.put("com.facebook.katana", "Facebook");
    knownApps.put("com.facebook.orca", "Messenger");
    knownApps.put("com.twitter.android", "Twitter");
    knownApps.put("com.snapchat.android", "Snapchat");
    knownApps.put("com.reddit.frontpage", "Reddit");
    knownApps.put("com.pinterest", "Pinterest");
    knownApps.put("com.linkedin.android", "LinkedIn");
    knownApps.put("com.whatsapp", "WhatsApp");
    knownApps.put("com.telegram.messenger", "Telegram");
    knownApps.put("com.netflix.mediaclient", "Netflix");
    knownApps.put("com.spotify.music", "Spotify");
    knownApps.put("com.amazon.mShop.android.shopping", "Amazon");
    knownApps.put("com.android.chrome", "Chrome");
    knownApps.put("com.discord", "Discord");
    knownApps.put("com.twitch.android.app", "Twitch");
    
    if (knownApps.containsKey(pkg)) {
      String name = knownApps.get(pkg);
      Log.d("FlowLight", "Got app name from map: " + name + " for package: " + pkg);
      return name;
    }
    
    // 2. Try PackageManager
    try {
      PackageManager pm = getPackageManager();
      ApplicationInfo ai = pm.getApplicationInfo(pkg, 0);
      CharSequence label = pm.getApplicationLabel(ai);
      String name = label != null ? label.toString() : null;
      if (name != null && !name.isEmpty()) {
        Log.d("FlowLight", "Got app name from PM: " + name + " for package: " + pkg);
        return name;
      }
    } catch (Exception e) {
      Log.e("FlowLight", "Failed to get app name from PM for: " + pkg, e);
    }
    
    // 3. Smart fallback: search for keywords in package name
    String lower = pkg.toLowerCase();
    if (lower.contains("youtube")) return "YouTube";
    if (lower.contains("instagram")) return "Instagram";
    if (lower.contains("tiktok") || lower.contains("musically")) return "TikTok";
    if (lower.contains("facebook")) return "Facebook";
    if (lower.contains("twitter")) return "Twitter";
    if (lower.contains("snapchat")) return "Snapchat";
    if (lower.contains("reddit")) return "Reddit";
    if (lower.contains("pinterest")) return "Pinterest";
    if (lower.contains("linkedin")) return "LinkedIn";
    if (lower.contains("whatsapp")) return "WhatsApp";
    if (lower.contains("telegram")) return "Telegram";
    if (lower.contains("netflix")) return "Netflix";
    if (lower.contains("spotify")) return "Spotify";
    if (lower.contains("amazon")) return "Amazon";
    if (lower.contains("chrome")) return "Chrome";
    if (lower.contains("discord")) return "Discord";
    if (lower.contains("twitch")) return "Twitch";
    
    // 4. Last resort: capitalize middle part
    return extractSimpleName(pkg);
  }
  
  private String extractSimpleName(String packageName) {
    // "com.instagram.android" -> "Instagram"
    String[] parts = packageName.split("\\.");
    String name = parts[parts.length - 1];
    if (name.equals("android") && parts.length > 1) {
      name = parts[parts.length - 2];
    }
    // Capitalize first letter
    return name.substring(0, 1).toUpperCase() + name.substring(1);
  }

  private void checkForNudge(String packageName, String appName, int durationSeconds) {
    // Only check nudges when screen is on
    if (!isScreenOn) {
      Log.d("FlowLight", "Skipping nudge check - screen is off");
      return;
    }
    
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
      showNudgeNotification(packageName, appName, newLevel, durationSeconds, config.psychState);
      lastNudgeLevel = newLevel;
      
      // Set next allowed nudge time based on dismissal count
      long cooldownMs = Math.max(60000, 300000 / (dismissalCount + 1));
      nextAllowedNudgeTime = now + cooldownMs;
    }
  }

  private void showNudgeNotification(String packageName, String appName, int level, int durationSeconds, String psychState) {
    // Get message with rotation (pass context for SharedPreferences)
    String[] messageData = AppThresholds.getNudgeMessage(this, level);
    String title = messageData[0];
    String messageTemplate = messageData[1];
    
    // Get time-aware suggested action
    Calendar cal = Calendar.getInstance();
    int hour = cal.get(Calendar.HOUR_OF_DAY);
    String suggestedAction = AppThresholds.getSuggestedAction(level, hour);
    
    // Personalize message with placeholders
    int minutes = durationSeconds / 60;
    String durationStr = minutes + " minute" + (minutes == 1 ? "" : "s");
    String personalizedMessage = messageTemplate
      .replace("{name}", userName)
      .replace("{app}", appName)
      .replace("{duration}", durationStr);
    
    // Create deep link intent for suggested action
    Intent openIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
    if (openIntent != null) {
      openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      openIntent.setData(Uri.parse("flowlight://action/" + suggestedAction));
    }
    
    PendingIntent pendingIntent = PendingIntent.getActivity(
      this, 0, openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
    
    // Build notification without action buttons
    NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NUDGE_CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(personalizedMessage)
      .setStyle(new NotificationCompat.BigTextStyle().bigText(personalizedMessage))
      .setSmallIcon(getApplicationInfo().icon)
      .setPriority(NotificationCompat.PRIORITY_HIGH)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setAutoCancel(true)
      .setContentIntent(pendingIntent);
    
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    nm.notify(NUDGE_NOTIF_ID, builder.build());
    
    Log.d("FlowLight", "Showed nudge: " + title + " | Action: " + suggestedAction + " | User: " + userName);
  }
}
