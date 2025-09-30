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
    boolean granted = hasUsageStatsPermission(getContext());
    Context ctx = getContext();

    if (!granted) {
      boolean opened = false;

      // Try direct Usage Access settings
      try {
        Intent intent = new Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS);
        if (getActivity() != null) {
          getActivity().startActivity(intent);
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
          if (getActivity() != null) {
            getActivity().startActivity(intent);
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
          if (getActivity() != null) {
            getActivity().startActivity(intent);
          } else {
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            ctx.startActivity(intent);
          }
          opened = true;
        } catch (Exception e) {
          call.reject("Could not open Usage Access settings");
          return;
        }
      }
    }

    JSObject ret = new JSObject();
    ret.put("granted", hasUsageStatsPermission(ctx));
    call.resolve(ret);
  }

  @PluginMethod
  public void checkPermissions(PluginCall call) {
    JSObject ret = new JSObject();
    ret.put("usageAccess", hasUsageStatsPermission(getContext()));
    call.resolve(ret);
  }

  @PluginMethod
  public void startMonitoring(PluginCall call) {
    // Ensure Usage Access is granted before starting service
    if (!hasUsageStatsPermission(getContext())) {
      call.reject("Usage access permission not granted");
      return;
    }

    Intent serviceIntent = new Intent(getContext(), SystemMonitoringService.class);

    // Pass debug flag if provided
    boolean debug = call.getBoolean("debug", false);
    serviceIntent.putExtra("debug", debug);

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
      
      if (mode == AppOpsManager.MODE_ALLOWED) {
        return true;
      }
      
      // Fallback check for Samsung/OEM devices where AppOps might be unreliable
      try {
        android.app.usage.UsageStatsManager usageStatsManager = 
          (android.app.usage.UsageStatsManager) context.getSystemService(Context.USAGE_STATS_SERVICE);
        long endTime = System.currentTimeMillis();
        long startTime = endTime - 60000; // Last 60 seconds
        android.app.usage.UsageEvents events = 
          usageStatsManager.queryEvents(startTime, endTime);
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
}