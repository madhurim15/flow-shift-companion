import { BUILD_STAMP, BUILD_DATE } from '@/buildInfo';
import { Capacitor } from '@capacitor/core';
import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const BuildInfoBanner = () => {
  useEffect(() => {
    console.log('🏗️ BUILD INFO:', {
      BUILD_STAMP,
      BUILD_DATE,
      platform: Capacitor.getPlatform(),
      isNative: Capacitor.isNativePlatform(),
    });
  }, []);

  return (
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <CardContent className="pt-6">
        <div className="text-sm font-mono space-y-1">
          <div><strong>Build Stamp:</strong> {BUILD_STAMP}</div>
          <div><strong>Build Date:</strong> {BUILD_DATE}</div>
          <div><strong>Platform:</strong> {Capacitor.getPlatform()}</div>
          <div><strong>Native:</strong> {Capacitor.isNativePlatform() ? 'Yes' : 'No'}</div>
        </div>
      </CardContent>
    </Card>
  );
};
