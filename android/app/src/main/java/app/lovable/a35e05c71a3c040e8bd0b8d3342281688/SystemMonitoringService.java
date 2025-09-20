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

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;

public class SystemMonitoringService extends Service {
  private static final String CHANNEL_ID = "flowlight_monitor";
  private static final int NOTIF_ID = 98765;

  private Handler handler;
  private Runnable pollTask;
  private String lastPackage;

  @Override
  public void onCreate() {
    super.onCreate();
    createNotificationChannel();
    Notification notification = new NotificationCompat.Builder(this, CHANNEL_ID)
      .setContentTitle("FlowLight monitoring active")
      .setContentText("Keeping you mindful across apps")
      .setSmallIcon(getApplicationInfo().icon)
      .setOngoing(true)
      .build();
    startForeground(NOTIF_ID, notification);

    handler = new Handler();
    pollTask = new Runnable() {
      @Override
      public void run() {
        try {
          String current = getForegroundAppPackage();
          if (current != null && !current.equals(lastPackage)) {
            lastPackage = current;
            String appName = getAppName(current);
            Intent i = new Intent("FLOWLIGHT_APP_CHANGED");
            i.putExtra("package", current);
            i.putExtra("appName", appName);
            sendBroadcast(i);
          }
        } catch (Exception ignored) {}
        handler.postDelayed(this, 5000); // poll every 5s
      }
    };
    handler.post(pollTask);
  }

  @Override
  public int onStartCommand(Intent intent, int flags, int startId) {
    return START_STICKY;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
    if (handler != null && pollTask != null) {
      handler.removeCallbacks(pollTask);
    }
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
}
