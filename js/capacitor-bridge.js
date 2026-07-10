/**
 * Wallet Watcher Pro - Capacitor Bridge
 * Handles native Android/iOS features via Capacitor plugins
 * This file should be loaded after app.js
 */

// Check if running in Capacitor
const isCapacitor = typeof window.Capacitor !== 'undefined';
const isAndroid = isCapacitor && Capacitor.getPlatform() === 'android';
const isIOS = isCapacitor && Capacitor.getPlatform() === 'ios';

// Plugin references (lazy loaded)
let Network, Preferences, PushNotifications, LocalNotifications;
let BiometricAuth, BackgroundRunner, App, Haptics, Device, Share;
let Clipboard, Filesystem, Browser, SplashScreen, StatusBar, Keyboard;

async function loadPlugins() {
  if (!isCapacitor) return;
  
  try {
    const { Network: N } = await import('@capacitor/network');
    Network = N;
    
    const { Preferences: P } = await import('@capacitor/preferences');
    Preferences = P;
    
    const { PushNotifications: PN } = await import('@capacitor/push-notifications');
    PushNotifications = PN;
    
    const { LocalNotifications: LN } = await import('@capacitor/local-notifications');
    LocalNotifications = LN;
    
    const { BiometricAuth: BA } = await import('@aparajita/capacitor-biometric-auth');
    BiometricAuth = BA;
    
    const { BackgroundRunner: BR } = await import('@capacitor/background-runner');
    BackgroundRunner = BR;
    
    const { App: A } = await import('@capacitor/app');
    App = A;
    
    const { Haptics: H } = await import('@capacitor/haptics');
    Haptics = H;
    
    const { Device: D } = await import('@capacitor/device');
    Device = D;
    
    const { Share: S } = await import('@capacitor/share');
    Share = S;
    
    const { Clipboard: C } = await import('@capacitor/clipboard');
    Clipboard = C;
    
    const { Filesystem: FS } = await import('@capacitor/filesystem');
    Filesystem = FS;
    
    const { Browser: B } = await import('@capacitor/browser');
    Browser = B;
    
    const { SplashScreen: SS } = await import('@capacitor/splash-screen');
    SplashScreen = SS;
    
    const { StatusBar: SB } = await import('@capacitor/status-bar');
    StatusBar = SB;
    
    const { Keyboard: K } = await import('@capacitor/keyboard');
    Keyboard = K;
    
    console.log('[Capacitor] All plugins loaded');
    initializeCapacitorFeatures();
  } catch (e) {
    console.warn('[Capacitor] Failed to load plugins:', e);
  }
}

// Initialize Capacitor-specific features
async function initializeCapacitorFeatures() {
  // Hide splash screen
  if (SplashScreen) {
    await SplashScreen.hide();
  }
  
  // Configure status bar
  if (StatusBar) {
    await StatusBar.setStyle({ style: 'dark' });
    await StatusBar.setBackgroundColor({ color: '#040508' });
    await StatusBar.setOverlaysWebView({ overlay: true });
  }
  
  // Keyboard handling
  if (Keyboard) {
    Keyboard.addListener('keyboardWillShow', (info) => {
      document.body.style.paddingBottom = info.keyboardHeight + 'px';
    });
    Keyboard.addListener('keyboardWillHide', () => {
      document.body.style.paddingBottom = '0';
    });
  }
  
  // Network status monitoring
  if (Network) {
    Network.addListener('networkStatusChange', (status) => {
      console.log('[Network] Status:', status);
      window.dispatchEvent(new CustomEvent('networkStatusChange', { detail: status }));
      
      if (status.connected) {
        // Resume price updates
        if (typeof fetchLivePrices === 'function') fetchLivePrices();
      } else {
        showToast('warning', 'Офлайн', 'Проверьте подключение к интернету');
      }
    });
    
    const status = await Network.getStatus();
    console.log('[Network] Initial status:', status);
  }
  
  // App lifecycle
  if (App) {
    App.addListener('appStateChange', ({ isActive }) => {
      console.log('[App] Active:', isActive);
      if (isActive && typeof fetchLivePrices === 'function') {
        fetchLivePrices(); // Refresh on resume
      }
    });
    
    App.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        App.exitApp();
      } else {
        window.history.back();
      }
    });
  }
  
  // Deep link handling
  if (App) {
    App.addListener('appUrlOpen', (data) => {
      console.log('[DeepLink] Opened:', data.url);
      handleDeepLink(data.url);
    });
  }
  
  // Haptics for interactions
  window.addEventListener('click', (e) => {
    if (e.target.matches('.btn, .nav-item, .filter-tab, .net-btn') && Haptics) {
      Haptics.impact({ style: 'light' });
    }
  });
}

// Biometric Authentication
async function authenticateWithBiometric(reason = 'Доступ к Wallet Watcher Pro') {
  if (!BiometricAuth) return { success: false, error: 'BiometricAuth not available' };
  
  try {
    const result = await BiometricAuth.authenticate({
      reason,
      title: 'Биометрическая аутентификация',
      subtitle: 'Используйте отпечаток или Face ID',
      description: 'Для доступа к данным кошельков',
      negativeButtonText: 'Отмена',
    });
    
    if (result.success) {
      if (Haptics) Haptics.notification({ type: 'success' });
    }
    return result;
  } catch (e) {
    console.error('[Biometric] Error:', e);
    return { success: false, error: e.message };
  }
}

async function checkBiometricAvailability() {
  if (!BiometricAuth) return { available: false };
  
  try {
    return await BiometricAuth.checkBiometricAuth();
  } catch (e) {
    return { available: false, error: e.message };
  }
}

// Push Notifications
async function setupPushNotifications() {
  if (!PushNotifications) return;
  
  try {
    // Request permissions
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive === 'granted') {
      // Register for push
      await PushNotifications.register();
    }
  } catch (e) {
    console.error('[Push] Setup error:', e);
  }
  
  // Listeners
  PushNotifications.addListener('registration', (token) => {
    console.log('[Push] Registration token:', token.value);
    // Send to backend if needed
    localStorage.setItem('fcm_token', token.value);
  });
  
  PushNotifications.addListener('registrationError', (err) => {
    console.error('[Push] Registration error:', err);
  });
  
  PushNotifications.addListener('pushNotificationReceived', (notification) => {
    console.log('[Push] Received:', notification);
    handlePushNotification(notification);
  });
  
  PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
    console.log('[Push] Action:', action);
    if (action.actionId === 'open') {
      navigateTo('notifications');
    }
  });
}

function handlePushNotification(notification) {
  const data = notification.data || {};
  showToast('info', notification.title || 'Уведомление', notification.body || '');
  
  // Add to notifications page
  if (typeof addNotification === 'function') {
    addNotification({
      type: data.type || 'info',
      title: notification.title,
      desc: notification.body,
      time: 'только что',
      read: false,
      data: data,
    });
  }
}

// Local Notifications (scheduled)
async function scheduleLocalNotification(title, body, options = {}) {
  if (!LocalNotifications) return;
  
  try {
    await LocalNotifications.schedule({
      notifications: [{
        title,
        body,
        id: options.id || Date.now(),
        schedule: options.at ? { at: new Date(options.at) } : undefined,
        repeat: options.repeat,
        sound: options.sound || 'default',
        attachments: options.attachments,
        actionTypeId: options.actionTypeId || 'open',
        extra: options.extra || {},
      }]
    });
  } catch (e) {
    console.error('[LocalNotif] Schedule error:', e);
  }
}

// Background Runner (for price updates)
async function setupBackgroundRunner() {
  if (!BackgroundRunner || !isAndroid) return;
  
  try {
    await BackgroundRunner.configure({
      label: 'Wallet Watcher Background',
      repeat: true,
      interval: 300, // 5 minutes
      autoRun: true,
    });
    
    console.log('[BackgroundRunner] Configured');
  } catch (e) {
    console.error('[BackgroundRunner] Error:', e);
  }
}

// Preferences (secure storage)
async function setPreference(key, value) {
  if (!Preferences) return localStorage.setItem(key, JSON.stringify(value));
  
  try {
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch (e) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

async function getPreference(key, defaultValue = null) {
  if (!Preferences) return JSON.parse(localStorage.getItem(key) || 'null') || defaultValue;
  
  try {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : defaultValue;
  } catch (e) {
    return JSON.parse(localStorage.getItem(key) || 'null') || defaultValue;
  }
}

async function removePreference(key) {
  if (!Preferences) return localStorage.removeItem(key);
  
  try {
    await Preferences.remove({ key });
  } catch (e) {
    localStorage.removeItem(key);
  }
}

// Share
async function shareContent(text, title = 'Wallet Watcher Pro') {
  if (!Share) {
    // Fallback: copy to clipboard
    await copyToClipboard(text);
    showToast('success', 'Скопировано', 'Текст в буфере обмена');
    return;
  }
  
  try {
    await Share.share({ title, text, url: 'https://walletwatcher.pro' });
  } catch (e) {
    console.error('[Share] Error:', e);
  }
}

// Clipboard
async function copyToClipboard(text) {
  if (!Clipboard) {
    navigator.clipboard.writeText(text);
    return;
  }
  
  try {
    await Clipboard.write({ string: text });
  } catch (e) {
    navigator.clipboard.writeText(text);
  }
}

// Filesystem (for exports)
async function writeFile(filename, content, directory = 'DOCUMENTS') {
  if (!Filesystem) {
    // Fallback: trigger download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  
  try {
    await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Filesystem.Directory[directory],
      encoding: Filesystem.Encoding.UTF8,
    });
    showToast('success', 'Сохранено', `Файл ${filename} сохранен в ${directory}`);
  } catch (e) {
    console.error('[Filesystem] Write error:', e);
    showToast('error', 'Ошибка', 'Не удалось сохранить файл');
  }
}

async function readFile(filename, directory = 'DOCUMENTS') {
  if (!Filesystem) return null;
  
  try {
    const result = await Filesystem.readFile({
      path: filename,
      directory: Filesystem.Directory[directory],
      encoding: Filesystem.Encoding.UTF8,
    });
    return result.data;
  } catch (e) {
    console.error('[Filesystem] Read error:', e);
    return null;
  }
}

// Device Info
async function getDeviceInfo() {
  if (!Device) return {};
  
  try {
    return await Device.getInfo();
  } catch (e) {
    return {};
  }
}

async function getBatteryInfo() {
  if (!Device) return {};
  
  try {
    return await Device.getBatteryInfo();
  } catch (e) {
    return {};
  }
}

// Browser (in-app)
async function openInAppBrowser(url) {
  if (!Browser) {
    window.open(url, '_blank');
    return;
  }
  
  try {
    await Browser.open({ url, presentationStyle: 'popover', toolbarColor: '#040508' });
  } catch (e) {
    window.open(url, '_blank');
  }
}

// Haptics
function hapticImpact(style = 'light') {
  if (!Haptics) return;
  Haptics.impact({ style });
}

function hapticNotification(type = 'success') {
  if (!Haptics) return;
  Haptics.notification({ type });
}

function hapticSelection() {
  if (!Haptics) return;
  Haptics.selectionStart();
}

// Deep link handler
function handleDeepLink(url) {
  try {
    const urlObj = new URL(url);
    const address = urlObj.searchParams.get('address');
    const network = urlObj.searchParams.get('network') || 'sol';
    const label = urlObj.searchParams.get('label') || '';
    
    if (address && typeof window.handleWalletDeepLink === 'function') {
      window.handleWalletDeepLink(address, network, label);
    }
  } catch (e) {
    console.error('[DeepLink] Parse error:', e);
  }
}

// Initialize on load
if (typeof window !== 'undefined') {
  // Wait for Capacitor to be ready
  if (isCapacitor) {
    document.addEventListener('DOMContentLoaded', loadPlugins);
    // Also try immediately in case DOMContentLoaded already fired
    if (document.readyState !== 'loading') {
      loadPlugins();
    }
  }
  
  // Export for use in app.js
  window.CapacitorBridge = {
    isCapacitor,
    isAndroid,
    isIOS,
    authenticateWithBiometric,
    checkBiometricAvailability,
    setupPushNotifications,
    scheduleLocalNotification,
    setupBackgroundRunner,
    setPreference,
    getPreference,
    removePreference,
    shareContent,
    copyToClipboard,
    writeFile,
    readFile,
    getDeviceInfo,
    getBatteryInfo,
    openInAppBrowser,
    hapticImpact,
    hapticNotification,
    hapticSelection,
    handleDeepLink,
  };
}

console.log('[CapacitorBridge] Loaded');
