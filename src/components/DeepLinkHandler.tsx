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
        // Parse: flowfocus://action/breathing (new) or flowlight://action/breathing (legacy)
        const actionPattern = /(?:flowfocus|flowlight):\/\/action\/(.+)/;
        const match = url.match(actionPattern);
        
        if (match) {
          const action = match[1];
          
          // Navigate to appropriate route
          const routeMap: Record<string, string> = {
            'breathing': '/breathing',
            'journal': '/journal',
            'voice': '/voice',
            'walk': '/walk',
            'stretch': '/stretch',
            'gratitude': '/gratitude',
            'meditation': '/meditation',
            'movement': '/micro-movement',
            // Balanced action routes
            'mood': '/app',
            'hydration': '/hydration',
            'eye-rest': '/eye-rest',
            'standing': '/standing',
            'photo': '/photo',
            'win': '/win',
            'intention': '/intention',
            // New nudge action routes
            'power-nap': '/power-nap',
            'eye-yoga': '/eye-yoga',
            'box-breathing': '/box-breathing',
            'focus-reset': '/focus-reset',
            'micro-movement': '/micro-movement',
            'mindful-sip': '/mindful-sip'
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
