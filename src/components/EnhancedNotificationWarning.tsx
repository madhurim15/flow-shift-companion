import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  Settings, 
  Chrome, 
  Monitor, 
  Smartphone,
  ExternalLink,
  RefreshCw
} from 'lucide-react';
import { type EnhancedNotificationState } from '@/hooks/useEnhancedNotifications';

interface EnhancedNotificationWarningProps {
  state: EnhancedNotificationState;
  onRequestPermission: () => void;
  onRefresh: () => void;
}

const getBrowserInstructions = (browserType: string) => {
  switch (browserType) {
    case 'chrome':
      return {
        icon: <Chrome className="h-4 w-4" />,
        steps: [
          'Click the lock icon or shield icon in the address bar',
          'Select "Notifications" and change to "Allow"',
          'Or go to Settings > Privacy and security > Site settings > Notifications',
          'Find this site and change the permission to "Allow"'
        ]
      };
    case 'firefox':
      return {
        icon: <Monitor className="h-4 w-4" />,
        steps: [
          'Click the shield icon in the address bar',
          'Select "Allow" for notifications',
          'Or go to Settings > Privacy & Security > Permissions > Notifications',
          'Click "Settings..." and add this site with "Allow" permission'
        ]
      };
    case 'safari':
      return {
        icon: <Smartphone className="h-4 w-4" />,
        steps: [
          'Go to Safari > Preferences > Websites > Notifications',
          'Find this website and change to "Allow"',
          'Or look for the notification icon in the address bar'
        ]
      };
    case 'edge':
      return {
        icon: <Monitor className="h-4 w-4" />,
        steps: [
          'Click the lock icon in the address bar',
          'Select "Notifications" and change to "Allow"',
          'Or go to Settings > Site permissions > Notifications',
          'Add this site with "Allow" permission'
        ]
      };
    default:
      return {
        icon: <Settings className="h-4 w-4" />,
        steps: [
          'Look for a notification icon in your browser\'s address bar',
          'Check your browser\'s site settings or permissions',
          'Find this website and enable notifications',
          'Refresh the page after making changes'
        ]
      };
  }
};

const getWarningContent = (state: EnhancedNotificationState) => {
  switch (state.permission) {
    case 'blocked-permanently':
      return {
        title: 'Notifications not supported',
        description: 'Your browser doesn\'t support notifications. You\'ll receive in-app reminders instead.',
        severity: 'destructive' as const,
        showInstructions: false
      };
    case 'blocked-settings':
      return {
        title: 'Notifications blocked in browser settings',
        description: 'You previously blocked notifications. Please enable them manually in your browser.',
        severity: 'destructive' as const,
        showInstructions: true
      };
    case 'denied':
      return {
        title: 'Notifications disabled',
        description: 'Browser notifications are turned off. Enable them for the best experience.',
        severity: 'default' as const,
        showInstructions: true
      };
    default:
      return {
        title: 'Notifications available',
        description: 'Click below to enable gentle reminder notifications.',
        severity: 'default' as const,
        showInstructions: false
      };
  }
};

const EnhancedNotificationWarning = ({ 
  state, 
  onRequestPermission, 
  onRefresh 
}: EnhancedNotificationWarningProps) => {
  const warningContent = getWarningContent(state);
  const browserInstructions = getBrowserInstructions(state.browserType);

  if (state.permission === 'granted') {
    return null;
  }

  return (
    <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
      <div className="p-4 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-amber-900 dark:text-amber-100">
                {warningContent.title}
              </h3>
              <Badge variant="outline" className="text-xs">
                {state.permission}
              </Badge>
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-200">
              {warningContent.description}
            </p>
          </div>
        </div>

        {warningContent.showInstructions && (
          <>
            <Separator className="bg-amber-200 dark:bg-amber-800" />
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-900 dark:text-amber-100">
                {browserInstructions.icon}
                How to enable notifications:
              </div>
              <ol className="text-sm text-amber-800 dark:text-amber-200 space-y-1 ml-6">
                {browserInstructions.steps.map((step, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="font-medium">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </>
        )}

        <div className="flex gap-2 flex-wrap">
          {state.canRequestAgain && (
            <Button 
              size="sm" 
              onClick={onRequestPermission}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              Enable Notifications
            </Button>
          )}

          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.open('#/permission-helper', '_blank', 'noopener,noreferrer')}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open Permission Helper
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="border-amber-300 text-amber-700 hover:bg-amber-100 dark:border-amber-700 dark:text-amber-300"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Check Again
          </Button>

          {state.browserType !== 'unknown' && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => window.open('https://support.google.com/chrome/answer/3220216', '_blank')}
              className="text-amber-700 hover:bg-amber-100 dark:text-amber-300"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Help Guide
            </Button>
          )}
        </div>

        <div className="text-xs text-amber-700 dark:text-amber-400 space-y-1">
          <div>Browser: {state.browserType} | Service Worker: {state.serviceWorkerReady ? 'Ready' : 'Not Ready'}</div>
          <div>💡 Don't worry - you'll still get in-app reminders even without browser notifications</div>
        </div>
      </div>
    </Card>
  );
};

export default EnhancedNotificationWarning;