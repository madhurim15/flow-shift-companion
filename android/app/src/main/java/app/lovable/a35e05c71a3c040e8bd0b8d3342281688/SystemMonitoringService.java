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
import android.content.SharedPreferences;
import java.util.Calendar;
import java.util.HashSet;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;

// Daily usage tracking class
class DailyAppUsage {
  int totalSeconds = 0;
  int lastNudgeLevel = 0;
  long lastSessionStart = 0;
  String date = "";
  
  DailyAppUsage(String date) {
    this.date = date;
  }
}

public class SystemMonitoringService extends Service {
  // Excluded launcher and system UI packages
  private static final Set<String> EXCLUDED_PACKAGES = new HashSet<String>() {{
    add("com.oneplus.launcher");
    add("com.sec.android.app.launcher");
    add("com.samsung.android.oneui.home");
    add("com.miui.home");
    add("com.huawei.android.launcher");
    add("com.oppo.launcher");
    add("com.google.android.apps.nexuslauncher");
    add("com.teslacoilsw.launcher");
    add("com.android.systemui");
    add("com.android.launcher");
    add("com.android.launcher3");
  }};
  private static final String CHANNEL_ID = "flowfocus_monitor";
  private static final String NUDGE_CHANNEL_ID = "flowfocus_nudge";
  private static final int NOTIF_ID = 98765;
  private static final int NUDGE_NOTIF_ID = 98766;
  private static final int META_NUDGE_NOTIF_ID = 98767;
  
  // Guard against double-start (Samsung stability fix)
  public static volatile boolean isRunning = false;

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
  
  // Daily cumulative usage tracking
  private Map<String, DailyAppUsage> dailyUsageMap = new HashMap<>();
  private String currentDate = getTodayDate();
  
  // Per-session nudge state
  private int lastNudgeLevel = 0;
  private long nextAllowedNudgeTime = 0;
  private int dismissalCount = 0;
  
  // Total daily screen time tracking for meta-nudges
  private int totalDailyScreenTimeSeconds = 0;
  private int lastMetaNudgeLevel = 0;
  private long lastMetaNudgeTime = 0;
  private static final int[] META_THRESHOLDS = {
    60 * 60,      // 1 hour total
    2 * 60 * 60,  // 2 hours total
    3 * 60 * 60   // 3 hours total
  };
  
  private static String getTodayDate() {
    Calendar cal = Calendar.getInstance();
    return String.format("%04d-%02d-%02d", 
      cal.get(Calendar.YEAR), 
      cal.get(Calendar.MONTH) + 1, 
      cal.get(Calendar.DAY_OF_MONTH));
  }
  
  private BroadcastReceiver nudgeActionReceiver = new BroadcastReceiver() {
    @Override
    public void onReceive(Context context, Intent intent) {
      String action = intent.getAction();
      if ("FLOWFOCUS_NUDGE_SNOOZED".equals(action)) {
        // Snooze for 5 minutes
        nextAllowedNudgeTime = System.currentTimeMillis() + (5 * 60 * 1000);
      } else if ("FLOWFOCUS_NUDGE_DISMISSED".equals(action)) {
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
        
        // Save current session before terminating
        if (lastPackage != null && sessionStartTime > 0) {
          long sessionDuration = (System.currentTimeMillis() - sessionStartTime) / 1000;
          saveDailyUsage(lastPackage, (int) sessionDuration, lastNudgeLevel);
          Log.d("FlowFocus", "Screen OFF - saved session: " + sessionDuration + "s");
        }
        
        // Terminate active session when screen goes off
        lastPackage = null;
        sessionStartTime = 0;
        currentAppName = null;
        Log.d("FlowFocus", "Screen OFF - session terminated");
      } else if (Intent.ACTION_SCREEN_ON.equals(action)) {
        isScreenOn = true;
        Log.d("FlowFocus", "Screen ON - resuming tracking");
      }
    }
  };

  @Override
  public void onCreate() {
    super.onCreate();
    isRunning = true;
    Log.i("FlowFocus", "SystemMonitoringService.onCreate called (isRunning=true)");
    createNotificationChannel();
    createNudgeNotificationChannel();
    
    powerManager = (PowerManager) getSystemService(Context.POWER_SERVICE);
    
    // Register receiver for screen state changes
    IntentFilter screenFilter = new IntentFilter();
    screenFilter.addAction(Intent.ACTION_SCREEN_ON);
    screenFilter.addAction(Intent.ACTION_SCREEN_OFF);
    
    ContextCompat.registerReceiver(
      this,
      screenStateReceiver,
      screenFilter,
      ContextCompat.RECEIVER_NOT_EXPORTED
    );
    Log.i("FlowFocus", "Registered screenStateReceiver with ContextCompat");
    
    // Register receiver for nudge actions
    IntentFilter actionFilter = new IntentFilter();
    actionFilter.addAction("FLOWFOCUS_NUDGE_SNOOZED");
    actionFilter.addAction("FLOWFOCUS_NUDGE_DISMISSED");
    
    ContextCompat.registerReceiver(
      this,
      nudgeActionReceiver,
      actionFilter,
      ContextCompat.RECEIVER_NOT_EXPORTED
    );
    Log.i("FlowFocus", "Registered nudgeActionReceiver with ContextCompat");
    
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("FlowFocus monitoring active")
      .setContentText("Keeping you mindful across apps")
      .setSmallIcon(getApplicationInfo().icon)
      .setOngoing(true)
      .build();
    
    try {
      startForeground(NOTIF_ID, notification);
      Log.i("FlowFocus", "startForeground SUCCESS - notification should be visible");
    } catch (Exception e) {
      Log.e("FlowFocus", "startForeground FAILED", e);
    }

    handler = new Handler();
    
    // Poll for app changes every 5 seconds
    pollTask = new Runnable() {
      @Override
      public void run() {
        try {
          // Check if date changed (midnight reset)
          String today = getTodayDate();
          if (!today.equals(currentDate)) {
            Log.d("FlowFocus", "Date changed - clearing daily usage map and resetting meta-nudge tracking");
            dailyUsageMap.clear();
            totalDailyScreenTimeSeconds = 0;
            lastMetaNudgeLevel = 0;
            lastMetaNudgeTime = 0;
            currentDate = today;
          }
          
          String current = getForegroundAppPackage();
          // Skip if launcher/system UI or null
          if (current != null && !current.equals(lastPackage)) {
            // Stabilization: wait 750ms and re-check to ensure app is truly in foreground
            final String detectedPackage = current;
            handler.postDelayed(new Runnable() {
              @Override
              public void run() {
                String recheck = getForegroundAppPackage();
                if (recheck != null && recheck.equals(detectedPackage)) {
                  // App is stable, commit the change
                  // Save previous app's session time to daily map
                  if (lastPackage != null && sessionStartTime > 0) {
                    long sessionDuration = (System.currentTimeMillis() - sessionStartTime) / 1000;
                    saveDailyUsage(lastPackage, (int) sessionDuration, lastNudgeLevel);
                    Log.d("FlowFocus", "Saved " + lastPackage + " session: " + sessionDuration + "s, level: " + lastNudgeLevel);
                  }
                  
                  lastPackage = detectedPackage;
                  String appName = getAppName(detectedPackage);
                  currentAppName = appName;
                  sessionStartTime = System.currentTimeMillis();
                  
                  // Restore nudge state from daily map
                  DailyAppUsage usage = dailyUsageMap.get(detectedPackage);
                  if (usage != null) {
                    lastNudgeLevel = usage.lastNudgeLevel;
                    Log.d("FlowFocus", "Restored nudge level " + lastNudgeLevel + " for " + detectedPackage + " (total: " + usage.totalSeconds + "s)");
                  } else {
                    lastNudgeLevel = 0;
                  }
                  nextAllowedNudgeTime = 0;
                  dismissalCount = 0;
                  
                  Log.d("FlowFocus", "App changed to (verified): " + detectedPackage + " -> " + appName);
                  
                  Intent i = new Intent("FLOWFOCUS_APP_CHANGED");
                  i.putExtra("package", detectedPackage);
                  i.putExtra("appName", appName);
                  sendBroadcast(i);
                } else {
                  Log.d("FlowFocus", "App change from " + detectedPackage + " to " + recheck + " - unstable, ignoring");
                }
              }
            }, 750);
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
            
            Intent i = new Intent("FLOWFOCUS_DURATION_UPDATE");
            i.putExtra("package", lastPackage);
            i.putExtra("appName", currentAppName);
            i.putExtra("durationSeconds", durationSeconds);
            sendBroadcast(i);
            
            // Track total daily screen time
            totalDailyScreenTimeSeconds += 30; // Add 30 seconds for each interval
            
            // Check for meta-nudges based on overall usage
            checkForMetaNudge();
            
            // Check for per-app nudge intervention
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
      Log.d("FlowFocus", "Service started with userName: " + userName + ", debug: " + debugMode);
    }
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    isRunning = false;
    Log.i("FlowFocus", "SystemMonitoringService.onDestroy called (isRunning=false)");
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
        "FlowFocus Monitoring",
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
        "FlowFocus Nudges",
        NotificationManager.IMPORTANCE_HIGH
      );
      channel.setDescription("Mindful nudges that appear as heads-up notifications");
      channel.enableVibration(true);
      channel.setVibrationPattern(new long[]{0, 300, 200, 300}); // Custom vibration pattern
      channel.enableLights(true);
      channel.setLightColor(0xFF488AFF);
      channel.setShowBadge(true);
      channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC); // Show on lock screen
      channel.setBypassDnd(false); // Respect DND settings
      // Enable sound for nudge notifications
      channel.setSound(
        android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION),
        new android.media.AudioAttributes.Builder()
          .setUsage(android.media.AudioAttributes.USAGE_NOTIFICATION_EVENT)
          .setContentType(android.media.AudioAttributes.CONTENT_TYPE_SONIFICATION)
          .build()
      );
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
    
    // Exclude launcher and system UI packages
    if (lastPkg != null) {
      if (EXCLUDED_PACKAGES.contains(lastPkg) || 
          lastPkg.toLowerCase().contains("launcher") ||
          lastPkg.equals(getPackageName())) {
        Log.d("FlowFocus", "Excluding package from tracking: " + lastPkg);
        return null;
      }
    }
    
    return lastPkg;
  }

  // Helper to save daily usage
  private void saveDailyUsage(String packageName, int sessionSeconds, int nudgeLevel) {
    DailyAppUsage usage = dailyUsageMap.get(packageName);
    if (usage == null) {
      usage = new DailyAppUsage(currentDate);
      dailyUsageMap.put(packageName, usage);
    }
    usage.totalSeconds += sessionSeconds;
    usage.lastNudgeLevel = nudgeLevel;
  }

  private String getAppName(String pkg) {
    Log.d("FlowFocus", "Getting app name for package: " + pkg);
    
    // 1. Check hardcoded map first for common apps
    java.util.Map<String, String> knownApps = new java.util.HashMap<>();
    knownApps.put("com.google.android.youtube", "YouTube");
    knownApps.put("com.google.android.apps.youtube.music", "YouTube Music");
    knownApps.put("com.google.android.youtube.tv", "YouTube TV");
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
      Log.d("FlowFocus", "Got app name from map: " + name + " for package: " + pkg);
      return name;
    }
    
    // 2. Try PackageManager
    try {
      PackageManager pm = getPackageManager();
      ApplicationInfo ai = pm.getApplicationInfo(pkg, 0);
      CharSequence label = pm.getApplicationLabel(ai);
      String name = label != null ? label.toString() : null;
      if (name != null && !name.isEmpty()) {
        Log.d("FlowFocus", "Got app name from PM: " + name + " for package: " + pkg);
        return name;
      }
    } catch (Exception e) {
      Log.e("FlowFocus", "Failed to get app name from PM for: " + pkg, e);
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
      Log.d("FlowFocus", "Skipping nudge check - screen is off");
      return;
    }
    
    AppThresholds.AppConfig config = AppThresholds.getAppConfig(packageName);
    int[] thresholds = debugMode ? config.debugThresholds : config.thresholds;
    
    // Calculate cumulative duration (daily total + current session)
    DailyAppUsage usage = dailyUsageMap.get(packageName);
    int cumulativeDuration = durationSeconds;
    if (usage != null) {
      cumulativeDuration = usage.totalSeconds + durationSeconds;
    }
    
    Log.d("FlowFocus", "Nudge check for " + appName + " - session: " + durationSeconds + "s, cumulative: " + cumulativeDuration + "s, lastLevel: " + lastNudgeLevel);
    
    // Find current level based on CUMULATIVE duration
    int newLevel = 0;
    for (int i = 0; i < thresholds.length; i++) {
      if (cumulativeDuration >= thresholds[i]) {
        newLevel = i + 1;
      }
    }

    long now = System.currentTimeMillis();
    
    if (newLevel > lastNudgeLevel && now >= nextAllowedNudgeTime) {
      Log.d("FlowFocus", "Showing level " + newLevel + " nudge (cumulative: " + cumulativeDuration + "s)");
      showNudgeNotification(packageName, appName, newLevel, cumulativeDuration, config.psychState);
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
    // Get suggested actions from message (3rd element if present)
    String suggestedActions = messageData.length > 2 ? messageData[2] : "";
    
    // Get contextual actions from ActionSelectionEngine
    Calendar cal = Calendar.getInstance();
    int hour = cal.get(Calendar.HOUR_OF_DAY);
    int minutes = durationSeconds / 60;
    
    // Get action suggestions based on context AND message's suggested actions
    java.util.List<ActionSelectionEngine.ActionButton> actions = 
        ActionSelectionEngine.getContextualActions(level, psychState, minutes, hour, new String[]{}, suggestedActions);
    
    // Personalize message with placeholders
    String durationStr = minutes + " minute" + (minutes == 1 ? "" : "s");
    String personalizedMessage = messageTemplate
      .replace("{name}", userName)
      .replace("{app}", appName)
      .replace("{duration}", durationStr);
    
    // Build notification with action buttons
    // Add sound to notification
    android.net.Uri soundUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION);
    
    NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NUDGE_CHANNEL_ID)
      .setContentTitle(title)
      .setContentText(personalizedMessage)
      .setStyle(new NotificationCompat.BigTextStyle().bigText(personalizedMessage))
      .setSmallIcon(getApplicationInfo().icon)
      .setPriority(NotificationCompat.PRIORITY_MAX)  // Maximum priority for heads-up
      .setCategory(NotificationCompat.CATEGORY_ALARM)  // ALARM category for maximum prominence
      .setAutoCancel(true)
      .setOngoing(false)
      .setSound(soundUri)
      .setVibrate(new long[]{0, 300, 200, 300})  // Vibration pattern: wait, vibrate, pause, vibrate
      .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)  // Show on lock screen
      .setDefaults(NotificationCompat.DEFAULT_LIGHTS);  // Enable LED lights
      // Removed setTimeoutAfter to keep notification in tray until user dismisses
    
    // Add action buttons (limit to 2 for better visibility)
    int actionCount = Math.min(2, actions.size());
    for (int i = 0; i < actionCount; i++) {
      ActionSelectionEngine.ActionButton action = actions.get(i);
      
      // Create deep link intent for this action
      Intent actionIntent = new Intent(this, NudgeActions.class);
      
      // Map deep link to action constant
      if (action.deepLink.equals("mood")) {
        actionIntent.setAction(NudgeActions.ACTION_MOOD);
      } else if (action.deepLink.equals("hydration")) {
        actionIntent.setAction(NudgeActions.ACTION_HYDRATION);
      } else if (action.deepLink.equals("eye-rest")) {
        actionIntent.setAction(NudgeActions.ACTION_EYE_REST);
      } else if (action.deepLink.equals("breathing")) {
        actionIntent.setAction(NudgeActions.ACTION_BREATHING);
      } else if (action.deepLink.equals("stretch")) {
        actionIntent.setAction(NudgeActions.ACTION_STRETCH);
      } else if (action.deepLink.equals("walk")) {
        actionIntent.setAction(NudgeActions.ACTION_WALK);
      } else if (action.deepLink.equals("standing")) {
        actionIntent.setAction(NudgeActions.ACTION_STANDING);
      } else if (action.deepLink.equals("journal")) {
        actionIntent.setAction(NudgeActions.ACTION_JOURNAL);
      } else if (action.deepLink.equals("voice")) {
        actionIntent.setAction(NudgeActions.ACTION_VOICE);
      } else if (action.deepLink.equals("photo")) {
        actionIntent.setAction(NudgeActions.ACTION_PHOTO);
      } else if (action.deepLink.equals("win")) {
        actionIntent.setAction(NudgeActions.ACTION_WIN);
      } else if (action.deepLink.equals("intention")) {
        actionIntent.setAction(NudgeActions.ACTION_INTENTION);
      } else if (action.deepLink.equals("gratitude")) {
        actionIntent.setAction(NudgeActions.ACTION_GRATITUDE);
      }
      
      PendingIntent actionPendingIntent = PendingIntent.getBroadcast(
        this, 100 + i, actionIntent,
        PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
      );
      
      builder.addAction(0, action.label, actionPendingIntent);
    }
    
    // Note: Dismiss button removed to keep notification action count minimal
    // Users can swipe to dismiss the notification instead
    
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    nm.notify(NUDGE_NOTIF_ID, builder.build());
    
    Log.d("FlowFocus", "Showed Level " + level + " nudge with " + actions.size() + " actions: " + title + " | User: " + userName);
  }
  
  private void checkForMetaNudge() {
    long now = System.currentTimeMillis();
    
    // Don't spam meta-nudges (minimum 30 min between)
    if (now - lastMetaNudgeTime < 30 * 60 * 1000) {
      return;
    }
    
    // Check which meta-threshold we've crossed
    int newMetaLevel = 0;
    for (int i = 0; i < META_THRESHOLDS.length; i++) {
      if (totalDailyScreenTimeSeconds >= META_THRESHOLDS[i]) {
        newMetaLevel = i + 1;
      }
    }
    
    // Show meta-nudge if we've reached a new level
    if (newMetaLevel > lastMetaNudgeLevel) {
      showMetaNudgeNotification(newMetaLevel, totalDailyScreenTimeSeconds);
      lastMetaNudgeLevel = newMetaLevel;
      lastMetaNudgeTime = now;
    }
  }
  
  private void showMetaNudgeNotification(int level, int totalSeconds) {
    String[] metaMessages = {
      "You've been on your phone for 1 hour today. Time for a real-world check-in? 🌍",
      "2 hours of screen time today, " + userName + ". Your eyes and mind might need a longer break 👀💭",
      "3 hours on your phone today. Let's talk about what you're really avoiding... 💜"
    };
    
    String message = metaMessages[Math.min(level - 1, metaMessages.length - 1)];
    int hours = totalSeconds / 3600;
    int minutes = (totalSeconds % 3600) / 60;
    
    // Create intent for opening the app
    Intent openIntent = getPackageManager().getLaunchIntentForPackage(getPackageName());
    if (openIntent != null) {
      openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
      openIntent.setData(Uri.parse("flowfocus://action/journal"));
    }
    
    PendingIntent pendingIntent = PendingIntent.getActivity(
      this, 0, openIntent,
      PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE
    );
    
    // Build meta-nudge notification
    String detailMessage = message + "\n\nTotal today: " + hours + "h " + minutes + "m";
    android.net.Uri soundUri = android.media.RingtoneManager.getDefaultUri(android.media.RingtoneManager.TYPE_NOTIFICATION);
    
    NotificationCompat.Builder builder = new NotificationCompat.Builder(this, NUDGE_CHANNEL_ID)
      .setContentTitle("Daily Screen Time Alert 📱")
      .setContentText(message)
      .setStyle(new NotificationCompat.BigTextStyle().bigText(detailMessage))
      .setSmallIcon(getApplicationInfo().icon)
      .setPriority(NotificationCompat.PRIORITY_MAX)
      .setCategory(NotificationCompat.CATEGORY_REMINDER)
      .setAutoCancel(true)
      .setSound(soundUri)
      .setContentIntent(pendingIntent);
    
    NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    nm.notify(META_NUDGE_NOTIF_ID, builder.build());
    
    Log.d("FlowFocus", "Showed meta-nudge level " + level + " - Total screen time: " + hours + "h " + minutes + "m");
  }
}
