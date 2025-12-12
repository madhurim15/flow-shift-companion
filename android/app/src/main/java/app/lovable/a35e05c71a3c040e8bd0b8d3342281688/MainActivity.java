package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.content.ContextCompat;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import app.lovable.a35e05c71a3c040e8bd0b8d3342281688.SystemMonitoringPlugin;

public class MainActivity extends BridgeActivity {
    // Build stamp to verify correct APK is running
    public static final long BUILD_STAMP = 1733875200000L; // 2024-12-11 update
    
    public static long getBuildStamp() {
        return BUILD_STAMP;
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Build stamp verification
        android.util.Log.w("FlowFocus", ">>> MainActivity.onCreate() STARTING <<<");
        android.util.Log.w("FlowFocus", "=== BUILD_STAMP: " + BUILD_STAMP + " ===");
        
        // REGISTER PLUGIN BEFORE super.onCreate() - Some devices require this order
        android.util.Log.w("FlowFocus", ">>> Registering SystemMonitoringPlugin BEFORE super.onCreate() <<<");
        registerPlugin(SystemMonitoringPlugin.class);
        android.util.Log.w("FlowFocus", ">>> SystemMonitoringPlugin registered <<<");
        
        // Now call super to initialize Capacitor bridge
        super.onCreate(savedInstanceState);
        android.util.Log.w("FlowFocus", ">>> super.onCreate() completed <<<");
        
        // Configure window for proper display cutout handling and heads-up notifications
        configureWindow();
        
        // Handle deep link if app was cold-started via it
        Intent launchIntent = getIntent();
        if (launchIntent != null && launchIntent.getData() != null) {
            String url = launchIntent.getData().toString();
            android.util.Log.w("FlowFocus", "Cold start deep link detected: " + url);
            // Capacitor bridge will handle this automatically after full initialization
        }
        
        // DO NOT auto-start here - let onboarding flow handle it with proper Samsung delay
        android.util.Log.i("FlowFocus", "MainActivity ready - service will be started by onboarding");
    }
    
    @Override
    public void onStart() {
        super.onStart();
        android.util.Log.w("FlowFocus", "=== onStart() BUILD_STAMP: " + BUILD_STAMP + " ===");
    }

    @Override
    public void onResume() {
        super.onResume();
        android.util.Log.w("FlowFocus", "=== onResume() BUILD_STAMP: " + BUILD_STAMP + " ===");
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent); // Important: update the intent for the activity
        
        // Log deep links - Capacitor's App plugin automatically handles ACTION_VIEW intents
        // and fires 'appUrlOpen' event which DeepLinkHandler.tsx listens for
        if (intent != null && intent.getData() != null) {
            String url = intent.getData().toString();
            android.util.Log.w("FlowFocus", "Deep link received in onNewIntent: " + url);
        }
        
        // Handle midnight reschedule trigger
        if (intent != null && intent.getBooleanExtra("trigger_notification_reschedule", false)) {
            android.util.Log.i("FlowFocus", "MainActivity: Received midnight reschedule trigger");
            
            // Send event to JavaScript
            com.getcapacitor.JSObject ret = new com.getcapacitor.JSObject();
            ret.put("trigger", "midnight_reschedule");
            getBridge().triggerWindowJSEvent("midnightReschedule", ret.toString());
        }
    }
    
    private void configureWindow() {
        Window window = getWindow();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            // Handle display cutouts (notches, punch holes)
            WindowManager.LayoutParams layoutParams = window.getAttributes();
            layoutParams.layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
            window.setAttributes(layoutParams);
        }
        
        // Enable edge-to-edge display for better heads-up notification visibility
        WindowCompat.setDecorFitsSystemWindows(window, false);
        
        // Configure status bar and navigation bar for heads-up notifications
        View decorView = window.getDecorView();
        WindowInsetsControllerCompat controller = new WindowInsetsControllerCompat(window, decorView);
        
        // Make status bar transparent but keep it visible for heads-up notifications
        window.setStatusBarColor(android.graphics.Color.TRANSPARENT);
        
        // Ensure proper window flags for system UI visibility
        window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
        
        // Status bar appearance is handled via XML themes in styles.xml
    }
}
