// src/plugins/web.ts
import { WebPlugin } from '@capacitor/core';
import type { SystemMonitoringPlugin, TodayUsage } from './SystemMonitoringPlugin';

export class SystemMonitoringWeb extends WebPlugin implements SystemMonitoringPlugin {
  async checkPermission(): Promise<{ granted: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { granted: false };
  }

  async openUsageAccessSettings(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async getTodayUsage(): Promise<TodayUsage> {
    console.warn('SystemMonitoring is not supported on web.');
    return { totalScreenTime: 0, apps: [] };
  }

  async getCurrentApp(): Promise<{ appName: string; packageName: string }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { appName: 'N/A', packageName: 'N/A' };
  }
}
