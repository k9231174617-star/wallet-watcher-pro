# Capacitor
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }

# Capacitor Plugins
-keep class com.getcapacitor.network.** { *; }
-keep class com.getcapacitor.preferences.** { *; }
-keep class com.getcapacitor.pushnotifications.** { *; }
-keep class com.getcapacitor.localnotifications.** { *; }
-keep class com.getcapacitor.biometrica.** { *; }
-keep class com.getcapacitor.backgroundrunner.** { *; }
-keep class com.getcapacitor.app.** { *; }
-keep class com.getcapacitor.haptics.** { *; }
-keep class com.getcapacitor.device.** { *; }
-keep class com.getcapacitor.share.** { *; }
-keep class com.getcapacitor.clipboard.** { *; }
-keep class com.getcapacitor.filesystem.** { *; }
-keep class com.getcapacitor.browser.** { *; }
-keep class com.getcapacitor.splashscreen.** { *; }
-keep class com.getcapacitor.statusbar.** { *; }
-keep class com.getcapacitor.keyboard.** { *; }

# Firebase
-keep class com.google.firebase.** { *; }

# Kotlin
-keep class kotlin.** { *; }
-keep class kotlinx.** { *; }

# OkHttp / Okio
-keep class okhttp3.** { *; }
-keep class okio.** { *; }

# Keep JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Don't warn about missing classes
-dontwarn com.getcapacitor.**
-dontwarn okhttp3.**
-dontwarn okio.**
-dontwarn kotlinx.coroutines.**
