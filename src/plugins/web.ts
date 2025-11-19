// src/plugins/web.ts
import { WebPlugin } from '@capacitor/core';
import type { SystemMonitoringPlugin } from './system-monitoring';

export class SystemMonitoringWeb extends WebPlugin implements SystemMonitoringPlugin {
  async requestPermissions(): Promise<{ granted: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { granted: false };
  }

  async checkPermissions(): Promise<{ usageAccess: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { usageAccess: false };
  }

  async hasUsageStatsPermission(): Promise<{ granted: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { granted: false };
  }

  async startMonitoring(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async stopMonitoring(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async openBatteryOptimizationSettings(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async openAppSettings(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async getStatus(): Promise<{ usageAccess: boolean; notificationsEnabled: boolean; serviceRunning: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { usageAccess: false, notificationsEnabled: false, serviceRunning: false };
  }

  async restartMonitoring(): Promise<{ restarted: boolean }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { restarted: false };
  }

  async scheduleMidnightReschedule(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async cancelMidnightReschedule(): Promise<void> {
    console.warn('SystemMonitoring is not supported on web.');
  }

  async getBuildStamp(): Promise<{ buildStamp: number }> {
    console.warn('SystemMonitoring is not supported on web.');
    return { buildStamp: 0 };
  }
}
