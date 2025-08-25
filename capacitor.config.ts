import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.35e05c71a3c040e8bd0b8d3342281688',
  appName: 'flowlight-app',
  webDir: 'dist',
  server: {
    url: 'https://35e05c71-a3c0-40e8-bd0b-8d3342281688.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#000000",
      showSpinner: false
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;