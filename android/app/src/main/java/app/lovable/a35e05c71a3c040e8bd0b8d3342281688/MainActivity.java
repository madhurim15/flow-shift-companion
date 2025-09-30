package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Register custom Capacitor plugin
        registerPlugin(SystemMonitoringPlugin.class);
        
        // Configure window for proper display cutout handling and heads-up notifications
        configureWindow();
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
