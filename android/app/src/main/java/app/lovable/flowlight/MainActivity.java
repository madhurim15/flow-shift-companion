package app.lovable.flowlight;

import android.os.Bundle;
import android.util.Log;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "FlowLight";
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        Log.i(TAG, "MainActivity.onCreate called");
        super.onCreate(savedInstanceState);
        Log.i(TAG, "MainActivity.onCreate completed");
    }
}
