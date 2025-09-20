import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface AppChangedEvent {
  package: string;
  appName?: string;
}

export interface SystemMonitoringPlugin {
  requestPermissions(): Promise<{ granted: boolean }>;
  startMonitoring(): Promise<void>;
  stopMonitoring(): Promise<void>;
  addListener(
    eventName: 'appChanged',
    listenerFunc: (event: AppChangedEvent) => void
  ): Promise<PluginListenerHandle>;
}

export const SystemMonitoring = registerPlugin<SystemMonitoringPlugin>('SystemMonitoring');

export type { PluginListenerHandle };
