import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface AppChangedEvent {
  package: string;
  appName?: string;
}

export interface DurationUpdateEvent {
  package: string;
  appName?: string;
  durationSeconds: number;
}

export interface SystemMonitoringPlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  checkPermissions(): Promise<{ usageAccess: boolean }>;
  hasUsageStatsPermission(): Promise<{ granted: boolean }>;
  startMonitoring(options?: { debug?: boolean; userName?: string }): Promise<void>;
  stopMonitoring(): Promise<void>;
  openBatteryOptimizationSettings(): Promise<void>;
  openAppSettings(): Promise<void>;
  getStatus(): Promise<{ 
    usageAccess: boolean; 
    notificationsEnabled: boolean; 
    serviceRunning: boolean;
  }>;
  restartMonitoring(options?: { debug?: boolean; userName?: string }): Promise<{ restarted: boolean }>;
  scheduleMidnightReschedule(): Promise<void>;
  cancelMidnightReschedule(): Promise<void>;
  getBuildStamp(): Promise<{ buildStamp: number }>;
  
  // Daily reminder methods (native AlarmManager-based)
  setDailyReminderTimes(options: {
    morning?: string;
    afternoon?: string;
    evening?: string;
    night?: string;
  }): Promise<{ scheduled: boolean }>;
  cancelDailyReminders(): Promise<void>;
  scheduleDailyReminders(): Promise<void>;
  
  addListener(
    eventName: 'appChanged',
    listenerFunc: (event: AppChangedEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'durationUpdate', 
    listenerFunc: (event: DurationUpdateEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'midnightReschedule',
    listenerFunc: () => void
  ): Promise<PluginListenerHandle>;
}

export const SystemMonitoring = registerPlugin<SystemMonitoringPlugin>('SystemMonitoring');

export type { PluginListenerHandle };
