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
    super.load();
    android.util.Log.i("FlowLight", "SystemMonitoringPlugin loaded");
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
          
          if ("FLOWLIGHT_APP_CHANGED".equals(action)) {
            notifyListeners("appChanged", data);
          } else if ("FLOWLIGHT_DURATION_UPDATE".equals(action)) {
            int durationSeconds = intent.getIntExtra("durationSeconds", 0);
            data.put("durationSeconds", durationSeconds);
            notifyListeners("durationUpdate", data);
          }
        }
      }
    };
    
    IntentFilter filter = new IntentFilter();
    filter.addAction("FLOWLIGHT_APP_CHANGED");
    filter.addAction("FLOWLIGHT_DURATION_UPDATE");
    getContext().registerReceiver(appChangeReceiver, filter);
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
    android.util.Log.i("FlowLight", "Plugin.hasUsageStatsPermission -> " + granted);
    JSObject ret = new JSObject();
    ret.put("granted", granted);
    call.resolve(ret);
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    boolean granted = UsageStatsHelper.hasUsageStatsPermission(getContext());
    android.util.Log.i("FlowLight", "Plugin.checkPermissions -> usageAccess=" + granted);
    JSObject ret = new JSObject();
    ret.put("usageAccess", granted);
    call.resolve(ret);
  }

  @PluginMethod
  public void startMonitoring(PluginCall call) {
    // Ensure Usage Access is granted before starting service
    if (!UsageStatsHelper.hasUsageStatsPermission(getContext())) {
      call.reject("Usage access permission not granted");
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
      android.util.Log.d("FlowLight", "Started monitoring with userName: " + userName + ", debug: " + debug);
      call.resolve();
    } catch (Exception e) {
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
      android.util.Log.e("FlowLight", "Failed to open battery optimization settings", e);
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
      android.util.Log.e("FlowLight", "Failed to open app settings", e);
      call.reject("Failed to open app settings: " + e.getMessage());
    }
  }

}