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
  startMonitoring(options?: { debug?: boolean }): Promise<void>;
  stopMonitoring(): Promise<void>;
  addListener(
    eventName: 'appChanged',
    listenerFunc: (event: AppChangedEvent) => void
  ): Promise<PluginListenerHandle>;
  addListener(
    eventName: 'durationUpdate', 
    listenerFunc: (event: DurationUpdateEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const SystemMonitoring = registerPlugin<SystemMonitoringPlugin>('SystemMonitoring');

export type { PluginListenerHandle };
