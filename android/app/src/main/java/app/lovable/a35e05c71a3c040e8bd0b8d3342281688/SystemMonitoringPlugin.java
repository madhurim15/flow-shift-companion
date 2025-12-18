package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.provider.Settings;
import android.net.Uri;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemMonitoring")
public class SystemMonitoringPlugin extends Plugin {
  private BroadcastReceiver appChangeReceiver;

  @Override
  public void load() {
    android.util.Log.w("FlowFocus", ">>> SystemMonitoringPlugin.load() CALLED <<<");
    try {
      super.load();
      android.util.Log.w("FlowFocus", ">>> SystemMonitoringPlugin.load() - super.load() completed on API " + Build.VERSION.SDK_INT + " <<<");
      
      // Register receiver for app change events
      appChangeReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
          String action = intent.getAction();
          String pkg = intent.getStringExtra("package");
          String appName = intent.getStringExtra("appName");
          
          if (pkg != null) {
            JSObject data = new JSObject();
            data.put("package", pkg);
            if (appName != null) {
              data.put("appName", appName);
            }
            
            if ("FLOWFOCUS_APP_CHANGED".equals(action)) {
              notifyListeners("appChanged", data);
            } else if ("FLOWFOCUS_DURATION_UPDATE".equals(action)) {
              int durationSeconds = intent.getIntExtra("durationSeconds", 0);
              data.put("durationSeconds", durationSeconds);
              notifyListeners("durationUpdate", data);
            }
          }
        }
      };
      
      IntentFilter filter = new IntentFilter();
      filter.addAction("FLOWFOCUS_APP_CHANGED");
      filter.addAction("FLOWFOCUS_DURATION_UPDATE");
      
      ContextCompat.registerReceiver(
        getContext(),
        appChangeReceiver,
        filter,
        ContextCompat.RECEIVER_NOT_EXPORTED
      );
      android.util.Log.w("FlowFocus", ">>> SystemMonitoringPlugin.load() COMPLETED SUCCESSFULLY <<<");
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", ">>> SystemMonitoringPlugin.load() FAILED <<<", e);
    }
  }

  @Override
  protected void handleOnDestroy() {
    super.handleOnDestroy();
    if (appChangeReceiver != null) {
      try {
        getContext().unregisterReceiver(appChangeReceiver);
      } catch (Exception ignored) {}
    }
  }

  @PluginMethod
  public void requestPermissions(PluginCall call) {
    Context ctx = getContext();
    boolean granted = UsageStatsHelper.hasUsageStatsPermission(ctx);

    if (!granted) {
      UsageStatsHelper.openUsageAccessSettings(getActivity(), ctx);
    }

    JSObject ret = new JSObject();
    ret.put("granted", UsageStatsHelper.hasUsageStatsPermission(ctx));
    call.resolve(ret);
  }

  @PluginMethod
  public void hasUsageStatsPermission(PluginCall call) {
    boolean granted = UsageStatsHelper.hasUsageStatsPermission(getContext());
    android.util.Log.i("FlowFocus", "Plugin.hasUsageStatsPermission -> " + granted);
    JSObject ret = new JSObject();
    ret.put("granted", granted);
    call.resolve(ret);
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    boolean granted = UsageStatsHelper.hasUsageStatsPermission(getContext());
    android.util.Log.i("FlowFocus", "Plugin.checkPermissions -> usageAccess=" + granted);
    JSObject ret = new JSObject();
    ret.put("usageAccess", granted);
    call.resolve(ret);
  }

  @PluginMethod
  public void startMonitoring(PluginCall call) {
    android.util.Log.i("FlowFocus", "Plugin.startMonitoring called");
    
    // Ensure Usage Access is granted before starting service
    if (!UsageStatsHelper.hasUsageStatsPermission(getContext())) {
      android.util.Log.e("FlowFocus", "startMonitoring: usage_access_denied");
      call.reject("usage_access_denied");
      return;
    }

    // Check notification permission on API 33+
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      boolean notificationsEnabled = ContextCompat.checkSelfPermission(
        getContext(),
        android.Manifest.permission.POST_NOTIFICATIONS
      ) == android.content.pm.PackageManager.PERMISSION_GRANTED;
      
      if (!notificationsEnabled) {
        android.util.Log.e("FlowFocus", "startMonitoring: notifications_denied");
        call.reject("notifications_denied");
        return;
      }
    }

    // Check if service is already running (idempotent start)
    if (SystemMonitoringService.isRunning) {
      android.util.Log.d("FlowFocus", "Service already running, skipping duplicate start");
      call.resolve();
      return;
    }

    Intent serviceIntent = new Intent(getContext(), SystemMonitoringService.class);

    // Pass debug flag and userName if provided
    boolean debug = call.getBoolean("debug", false);
    String userName = call.getString("userName", "friend");
    serviceIntent.putExtra("debug", debug);
    serviceIntent.putExtra("userName", userName);

    try {
      ContextCompat.startForegroundService(getContext(), serviceIntent);
      android.util.Log.d("FlowFocus", "Started monitoring with userName: " + userName + ", debug: " + debug);
      call.resolve();
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", "startMonitoring exception", e);
      call.reject("Failed to start monitoring: " + e.getMessage());
    }
  }

  @PluginMethod
  public void stopMonitoring(PluginCall call) {
    Intent serviceIntent = new Intent(getContext(), SystemMonitoringService.class);
    try {
      getContext().stopService(serviceIntent);
      call.resolve();
    } catch (Exception e) {
      call.reject("Failed to stop monitoring: " + e.getMessage());
    }
  }

  @PluginMethod
  public void openBatteryOptimizationSettings(PluginCall call) {
    try {
      Intent intent;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        intent = new Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      } else {
        // Fallback to app details for older versions
        intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
        intent.setData(Uri.parse("package:" + getContext().getPackageName()));
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      }
      getContext().startActivity(intent);
      call.resolve();
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", "Failed to open battery optimization settings", e);
      call.reject("Failed to open battery settings: " + e.getMessage());
    }
  }

  @PluginMethod
  public void openAppSettings(PluginCall call) {
    try {
      Intent intent = new Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS);
      intent.setData(Uri.parse("package:" + getContext().getPackageName()));
      intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
      getContext().startActivity(intent);
      call.resolve();
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", "Failed to open app settings", e);
      call.reject("Failed to open app settings: " + e.getMessage());
    }
  }

  @PluginMethod
  public void getStatus(PluginCall call) {
    android.util.Log.i("FlowFocus", "Plugin.getStatus called");
    
    JSObject ret = new JSObject();
    
    // Check usage access
    boolean usageAccess = UsageStatsHelper.hasUsageStatsPermission(getContext());
    ret.put("usageAccess", usageAccess);
    
    // Check notification permission (API 33+)
    boolean notificationsEnabled = true;
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      try {
        notificationsEnabled = ContextCompat.checkSelfPermission(
          getContext(),
          android.Manifest.permission.POST_NOTIFICATIONS
        ) == android.content.pm.PackageManager.PERMISSION_GRANTED;
      } catch (Exception e) {
        android.util.Log.e("FlowFocus", "Failed to check notification permission", e);
      }
    }
    ret.put("notificationsEnabled", notificationsEnabled);
    
    // Check if service is running
    boolean serviceRunning = SystemMonitoringService.isRunning;
    ret.put("serviceRunning", serviceRunning);
    
    android.util.Log.i("FlowFocus", "Plugin.getStatus -> usageAccess=" + usageAccess + 
                       ", notifications=" + notificationsEnabled + ", serviceRunning=" + serviceRunning);
    call.resolve(ret);
  }

  @PluginMethod
  public void restartMonitoring(PluginCall call) {
    android.util.Log.i("FlowFocus", "Plugin.restartMonitoring called");
    
    // Stop service first
    try {
      Intent stopIntent = new Intent(getContext(), SystemMonitoringService.class);
      getContext().stopService(stopIntent);
      android.util.Log.d("FlowFocus", "Service stop initiated");
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", "Failed to stop service", e);
    }
    
    // Small delay to ensure clean shutdown
    try {
      Thread.sleep(500);
    } catch (InterruptedException e) {
      android.util.Log.e("FlowFocus", "Sleep interrupted", e);
    }
    
    // Start service again
    if (!UsageStatsHelper.hasUsageStatsPermission(getContext())) {
      call.reject("Usage access permission not granted");
      return;
    }
    
    Intent startIntent = new Intent(getContext(), SystemMonitoringService.class);
    boolean debug = call.getBoolean("debug", false);
    String userName = call.getString("userName", "friend");
    startIntent.putExtra("debug", debug);
    startIntent.putExtra("userName", userName);
    
    try {
      ContextCompat.startForegroundService(getContext(), startIntent);
      android.util.Log.d("FlowFocus", "Service restart initiated");
      
      // Return status after restart
      JSObject ret = new JSObject();
      ret.put("restarted", true);
      call.resolve(ret);
    } catch (Exception e) {
      android.util.Log.e("FlowFocus", "Failed to restart service", e);
      call.reject("Failed to restart monitoring: " + e.getMessage());
    }
  }

  @PluginMethod
  public void scheduleMidnightReschedule(PluginCall call) {
    android.util.Log.i("FlowFocus", "scheduleMidnightReschedule called from JS");
    MidnightScheduler.scheduleMidnightAlarm(getContext());
    call.resolve();
  }

  @PluginMethod
  public void cancelMidnightReschedule(PluginCall call) {
    android.util.Log.i("FlowFocus", "cancelMidnightReschedule called from JS");
    MidnightScheduler.cancelMidnightAlarm(getContext());
    call.resolve();
  }

  @PluginMethod
  public void getBuildStamp(PluginCall call) {
    long buildStamp = MainActivity.getBuildStamp();
    android.util.Log.i("FlowFocus", "Plugin.getBuildStamp -> " + buildStamp);
    JSObject ret = new JSObject();
    ret.put("buildStamp", buildStamp);
    call.resolve(ret);
  }

  @PluginMethod
  public void setDailyReminderTimes(PluginCall call) {
    String morning = call.getString("morning", DailyReminderScheduler.DEFAULT_MORNING);
    String afternoon = call.getString("afternoon", DailyReminderScheduler.DEFAULT_AFTERNOON);
    String evening = call.getString("evening", DailyReminderScheduler.DEFAULT_EVENING);
    String night = call.getString("night", DailyReminderScheduler.DEFAULT_NIGHT);
    
    android.util.Log.i("FlowFocus", "setDailyReminderTimes: M=" + morning + " A=" + afternoon + " E=" + evening + " N=" + night);
    
    DailyReminderScheduler.saveReminderTimes(getContext(), morning, afternoon, evening, night);
    
    JSObject ret = new JSObject();
    ret.put("scheduled", true);
    call.resolve(ret);
  }

  @PluginMethod
  public void cancelDailyReminders(PluginCall call) {
    android.util.Log.i("FlowFocus", "cancelDailyReminders called");
    DailyReminderScheduler.cancelAllReminders(getContext());
    call.resolve();
  }

  @PluginMethod
  public void scheduleDailyReminders(PluginCall call) {
    android.util.Log.i("FlowFocus", "scheduleDailyReminders called");
    DailyReminderScheduler.scheduleAllReminders(getContext());
    call.resolve();
  }

}
