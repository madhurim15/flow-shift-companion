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

public class MainActivity extends BridgeActivity {
    // Build stamp to verify correct APK is running
    private static final long BUILD_STAMP = 1731601200000L; // 2024-11-14 15:00 UTC
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // Register custom plugin BEFORE bridge initialization
        android.util.Log.i("FlowLight", "=== BUILD_STAMP: " + BUILD_STAMP + " ===");
        android.util.Log.i("FlowLight", "Registering SystemMonitoringPlugin (pre-bridge)");
        registerPlugin(SystemMonitoringPlugin.class);

        super.onCreate(savedInstanceState);
        
        // Configure window for proper display cutout handling and heads-up notifications
        configureWindow();
        
        // DO NOT auto-start here - let onboarding flow handle it with proper Samsung delay
        android.util.Log.i("FlowLight", "MainActivity ready - service will be started by onboarding");
    }
    
    @Override
    protected void onStart() {
        super.onStart();
        android.util.Log.w("FlowLight", "=== onStart() BUILD_STAMP: " + BUILD_STAMP + " ===");
    }

    @Override
    protected void onResume() {
        super.onResume();
        android.util.Log.w("FlowLight", "=== onResume() BUILD_STAMP: " + BUILD_STAMP + " ===");
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
