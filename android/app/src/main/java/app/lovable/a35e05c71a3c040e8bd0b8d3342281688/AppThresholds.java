package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

public class AppThresholds {
    public static class AppConfig {
        public final int[] thresholds;
        public final int[] debugThresholds;
        public final String psychState;
        
        public AppConfig(int[] thresholds, int[] debugThresholds, String psychState) {
            this.thresholds = thresholds;
            this.debugThresholds = debugThresholds;
            this.psychState = psychState;
        }
    }

    // Hardcoded app configurations
    public static AppConfig getAppConfig(String packageName) {
        switch (packageName) {
            case "com.google.android.youtube":
                return new AppConfig(
                    new int[]{15 * 60, 25 * 60, 35 * 60, 45 * 60}, // 15, 25, 35, 45 minutes
                    new int[]{30, 60, 120, 180}, // 30s, 1min, 2min, 3min for testing
                    "avoidance"
                );
            case "com.instagram.android":
                return new AppConfig(
                    new int[]{15 * 60, 25 * 60, 35 * 60, 45 * 60}, // Same as YouTube: 15, 25, 35, 45 minutes
                    new int[]{25, 45, 90, 150},
                    "seeking_stimulation"
                );
            case "com.zhiliaoapp.musically": // TikTok
                return new AppConfig(
                    new int[]{8 * 60, 15 * 60, 25 * 60, 35 * 60},
                    new int[]{20, 40, 75, 120},
                    "avoidance"
                );
            case "com.facebook.katana":
                return new AppConfig(
                    new int[]{12 * 60, 22 * 60, 32 * 60, 42 * 60},
                    new int[]{30, 55, 100, 140},
                    "emotional_regulation"
                );
            case "com.android.chrome":
                return new AppConfig(
                    new int[]{20 * 60, 35 * 60, 50 * 60, 65 * 60},
                    new int[]{40, 70, 120, 180},
                    "seeking_stimulation"
                );
            default:
                return new AppConfig(
                    new int[]{15 * 60, 30 * 60, 45 * 60, 60 * 60},
                    new int[]{30, 60, 120, 180},
                    "seeking_stimulation"
                );
        }
    }
    
    public static String[] getNudgeMessages(String psychState, int level) {
        String[][] messages = {
            // Level 1 - Gentle curiosity
            {"Just Checking In", "Your mind seems restless - what are you really looking for? 💙"},
            // Level 2 - Concern check-in  
            {"How Are You?", "Feeling scattered? Sometimes our attention seeks what our heart needs 🌱"},
            // Level 3 - Stronger alternative
            {"Creative Alternative", "Your mind is active - how about a quick journal check-in instead? 📝"},
            // Level 4 - Pattern recognition
            {"Pattern Recognition", "You've been here for a while now. This pattern isn't serving your wellbeing. Let's break it together. 🌱"}
        };
        
        if (level >= 1 && level <= 4) {
            return messages[level - 1];
        }
        return messages[0]; // Default to level 1
    }
}