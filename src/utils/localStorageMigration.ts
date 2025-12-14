/**
 * Migrates localStorage keys from old FlowLight naming to FlowFocus
 * Run this once on app startup to preserve user data
 */

const KEY_MIGRATIONS: Record<string, string> = {
  'flowlight_onboarding_complete': 'flowfocus_onboarding_complete',
  'flowlight_first_week_tips_visits': 'flowfocus_first_week_tips_visits',
  'flowlight_first_week_tips_dismissed': 'flowfocus_first_week_tips_dismissed',
  'flowlight_theme': 'flowfocus_theme',
  'flowlight_notifications_enabled': 'flowfocus_notifications_enabled',
  'flowlight_usage_access_granted': 'flowfocus_usage_access_granted',
  'flowlight_doom_scrolling_pattern': 'flowfocus_doom_scrolling_pattern',
  'flowlight_last_pattern_reset': 'flowfocus_last_pattern_reset',
  'flowlight_last_scheduled_date': 'flowfocus_last_scheduled_date',
  'flowlight-notification-asked': 'flowfocus-notification-asked',
  'flowlight-permission-result': 'flowfocus-permission-result',
};

const MIGRATION_FLAG = 'flowfocus_migration_v1_complete';

export const runLocalStorageMigration = (): void => {
  // Check if migration already ran
  if (localStorage.getItem(MIGRATION_FLAG)) {
    return;
  }

  console.log('🔄 Running FlowFocus localStorage migration...');
  
  let migratedCount = 0;

  Object.entries(KEY_MIGRATIONS).forEach(([oldKey, newKey]) => {
    const oldValue = localStorage.getItem(oldKey);
    
    if (oldValue !== null) {
      // Only migrate if new key doesn't already exist
      if (localStorage.getItem(newKey) === null) {
        localStorage.setItem(newKey, oldValue);
        console.log(`  ✅ Migrated: ${oldKey} → ${newKey}`);
        migratedCount++;
      }
      
      // Remove old key after migration
      localStorage.removeItem(oldKey);
    }
  });

  // Mark migration as complete
  localStorage.setItem(MIGRATION_FLAG, new Date().toISOString());
  
  console.log(`✅ Migration complete. Migrated ${migratedCount} keys.`);
};

/**
 * Helper to get a FlowFocus localStorage key with fallback to old key
 */
export const getFlowFocusItem = (key: string): string | null => {
  const newKey = `flowfocus_${key}`;
  const oldKey = `flowlight_${key}`;
  
  return localStorage.getItem(newKey) ?? localStorage.getItem(oldKey);
};

/**
 * Helper to set a FlowFocus localStorage key
 */
export const setFlowFocusItem = (key: string, value: string): void => {
  localStorage.setItem(`flowfocus_${key}`, value);
};
