import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nudge.app',
  appName: 'Nudge',
  webDir: 'dist',
  // Server config for better offline handling
  server: {
    // Use local assets only (no external server needed)
    androidScheme: 'https',
    // Allow all origins for local file access
    allowNavigation: ['*'],
  },
  plugins: {
    StatusBar: {
      style: 'DARK',
      overlaysWebView: true,
      backgroundColor: '#00000000',
    },
    SplashScreen: {
      launchShowDuration: 0,
      launchAutoHide: true,
      backgroundColor: "#fffdf5",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    // Keyboard settings for better mobile experience
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
  // Android-specific settings
  android: {
    // Allow mixed content for better compatibility
    allowMixedContent: true,
    // Enable hardware acceleration
    webContentsDebuggingEnabled: false,
  },
};

export default config;
