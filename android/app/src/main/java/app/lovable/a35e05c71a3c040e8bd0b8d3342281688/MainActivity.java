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
    public static final long BUILD_STAMP = 1732890000000L; // 2024-11-29 16:00 UTC
    
    public static long getBuildStamp() {
        return BUILD_STAMP;
    }
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Build stamp verification
        android.util.Log.i("FlowLight", "=== BUILD_STAMP: " + BUILD_STAMP + " ===");
        
        // Call super FIRST to initialize Capacitor bridge
        super.onCreate(savedInstanceState);
        
        // MANUALLY REGISTER THE PLUGIN - Critical fix for plugin detection
        registerPlugin(SystemMonitoringPlugin.class);
        android.util.Log.i("FlowLight", "SystemMonitoringPlugin manually registered");
        
        // Configure window for proper display cutout handling and heads-up notifications
        configureWindow();
        
        // DO NOT auto-start here - let onboarding flow handle it with proper Samsung delay
        android.util.Log.i("FlowLight", "MainActivity ready - service will be started by onboarding");
    }
    
    @Override
    public void onStart() {
        super.onStart();
        android.util.Log.w("FlowLight", "=== onStart() BUILD_STAMP: " + BUILD_STAMP + " ===");
    }

    @Override
    public void onResume() {
        super.onResume();
        android.util.Log.w("FlowLight", "=== onResume() BUILD_STAMP: " + BUILD_STAMP + " ===");
    }
    
    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        
        if (intent.getBooleanExtra("trigger_notification_reschedule", false)) {
            android.util.Log.i("FlowLight", "MainActivity: Received midnight reschedule trigger");
            
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
