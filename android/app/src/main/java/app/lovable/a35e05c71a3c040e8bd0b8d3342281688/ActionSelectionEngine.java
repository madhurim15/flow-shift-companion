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
     */
    public static List<ActionButton> getContextualActions(
        int level,
        String appCategory,
        int durationMinutes,
        int hourOfDay,
        String[] existingRecentActions
    ) {
        // Update recent actions tracking
        if (existingRecentActions != null) {
            recentActions = new ArrayList<>(Arrays.asList(existingRecentActions));
        }
        
        List<ActionButton> allActions = getAllActions();
        List<ActionButton> selectedActions = new ArrayList<>();
        
        // Always include mood check option
        ActionButton moodCheck = new ActionButton("How am I feeling?", "mood", false);
        
        // Determine physical/digital ratio based on duration and level
        int physicalWeight = getPhysicalWeight(durationMinutes, level);
        int numActions = level == 1 ? 2 : 3; // Level 1: 2 actions, Level 2-3: 3 actions
        
        // For Level 3, require physical actions (no dismiss, must act)
        if (level >= 3) {
            selectedActions = selectPhysicalActions(allActions, numActions, hourOfDay, appCategory);
        } else {
            selectedActions = selectBalancedActions(allActions, numActions, physicalWeight, hourOfDay, appCategory);
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
     * Get all available actions
     */
    private static List<ActionButton> getAllActions() {
        List<ActionButton> actions = new ArrayList<>();
        
        // Physical actions
        actions.add(new ActionButton("💧 Sip water", "hydration", true));
        actions.add(new ActionButton("👀 Eye rest (20s)", "eye-rest", true));
        actions.add(new ActionButton("🧘 3 deep breaths", "breathing", true));
        actions.add(new ActionButton("🙆 Quick stretch", "stretch", true));
        actions.add(new ActionButton("🚶 5-min walk", "walk", true));
        actions.add(new ActionButton("🧍 Stand & shake", "standing", true));
        
        // Intentional digital actions
        actions.add(new ActionButton("📝 Quick journal", "journal", false));
        actions.add(new ActionButton("🎙️ Voice note", "voice", false));
        actions.add(new ActionButton("📸 Photo moment", "photo", false));
        actions.add(new ActionButton("🏆 Log today's win", "win", false));
        actions.add(new ActionButton("🎯 Set intention", "intention", false));
        actions.add(new ActionButton("✨ Gratitude", "gratitude", false));
        
        return actions;
    }
    
    /**
     * Get recent actions array for persistence
     */
    public static String[] getRecentActions() {
        return recentActions.toArray(new String[0]);
    }
}
