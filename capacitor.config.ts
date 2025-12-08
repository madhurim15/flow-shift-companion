import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.a35e05c71a3c040e8bd0b8d3342281688',
  appName: 'FlowFocus',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    SystemMonitoring: {
      // Enable the plugin
    }
  }
};

export default config;
