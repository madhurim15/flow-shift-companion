# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Capacitor specific rules
-keep class com.getcapacitor.** { *; }
-keep class com.capacitorjs.plugins.** { *; }
-keep @com.getcapacitor.annotation.CapacitorPlugin class * { *; }
-keepclassmembers class * {
    @com.getcapacitor.annotation.UsedByCapacitor *;
}
-keepclassmembers class * {
    @com.getcapacitor.annotation.PermissionCallback *;
}
-keepclassmembers class * {
    @com.getcapacitor.annotation.ActivityCallback *;
}

# Keep SystemMonitoring plugin
-keep class app.lovable.a35e05c71a3c040e8bd0b8d3342281688.SystemMonitoringPlugin { *; }
