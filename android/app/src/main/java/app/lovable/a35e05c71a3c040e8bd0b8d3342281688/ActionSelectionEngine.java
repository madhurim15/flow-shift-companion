package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class ActionSelectionEngine {
    private static final String TAG = "FlowFocus";
    private static final String PREFS_NAME = "flowfocus_action_engine";
    private static final String RECENT_ACTIONS_KEY = "recent_actions";
    
    public static class ActionButton {
        public final String label;
        public final String deepLink;
        public final boolean isPhysical;
        
        public ActionButton(String label, String deepLink, boolean isPhysical) {
            this.label = label;
            this.deepLink = deepLink;
            this.isPhysical = isPhysical;
        }
    }
    
    // Track recent actions to prevent repetition (persisted to SharedPreferences)
    private static List<String> recentActions = new ArrayList<>();
    private static final int MAX_RECENT_ACTIONS = 10; // Increased from 5 for better variety
    private static boolean isInitialized = false;
    
    /**
     * Initialize recent actions from SharedPreferences
     */
    private static void initializeFromStorage(Context context) {
        if (isInitialized || context == null) return;
        
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String stored = prefs.getString(RECENT_ACTIONS_KEY, "");
            
            if (!stored.isEmpty()) {
                String[] actions = stored.split(",");
                recentActions = new ArrayList<>(Arrays.asList(actions));
                Log.i(TAG, "Loaded " + recentActions.size() + " recent actions from storage: " + stored);
            } else {
                recentActions = new ArrayList<>();
                Log.i(TAG, "No recent actions in storage, starting fresh");
            }
            
            isInitialized = true;
        } catch (Exception e) {
            Log.e(TAG, "Failed to load recent actions from storage", e);
            recentActions = new ArrayList<>();
            isInitialized = true;
        }
    }
    
    /**
     * Save recent actions to SharedPreferences
     */
    private static void saveToStorage(Context context) {
        if (context == null) return;
        
        try {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            String stored = String.join(",", recentActions);
            prefs.edit().putString(RECENT_ACTIONS_KEY, stored).apply();
            Log.d(TAG, "Saved " + recentActions.size() + " recent actions to storage");
        } catch (Exception e) {
            Log.e(TAG, "Failed to save recent actions to storage", e);
        }
    }
    
    /**
     * Get contextually appropriate actions based on usage patterns
     * Now accepts Context for SharedPreferences persistence
     */
    public static List<ActionButton> getContextualActions(
        Context context,
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions,
        String suggestedActions
    ) {
        // Initialize from storage if needed
        initializeFromStorage(context);
        
        // Update recent actions tracking from external source if provided
        if (existingRecentActions != null && existingRecentActions.length > 0) {
            for (String action : existingRecentActions) {
                if (!recentActions.contains(action)) {
                    recentActions.add(action);
                }
            }
            // Trim to max size
            while (recentActions.size() > MAX_RECENT_ACTIONS) {
                recentActions.remove(0);
            }
            saveToStorage(context);
        }
        
        List<ActionButton> allActions = getAllActions();
        List<ActionButton> selectedActions = new ArrayList<>();
        
        // Always include mood check option (shortened label)
        ActionButton moodCheck = new ActionButton("😊 Mood", "mood", false);
        
        int numActions = 2; // Always use 2 actions for better notification visibility
        
        // If we have suggested actions from the message, prioritize those
        if (suggestedActions != null && !suggestedActions.isEmpty()) {
            selectedActions = selectSuggestedActions(context, allActions, suggestedActions, numActions);
        } else {
            // Fallback to original logic
            int physicalWeight = getPhysicalWeight(durationMinutes, level);
            
            // For Level 3, require physical actions (no dismiss, must act)
            if (level >= 3) {
                selectedActions = selectPhysicalActions(context, allActions, numActions, hourOfDay, appCategory);
            } else {
                selectedActions = selectBalancedActions(context, allActions, numActions, physicalWeight, hourOfDay, appCategory);
            }
        }
        
        // Add mood check as first option for Level 1 & 2
        if (level <= 2) {
            selectedActions.add(0, moodCheck);
        }
        
        // Trim to required number
        while (selectedActions.size() > numActions + (level <= 2 ? 1 : 0)) {
            selectedActions.remove(selectedActions.size() - 1);
        }
        
        return selectedActions;
    }
    
    /**
     * Backward-compatible overload without Context (for legacy calls)
     */
    public static List<ActionButton> getContextualActions(
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions,
        String suggestedActions
    ) {
        return getContextualActions(null, level, appCategory, durationMinutes, hourOfDay, existingRecentActions, suggestedActions);
    }
    
    /**
     * Backward-compatible overload without suggestedActions
     */
    public static List<ActionButton> getContextualActions(
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions
    ) {
        return getContextualActions(null, level, appCategory, durationMinutes, hourOfDay, existingRecentActions, null);
    }
    
    /**
     * Select actions based on suggested actions from the nudge message
     */
    private static List<ActionButton> selectSuggestedActions(
        Context context,
        List<ActionButton> allActions,
        String suggestedActions,
        int count
    ) {
        List<ActionButton> selected = new ArrayList<>();
        String[] suggestions = suggestedActions.split(",");
        
        // First, find matching actions for suggested deepLinks
        for (String suggestion : suggestions) {
            String trimmed = suggestion.trim();
            for (ActionButton action : allActions) {
                if (action.deepLink.equals(trimmed) && !containsAction(selected, action.deepLink)) {
                    selected.add(action);
                    trackAction(context, action.deepLink);
                    if (selected.size() >= count) {
                        return selected;
                    }
                }
            }
        }
        
        // If we don't have enough, fill with non-recently-used actions
        if (selected.size() < count) {
            for (ActionButton action : allActions) {
                if (!containsAction(selected, action.deepLink) && !wasRecentlyUsed(action.deepLink)) {
                    selected.add(action);
                    trackAction(context, action.deepLink);
                    if (selected.size() >= count) {
                        break;
                    }
                }
            }
        }
        
        return selected;
    }
    
    /**
     * Check if selected list already contains an action with this deepLink
     */
    private static boolean containsAction(List<ActionButton> actions, String deepLink) {
        for (ActionButton action : actions) {
            if (action.deepLink.equals(deepLink)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Calculate physical action weight based on duration
     */
    private static int getPhysicalWeight(int durationMinutes, int level) {
        if (durationMinutes < 15) return 30; // 30% physical
        if (durationMinutes < 30) return 50; // 50% physical
        if (durationMinutes < 45) return 70; // 70% physical
        return 90; // 90% physical for 45+ minutes
    }
    
    /**
     * Select only physical actions (for Level 3)
     */
    private static List<ActionButton> selectPhysicalActions(
        Context context,
        List<ActionButton> allActions,
        int count,
        int hourOfDay,
        String appCategory
    ) {
        List<ActionButton> physical = new ArrayList<>();
        for (ActionButton action : allActions) {
            if (action.isPhysical && !wasRecentlyUsed(action.deepLink)) {
                physical.add(action);
            }
        }
        
        // If all physical actions were recently used, include them anyway
        if (physical.isEmpty()) {
            Log.d(TAG, "All physical actions recently used, resetting for variety");
            for (ActionButton action : allActions) {
                if (action.isPhysical) {
                    physical.add(action);
                }
            }
        }
        
        // Prioritize by time of day
        physical = prioritizeByTime(physical, hourOfDay, true);
        
        List<ActionButton> selected = new ArrayList<>();
        for (int i = 0; i < Math.min(count, physical.size()); i++) {
            selected.add(physical.get(i));
            trackAction(context, physical.get(i).deepLink);
        }
        
        return selected;
    }
    
    /**
     * Select balanced mix of physical and digital actions
     */
    private static List<ActionButton> selectBalancedActions(
        Context context,
        List<ActionButton> allActions,
        int count,
        int physicalWeight,
        int hourOfDay,
        String appCategory
    ) {
        List<ActionButton> physical = new ArrayList<>();
        List<ActionButton> digital = new ArrayList<>();
        
        for (ActionButton action : allActions) {
            if (!wasRecentlyUsed(action.deepLink)) {
                if (action.isPhysical) {
                    physical.add(action);
                } else {
                    digital.add(action);
                }
            }
        }
        
        // If all actions of a type were recently used, include some anyway
        if (physical.isEmpty()) {
            Log.d(TAG, "All physical actions recently used, adding some back");
            for (ActionButton action : allActions) {
                if (action.isPhysical) {
                    physical.add(action);
                    if (physical.size() >= 3) break;
                }
            }
        }
        if (digital.isEmpty()) {
            Log.d(TAG, "All digital actions recently used, adding some back");
            for (ActionButton action : allActions) {
                if (!action.isPhysical) {
                    digital.add(action);
                    if (digital.size() >= 3) break;
                }
            }
        }
        
        // Prioritize by time and category
        physical = prioritizeByTime(physical, hourOfDay, true);
        digital = prioritizeByTime(digital, hourOfDay, false);
        
        // Calculate how many of each type
        int numPhysical = Math.round((count * physicalWeight) / 100f);
        int numDigital = count - numPhysical;
        
        // Ensure at least one of each if available
        numPhysical = Math.max(1, Math.min(numPhysical, physical.size()));
        numDigital = Math.max(1, Math.min(numDigital, digital.size()));
        
        List<ActionButton> selected = new ArrayList<>();
        
        // Add physical actions
        for (int i = 0; i < Math.min(numPhysical, physical.size()); i++) {
            selected.add(physical.get(i));
            trackAction(context, physical.get(i).deepLink);
        }
        
        // Add digital actions
        for (int i = 0; i < Math.min(numDigital, digital.size()); i++) {
            selected.add(digital.get(i));
            trackAction(context, digital.get(i).deepLink);
        }
        
        return selected;
    }
    
    /**
     * Prioritize actions based on time of day
     */
    private static List<ActionButton> prioritizeByTime(List<ActionButton> actions, int hourOfDay, boolean isPhysical) {
        List<ActionButton> prioritized = new ArrayList<>(actions);
        Random random = new Random();
        
        // Morning (6-10): Energizing actions first
        if (hourOfDay >= 6 && hourOfDay < 10) {
            prioritizeAction(prioritized, "walk");
            prioritizeAction(prioritized, "standing");
        }
        // Midday (10-15): Focus resets
        else if (hourOfDay >= 10 && hourOfDay < 15) {
            prioritizeAction(prioritized, "breathing");
            prioritizeAction(prioritized, "hydration");
            prioritizeAction(prioritized, "eye-rest");
        }
        // Afternoon (15-19): Reflection
        else if (hourOfDay >= 15 && hourOfDay < 19) {
            prioritizeAction(prioritized, "journal");
            prioritizeAction(prioritized, "stretch");
        }
        // Evening (19-22): Winding down
        else if (hourOfDay >= 19 && hourOfDay < 22) {
            prioritizeAction(prioritized, "gratitude");
            prioritizeAction(prioritized, "breathing");
        }
        // Night (22+): Rest
        else {
            prioritizeAction(prioritized, "breathing");
        }
        
        return prioritized;
    }
    
    /**
     * Move action to front of list if present
     */
    private static void prioritizeAction(List<ActionButton> actions, String deepLink) {
        for (int i = 0; i < actions.size(); i++) {
            if (actions.get(i).deepLink.equals(deepLink)) {
                ActionButton action = actions.remove(i);
                actions.add(0, action);
                break;
            }
        }
    }
    
    /**
     * Check if action was recently used
     */
    private static boolean wasRecentlyUsed(String deepLink) {
        return recentActions.contains(deepLink);
    }
    
    /**
     * Track action usage and persist to storage
     */
    private static void trackAction(Context context, String deepLink) {
        // Remove if already exists to move to end
        recentActions.remove(deepLink);
        recentActions.add(deepLink);
        
        // Trim to max size
        while (recentActions.size() > MAX_RECENT_ACTIONS) {
            recentActions.remove(0);
        }
        
        // Persist to storage
        saveToStorage(context);
        
        Log.d(TAG, "Tracked action: " + deepLink + ", recent list size: " + recentActions.size());
    }
    
    /**
     * Get all available actions with short labels for notification buttons
     */
    private static List<ActionButton> getAllActions() {
        List<ActionButton> actions = new ArrayList<>();
        
        // Physical actions (shortened labels for notification buttons)
        actions.add(new ActionButton("💧 Water", "hydration", true));
        actions.add(new ActionButton("👀 Eye rest", "eye-rest", true));
        actions.add(new ActionButton("🧘 Breathe", "breathing", true));
        actions.add(new ActionButton("🙆 Stretch", "stretch", true));
        actions.add(new ActionButton("🚶 Walk", "walk", true));
        actions.add(new ActionButton("🧍 Stand up", "standing", true));
        
        // New physical actions
        actions.add(new ActionButton("🧘 Meditate", "meditation", true));
        actions.add(new ActionButton("😴 Power Nap", "power-nap", true));
        actions.add(new ActionButton("👁️ Eye Yoga", "eye-yoga", true));
        actions.add(new ActionButton("🌬️ Box Breath", "box-breathing", true));
        actions.add(new ActionButton("🏋️ Move!", "micro-movement", true));
        actions.add(new ActionButton("☕ Mindful Sip", "mindful-sip", true));
        
        // Intentional digital actions (shortened labels)
        actions.add(new ActionButton("📝 Journal", "journal", false));
        actions.add(new ActionButton("🎙️ Voice", "voice", false));
        actions.add(new ActionButton("📸 Photo", "photo", false));
        actions.add(new ActionButton("🏆 Win", "win", false));
        actions.add(new ActionButton("🎯 Intention", "intention", false));
        actions.add(new ActionButton("✨ Gratitude", "gratitude", false));
        actions.add(new ActionButton("🧠 Focus Reset", "focus-reset", false));
        
        return actions;
    }
    
    /**
     * Get recent actions array for persistence
     */
    public static String[] getRecentActions() {
        return recentActions.toArray(new String[0]);
    }
    
    /**
     * Clear recent actions (useful for testing or reset)
     */
    public static void clearRecentActions(Context context) {
        recentActions.clear();
        if (context != null) {
            SharedPreferences prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
            prefs.edit().remove(RECENT_ACTIONS_KEY).apply();
        }
        Log.i(TAG, "Cleared recent actions");
    }
}
