package app.lovable.a35e05c71a3c040e8bd0b8d3342281688;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Random;
import java.util.Set;

public class ActionSelectionEngine {
    
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
    
    // Track recent actions to prevent repetition
    private static List<String> recentActions = new ArrayList<>();
    private static final int MAX_RECENT_ACTIONS = 5;
    
    /**
     * Get contextually appropriate actions based on usage patterns
     * Now accepts suggestedActions from the nudge message for alignment
     */
    public static List<ActionButton> getContextualActions(
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions,
        String suggestedActions
    ) {
        // Update recent actions tracking
        if (existingRecentActions != null) {
            recentActions = new ArrayList<>(Arrays.asList(existingRecentActions));
        }
        
        List<ActionButton> allActions = getAllActions();
        List<ActionButton> selectedActions = new ArrayList<>();
        
        // Always include mood check option (shortened label)
        ActionButton moodCheck = new ActionButton("😊 Mood", "mood", false);
        
        int numActions = 2; // Always use 2 actions for better notification visibility
        
        // If we have suggested actions from the message, prioritize those
        if (suggestedActions != null && !suggestedActions.isEmpty()) {
            selectedActions = selectSuggestedActions(allActions, suggestedActions, numActions);
        } else {
            // Fallback to original logic
            int physicalWeight = getPhysicalWeight(durationMinutes, level);
            
            // For Level 3, require physical actions (no dismiss, must act)
            if (level >= 3) {
                selectedActions = selectPhysicalActions(allActions, numActions, hourOfDay, appCategory);
            } else {
                selectedActions = selectBalancedActions(allActions, numActions, physicalWeight, hourOfDay, appCategory);
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
     * Backward-compatible overload without suggestedActions
     */
    public static List<ActionButton> getContextualActions(
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions
    ) {
        return getContextualActions(level, appCategory, durationMinutes, hourOfDay, existingRecentActions, null);
    }
    
    /**
     * Select actions based on suggested actions from the nudge message
     */
    private static List<ActionButton> selectSuggestedActions(
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
                    trackAction(action.deepLink);
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
                    trackAction(action.deepLink);
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
        
        // Prioritize by time of day
        physical = prioritizeByTime(physical, hourOfDay, true);
        
        List<ActionButton> selected = new ArrayList<>();
        for (int i = 0; i < Math.min(count, physical.size()); i++) {
            selected.add(physical.get(i));
            trackAction(physical.get(i).deepLink);
        }
        
        return selected;
    }
    
    /**
     * Select balanced mix of physical and digital actions
     */
    private static List<ActionButton> selectBalancedActions(
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
            trackAction(physical.get(i).deepLink);
        }
        
        // Add digital actions
        for (int i = 0; i < Math.min(numDigital, digital.size()); i++) {
            selected.add(digital.get(i));
            trackAction(digital.get(i).deepLink);
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
     * Track action usage
     */
    private static void trackAction(String deepLink) {
        recentActions.add(deepLink);
        if (recentActions.size() > MAX_RECENT_ACTIONS) {
            recentActions.remove(0);
        }
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
}
