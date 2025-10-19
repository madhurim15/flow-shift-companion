import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';

export const DeepLinkHandler = () => {
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const handleDeepLink = (data: URLOpenListenerEvent) => {
      const url = data.url;
      console.log('Deep link opened:', url);
      
      // Parse: flowlight://action/breathing
      if (url.includes('flowlight://action/')) {
        const action = url.split('flowlight://action/')[1];
        
        // Navigate to appropriate route using hash router
        const routeMap: Record<string, string> = {
          'breathing': '/breathing',
          'journal': '/journal',
          'voice': '/voice',
          'walk': '/walk',
          'stretch': '/stretch',
          'gratitude': '/gratitude'
        };
        
        if (routeMap[action]) {
          console.log('Navigating to:', routeMap[action]);
          window.location.hash = routeMap[action];
        }
      }
    };
    
    const listener = App.addListener('appUrlOpen', handleDeepLink);
    
    return () => {
      listener.then(handle => handle.remove());
    };
  }, []);
  
  return null;
};
