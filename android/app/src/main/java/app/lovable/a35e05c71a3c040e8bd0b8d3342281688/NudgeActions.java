package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.app.NotificationManager;

public class NudgeActions extends BroadcastReceiver {
    public static final String ACTION_SNOOZE = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.SNOOZE";
    public static final String ACTION_DISMISS = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.DISMISS";
    public static final String ACTION_OPEN_APP = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.OPEN_APP";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        // Dismiss the notification first
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.cancel(98766); // NUDGE_NOTIF_ID

        switch (action) {
            case ACTION_SNOOZE:
                // Broadcast snooze event to service
                Intent snoozeIntent = new Intent("FLOWLIGHT_NUDGE_SNOOZED");
                context.sendBroadcast(snoozeIntent);
                break;
            case ACTION_DISMISS:
                // Broadcast dismiss event to service
                Intent dismissIntent = new Intent("FLOWLIGHT_NUDGE_DISMISSED");
                context.sendBroadcast(dismissIntent);
                break;
            case ACTION_OPEN_APP:
                // Open FlowLight app
                Intent openIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
                if (openIntent != null) {
                    openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                    context.startActivity(openIntent);
                }
                break;
        }
    }
}