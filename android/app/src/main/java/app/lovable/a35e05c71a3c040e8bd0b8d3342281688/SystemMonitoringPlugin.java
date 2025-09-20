package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.app.AppOpsManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.provider.Settings;

import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SystemMonitoring")
public class SystemMonitoringPlugin extends Plugin {
  private BroadcastReceiver appChangedReceiver;

  @Override
  public void load() {
    super.load();
    // Listen for broadcasts from the foreground service
    appChangedReceiver = new BroadcastReceiver() {
      @Override
      public void onReceive(Context context, Intent intent) {
        if ("FLOWLIGHT_APP_CHANGED".equals(intent.getAction())) {
          String pkg = intent.getStringExtra("package");
          String appName = intent.getStringExtra("appName");
          JSObject data = new JSObject();
          data.put("package", pkg);
          data.put("appName", appName);
          notifyListeners("appChanged", data);
        }
      }
    };
    IntentFilter filter = new IntentFilter("FLOWLIGHT_APP_CHANGED");
    getContext().registerReceiver(appChangedReceiver, filter);
  }

  @Override
  protected void handleOnDestroy() {
    super.handleOnDestroy();
    if (appChangedReceiver != null) {
      try {
        getContext().unregisterReceiver(appChangedReceiver);
      } catch (Exception ignored) {}
    }
  }

  @PluginMethod
  public void requestPermissions(PluginCall call) {
    boolean granted = hasUsageStatsPermission(getContext());
    if (!granted) {
      try {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
      } catch (Exception ignored) {}
    }
    JSObject ret = new JSObject();
    ret.put("granted", hasUsageStatsPermission(getContext()));
    call.resolve(ret);
  }

  @PluginMethod
  public void startMonitoring(PluginCall call) {
    Intent serviceIntent = new Intent(getContext(), SystemMonitoringService.class);
    try {
      ContextCompat.startForegroundService(getContext(), serviceIntent);
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

  private boolean hasUsageStatsPermission(Context context) {
    try {
      AppOpsManager appOps = (AppOpsManager) context.getSystemService(Context.APP_OPS_SERVICE);
      int mode;
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
        mode = appOps.unsafeCheckOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.getPackageName());
      } else {
        mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, android.os.Process.myUid(), context.getPackageName());
      }
      return mode == AppOpsManager.MODE_ALLOWED;
    } catch (Exception e) {
      return false;
    }
  }
}
