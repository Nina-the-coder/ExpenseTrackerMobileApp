# ProGuard configuration for Expense Tracker
# Reduces app size by removing unused code and obfuscating

# Keep application classes
-keep public class com.anonymous.expensetracker.**
-keepclassmembers class com.anonymous.expensetracker.** { *; }

# Keep React Native
-keep class com.facebook.react.** { *; }
-keep class com.facebook.infer.** { *; }
-keep class com.facebook.jni.** { *; }
-keep class com.facebook.systrace.** { *; }
-keep class com.facebook.common.** { *; }
-keep class com.facebook.imagepipeline.** { *; }

# Keep native method names
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep enum values and valueOf() method
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Remove logging
-assumenosideeffects class android.util.Log {
    public static *** d(...);
    public static *** v(...);
    public static *** i(...);
}

# Optimization settings
-optimizationpasses 5
-repackageclasses ''
-allowaccessmodification
-dontusemixedcaseclassnames
