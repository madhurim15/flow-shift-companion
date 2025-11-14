package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.app.NotificationManager;

public class NudgeActions extends BroadcastReceiver {
    // Removed ACTION_SNOOZE - no more "add 10 minutes"
    public static final String ACTION_DISMISS = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.DISMISS";
    public static final String ACTION_OPEN_APP = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.OPEN_APP";
    
    // New action deep links
    public static final String ACTION_MOOD = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.MOOD";
    public static final String ACTION_HYDRATION = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.HYDRATION";
    public static final String ACTION_EYE_REST = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.EYE_REST";
    public static final String ACTION_BREATHING = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.BREATHING";
    public static final String ACTION_STRETCH = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.STRETCH";
    public static final String ACTION_WALK = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.WALK";
    public static final String ACTION_STANDING = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.STANDING";
    public static final String ACTION_JOURNAL = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.JOURNAL";
    public static final String ACTION_VOICE = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.VOICE";
    public static final String ACTION_PHOTO = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.PHOTO";
    public static final String ACTION_WIN = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.WIN";
    public static final String ACTION_INTENTION = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.INTENTION";
    public static final String ACTION_GRATITUDE = "app.lovable.a35e05c71a3c040e8bd0b8d3342281688.GRATITUDE";

    @Override
    public void onReceive(Context context, Intent intent) {
        String action = intent.getAction();
        if (action == null) return;

        // Dismiss the notification first
        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        nm.cancel(98766); // NUDGE_NOTIF_ID

        // Map action to deep link
        String deepLink = null;
        switch (action) {
            case ACTION_DISMISS:
                Intent dismissIntent = new Intent("FLOWLIGHT_NUDGE_DISMISSED");
                context.sendBroadcast(dismissIntent);
                break;
            case ACTION_MOOD:
                deepLink = "flowlight://action/mood";
                break;
            case ACTION_HYDRATION:
                deepLink = "flowlight://action/hydration";
                break;
            case ACTION_EYE_REST:
                deepLink = "flowlight://action/eye-rest";
                break;
            case ACTION_BREATHING:
                deepLink = "flowlight://action/breathing";
                break;
            case ACTION_STRETCH:
                deepLink = "flowlight://action/stretch";
                break;
            case ACTION_WALK:
                deepLink = "flowlight://action/walk";
                break;
            case ACTION_STANDING:
                deepLink = "flowlight://action/standing";
                break;
            case ACTION_JOURNAL:
                deepLink = "flowlight://action/journal";
                break;
            case ACTION_VOICE:
                deepLink = "flowlight://action/voice";
                break;
            case ACTION_PHOTO:
                deepLink = "flowlight://action/photo";
                break;
            case ACTION_WIN:
                deepLink = "flowlight://action/win";
                break;
            case ACTION_INTENTION:
                deepLink = "flowlight://action/intention";
                break;
            case ACTION_GRATITUDE:
                deepLink = "flowlight://action/gratitude";
                break;
            case ACTION_OPEN_APP:
                deepLink = "flowlight://app";
                break;
        }
        
        // Open FlowLight with deep link
        if (deepLink != null) {
            Intent openIntent = new Intent(Intent.ACTION_VIEW);
            openIntent.setData(android.net.Uri.parse(deepLink));
            openIntent.setPackage(context.getPackageName());
            openIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
            context.startActivity(openIntent);
        }
    }
}