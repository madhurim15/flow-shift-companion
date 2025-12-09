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
                    new int[]{12 * 60, 22 * 60, 32 * 60, 42 * 60}, // 12, 22, 32, 42 minutes (lowered from 15)
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
            // Masked productivity apps
            case "com.linkedin.android":
                return new AppConfig(
                    new int[]{10 * 60, 18 * 60, 28 * 60, 40 * 60}, // 10, 18, 28, 40 minutes
                    new int[]{25, 45, 75, 120},
                    "masked_productivity"
                );
            case "com.google.android.gm": // Gmail
                return new AppConfig(
                    new int[]{10 * 60, 20 * 60, 30 * 60, 45 * 60},
                    new int[]{20, 40, 70, 110},
                    "masked_productivity"
                );
            case "com.amazon.mShop.android.shopping": // Amazon
                return new AppConfig(
                    new int[]{12 * 60, 20 * 60, 30 * 60, 42 * 60},
                    new int[]{30, 50, 80, 120},
                    "impulse_shopping"
                );
            default:
                return new AppConfig(
                    new int[]{15 * 60, 30 * 60, 45 * 60, 60 * 60},
                    new int[]{30, 60, 120, 180},
                    "seeking_stimulation"
                );
        }
    }
    
    // Message structure: {Title, Message, SuggestedActions}
    // SuggestedActions is comma-separated action types that match the message content
    public static String[][] getNudgeMessageVariants(int level) {
        String[][][] allMessages = {
            // Level 1 - Gentle curiosity (7 variants)
            {
                {"Just Checking In 👋", "Hey {name}, just checking in... You've been on {app} for a bit. How about a quick 2-min walk? 🚶‍♀️✨", "walk,stretch"},
                {"Thumb Break Time 😊", "Hey {name}, your thumbs deserve a break! Try 3 deep breaths or jot down what you're feeling? 📝💭", "box-breathing,journal"},
                {"Stretch Time 🙆‍♂️", "Psst {name}... stretch time! {app} will still be here after a 60-second stretch 💪", "stretch,eye-yoga"},
                {"Better Alternative? 💭", "Hey {name}! Quick question: Would a 5-min journal check-in feel better than scrolling right now? ✍️", "journal,voice"},
                {"Mindful Pause ⏸️", "Hey {name}, pause for a sec 🌟 What if you took 3 deep breaths instead of that next scroll? 🧘‍♀️", "box-breathing,hydration"},
                {"Eyes Need Rest 👀", "Hey {name}, your eyes have been working hard! How about a quick eye yoga break? 👁️✨", "eye-yoga,stretch"},
                {"Mindful Sip 🍵", "{name}, how about a mindful moment? Take a sip of water and really taste it 💧", "mindful-sip,hydration"}
            },
            // Level 2 - Concern check-in (8 variants)
            {
                {"Real Talk Time 🤔", "Hey {name}, real talk - you've been on {app} for {duration}. How about capturing your thoughts in a voice note? 🎙️💜", "voice,journal"},
                {"Movement Break 🌳", "Hey {name} 💜 Still scrolling? Maybe your body needs movement more than your eyes need content. Take a walk? 🚶‍♀️", "walk,micro-movement"},
                {"Pattern Alert 🧘‍♀️", "Hey {name}, I'm seeing a pattern here... Let's try box breathing - 4 counts in, hold, out, hold 🌸", "box-breathing,meditation"},
                {"What Are You Looking For? ✍️", "Okay {name}, this is getting long 📱 What if you wrote down what you're actually looking for? 💭", "journal,intention"},
                {"Energy Check ⚡", "Hey {name}, how's your energy? 🔋 Maybe a quick stretch or walk would help more than scrolling? 🌤️", "stretch,walk"},
                {"Productivity or Procrastination? 🤔", "Hey {name}, honest check: Is {app} helping your goals or are you avoiding something? 💭", "journal,intention"},
                {"Eye Strain Alert 👁️", "{name}, your eyes have been focused on {app} for a while. Time for some eye yoga? 🧘‍♀️", "eye-yoga,eye-rest"},
                {"Quick Meditation? 🧘", "Hey {name}, what if you swapped 2 minutes of scrolling for 2 minutes of meditation? ✨", "meditation,box-breathing"}
            },
            // Level 3 - Stronger alternative (7 variants)
            {
                {"Intervention Time! 🚨", "Alright {name}, intervention time! Put the phone down and do 10 jumping jacks. Your brain will thank you 🧠💪", "micro-movement,walk"},
                {"Break The Loop 🔄", "{name}, love the dedication but... this ain't it 😅 How about a 5-min walk outside? Fresh air > stale scrolling 🌤️", "walk,standing"},
                {"Emotion Check 📝", "Real talk {name}: {duration} on {app}? Time to break the loop. Quick journal - what emotion are you avoiding? 💭", "journal,voice"},
                {"Future Self Calling 🙆‍♀️", "{name}, your future self called - they want you to stretch for 2 minutes instead. Can you do that? 💪", "stretch,eye-yoga"},
                {"Energy Reset ⚡", "{name}, this much {app} drains you more than it fills you 📉 How about box breathing to reset? 🧘‍♀️✨", "box-breathing,breathing"},
                {"Micro Movement Challenge 🏃", "{name}! Challenge time: Can you do 20 seconds of movement right now? 💪🔥", "micro-movement,stretch"},
                {"Need a Power Nap? 😴", "{name}, if you're mindlessly scrolling, maybe you need rest. Try a quick power nap instead? 💤", "power-nap,meditation"}
            },
            // Level 4 - Pattern recognition (6 variants)
            {
                {"We Need To Talk 🛑", "{name}, we need to talk. This {app} habit is becoming a thing. 20-min walk, now. Your mental health > this content ❤️🚶‍♀️", "walk,journal"},
                {"Tough Love Time 💪", "Listen {name}, tough love time: {duration} on {app}?! Voice record why you're avoiding what you should be doing 🎙️", "voice,journal"},
                {"Stop & Breathe ✋", "{name}!! Stop. Close the app. Take 10 deep breaths with box breathing. Then write down 3 things you're grateful for 🙏✨", "box-breathing,gratitude"},
                {"Pattern Not Serving You 😤", "Okay {name}, enough. This pattern isn't serving you. Try a 2-min meditation to reset 🧘‍♀️❤️", "meditation,journal"},
                {"Reality Check ⏰", "{name}, real talk: {duration}?! You deserve better than endless scrolling. Take your power back NOW 💪🌟", "walk,intention"},
                {"Full Reset Needed 🔄", "{name}, you need a full reset. Step away, do some eye yoga, take deep breaths 🧘‍♀️✨", "eye-yoga,box-breathing"}
            }
        };
        
        if (level >= 1 && level <= 4) {
            return allMessages[level - 1];
        }
        return allMessages[0];
    }
    
    public static String[] getNudgeMessage(android.content.Context context, int level) {
        android.content.SharedPreferences prefs = context.getSharedPreferences("FlowFocusNudges", android.content.Context.MODE_PRIVATE);
        String key = "nudge_message_index_level_" + level;
        
        // Get current index for this level
        int currentIndex = prefs.getInt(key, 0);
        
        // Get variants
        String[][] variants = getNudgeMessageVariants(level);
        int index = currentIndex % variants.length;
        
        // Save next index for this level
        prefs.edit().putInt(key, currentIndex + 1).apply();
        
        return variants[index];
    }
    
    public static String getSuggestedAction(int level, int hourOfDay) {
        // Morning (6-11): walk, stretch, journal
        // Afternoon (12-17): breathing, walk, voice
        // Evening (18-21): stretch, journal, voice
        // Night (22-5): breathing, gratitude, journal
        
        if (level <= 2) {
            if (hourOfDay >= 6 && hourOfDay < 12) return "breathing";
            if (hourOfDay >= 12 && hourOfDay < 18) return "walk";
            if (hourOfDay >= 18 && hourOfDay < 22) return "stretch";
            return "breathing";
        } else if (level == 3) {
            if (hourOfDay >= 6 && hourOfDay < 12) return "walk";
            if (hourOfDay >= 12 && hourOfDay < 18) return "stretch";
            if (hourOfDay >= 18 && hourOfDay < 22) return "journal";
            return "journal";
        } else {
            if (hourOfDay >= 6 && hourOfDay < 12) return "journal";
            if (hourOfDay >= 12 && hourOfDay < 18) return "voice";
            if (hourOfDay >= 18 && hourOfDay < 22) return "voice";
            return "gratitude";
        }
    }
}
