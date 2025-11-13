import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';

export const DeepLinkHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const handleDeepLink = (data: URLOpenListenerEvent) => {
      const url = data.url;
      console.log('Deep link opened:', url);
      
      try {
        // Parse: flowlight://action/breathing
        if (url.includes('flowlight://action/')) {
          const action = url.split('flowlight://action/')[1];
          
          // Navigate to appropriate route
          const routeMap: Record<string, string> = {
            'breathing': '/breathing',
            'journal': '/journal',
            'voice': '/voice',
            'walk': '/walk',
            'stretch': '/stretch',
            'gratitude': '/gratitude',
            'meditation': '/breathing', // Alias for breathing
            'movement': '/walk'         // Alias for walk
          };
          
          if (routeMap[action]) {
            console.log('Navigating to:', routeMap[action]);
            // Add 150ms delay for Samsung initialization
            setTimeout(() => {
              navigate(routeMap[action]);
            }, 150);
          }
        }
      } catch (error) {
        console.error('Deep link navigation error:', error);
      }
    };
    
    const listener = App.addListener('appUrlOpen', handleDeepLink);
    
    return () => {
      listener.then(handle => handle.remove());
    };
  }, [navigate]);
  
  return null;
};
