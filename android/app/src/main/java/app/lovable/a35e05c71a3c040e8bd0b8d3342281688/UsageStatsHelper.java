package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.Activity;
import android.app.AppOpsManager;
import android.app.usage.UsageEvents;
import android.app.usage.UsageStatsManager;
import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.provider.Settings;

public class UsageStatsHelper {
  
  /**
   * Check if the app has Usage Stats permission using AppOps and UsageStatsManager fallback
   */
  public static boolean hasUsageStatsPermission(Context context) {
    try {
      AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
      int mode;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        mode = appOps.unsafeCheckOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS, 
          android.os.Process.myUid(), 
          context.getPackageName()
        );
      } else {
        mode = appOps.checkOpNoThrow(
          AppOpsManager.OPSTR_GET_USAGE_STATS, 
          android.os.Process.myUid(), 
          context.getPackageName()
        );
      }
      
      if (mode == AppOpsManager.MODE_ALLOWED) {
        return true;
      }
      
      // Fallback check for Samsung/OEM devices where AppOps might be unreliable
      try {
        UsageStatsManager usageStatsManager = 
          (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long startTime = endTime - 60000; // Last 60 seconds
        UsageEvents events = usageStatsManager.queryEvents(startTime, endTime);
        // If we can query events without exception, permission is granted
        return events != null;
      } catch (Exception fallbackException) {
        // If both AppOps and UsageStatsManager fail, no permission
        return false;
      }
    } catch (Exception e) {
      return false;
    }
  }

  /**
   * Open Usage Access settings screen with fallbacks for different OEMs
   */
  public static void openUsageAccessSettings(Activity activity, Context ctx) {
    boolean opened = false;

    // Try direct Usage Access settings
    try {
      Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
      if (activity != null) {
        activity.startActivity(intent);
      } else {
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        ctx.startActivity(intent);
      }
      opened = true;
    } catch (Exception e) { /* fallback below */ }

    // Fallback: general security settings (some OEMs route from here)
    if (!opened) {
      try {
        Intent intent = new Intent(Settings.ACTION_SECURITY_SETTINGS);
        if (activity != null) {
          activity.startActivity(intent);
        } else {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          ctx.startActivity(intent);
        }
        opened = true;
      } catch (Exception e) { /* fallback below */ }
    }

    // Last resort: app details -> user can navigate to "Special app access" > "Usage data access"
    if (!opened) {
      try {
        Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.fromParts("package", ctx.getPackageName(), null));
        if (activity != null) {
          activity.startActivity(intent);
        } else {
          intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
          ctx.startActivity(intent);
        }
      } catch (Exception e) {
        // Could not open any settings screen
      }
    }
  }

  /**
   * Get the currently foreground app package using UsageStatsManager
   */
  public static String getForegroundAppPackage(Context context) {
    try {
      UsageStatsManager usageStatsManager = 
        (UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
      long endTime = System.currentTimeMillis();
      long startTime = endTime - 5000; // Last 5 seconds

      UsageEvents events = usageStatsManager.queryEvents(startTime, endTime);
      UsageEvents.Event event = new UsageEvents.Event();
      String foregroundApp = null;

      while (events.hasNextEvent()) {
        events.getNextEvent(event);
        if (event.getEventType() == UsageEvents.Event.MOVE_TO_FOREGROUND) {
          foregroundApp = event.getPackageName();
        }
      }

      return foregroundApp;
    } catch (Exception e) {
      return null;
    }
  }
}
