package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import androidx.core.content.ContextCompat;

/**
 * Boot receiver to auto-start SystemMonitoringService after device reboot
 */
public class BootReceiver extends BroadcastReceiver {
    
    @Override
    public void onReceive(Context context, Intent intent) {
        if (Intent.ACTION_BOOT_COMPLETED.equals(intent.getAction())) {
            android.util.Log.i("FlowFocus", "BootReceiver: Device boot completed");
            
            // Check if Usage Access permission is granted
            if (UsageStatsHelper.hasUsageStatsPermission(context)) {
                // Start the monitoring service
                Intent serviceIntent = new Intent(context, SystemMonitoringService.class);
                serviceIntent.putExtra("debug", false);
                ContextCompat.startForegroundService(context, serviceIntent);
                android.util.Log.i("FlowFocus", "BootReceiver started SystemMonitoringService after reboot");
                
                // Reschedule midnight alarm after reboot
                MidnightScheduler.scheduleMidnightAlarm(context);
                android.util.Log.i("FlowFocus", "BootReceiver: Rescheduled midnight notification alarm");
            } else {
                android.util.Log.i("FlowFocus", "BootReceiver: Usage Access not granted, service not started");
            }
        }
    }
}
