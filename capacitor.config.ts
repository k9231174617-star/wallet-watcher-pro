import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.walletwatcher.pro',
  appName: 'Wallet Watcher Pro',
  webDir: 'wallet-watcher-pro',
  server: {
    androidScheme: 'https',
    cleartext: false,
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
    },
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
    loggingBehavior: 'debug',
    backgroundColor: '#040508',
    overrideUserAgent: 'WalletWatcherPro/1.0',
    appendUserAgent: 'WalletWatcherPro',
    initialFocus: true,
    mixedContentMode: 'never',
  },
  ios: {
    contentInset: 'automatic',
    scrollEnabled: true,
    backgroundColor: '#040508',
    limitsNavigationsToAppBoundDomains: false,
    preferredContentMode: 'mobile',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: '#040508',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      style: 'dark',
      backgroundColor: '#040508',
      overlaysWebView: true,
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
      resizeOnFullScreen: true,
    },
    Network: {},
    Preferences: {},
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_wallet_watcher',
      iconColor: '#00f5ff',
    },
    BiometricAuth: {
      reason: 'Разблокируйте Wallet Watcher Pro',
      title: 'Биометрическая аутентификация',
      subtitle: 'Используйте отпечаток или Face ID',
      description: 'Для доступа к данным кошельков',
      negativeButtonText: 'Отмена',
    },
    BackgroundRunner: {
      label: 'Wallet Watcher Background',
      repeat: true,
      interval: 300,
      autoRun: true,
    },
    App: {},
    Haptics: {},
    Device: {},
    Share: {},
    Clipboard: {},
    FileOpener: {},
    Browser: {},
    Filesystem: {},
  },
};

export default config;
