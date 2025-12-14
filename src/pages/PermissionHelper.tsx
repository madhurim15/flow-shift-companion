import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Check, CircleAlert, BellRing, ExternalLink } from 'lucide-react';

const CHANNEL_NAME = 'flowfocus-permission';

const PermissionHelper = () => {
  const [supported, setSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');

  useEffect(() => {
    document.title = 'Enable Notifications • FlowFocus';

    const isSupported = 'Notification' in window;
    setSupported(isSupported);
    if (!isSupported) {
      setPermission('unsupported');
      return;
    }

    setPermission(Notification.permission);
  }, []);

  const broadcastResult = (perm: NotificationPermission | 'unsupported') => {
    try {
      // BroadcastChannel (best)
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ type: 'permission-result', permission: perm, at: Date.now() });
      bc.close();
    } catch {}

    try {
      // localStorage fallback
      localStorage.setItem('flowfocus-permission-result', JSON.stringify({ permission: perm, at: Date.now() }));
      localStorage.setItem('flowfocus-notification-asked', 'true');
    } catch {}
  };

  const handleRequest = async () => {
    if (!supported) return;
    try {
      // Mark that we've asked
      try { localStorage.setItem('flowfocus-notification-asked', 'true'); } catch {}

      const perm = await Notification.requestPermission();
      setPermission(perm);
      broadcastResult(perm);

      // Try to close if we were opened programmatically
      setTimeout(() => {
        try { window.close(); } catch {}
      }, 300);
    } catch (e) {
      console.error('Permission request failed', e);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellRing className="h-5 w-5" />
            Enable Browser Notifications
          </CardTitle>
          <CardDescription>
            This helper opens in its own tab to ensure the browser shows the native permission prompt.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Status: {supported ? (
              <Badge variant={permission === 'granted' ? 'default' : permission === 'denied' ? 'destructive' : 'outline'} className="ml-1">
                {permission}
              </Badge>
            ) : (
              <span className="inline-flex items-center gap-1"><CircleAlert className="h-4 w-4" /> Not supported</span>
            )}
          </div>

          <Separator />

          <div className="space-y-2 text-sm">
            <p>Click the button below to trigger the browser's native notification permission prompt.</p>
            <p>If you don't see a prompt, your browser may be blocking it. Check the address bar for a bell/lock icon.</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleRequest} disabled={!supported || permission === 'granted'}>
              <BellRing className="h-4 w-4 mr-2" />
              {permission === 'granted' ? 'Already Enabled' : 'Enable Notifications'}
            </Button>
            <Button variant="outline" onClick={() => window.open('https://support.google.com/chrome/answer/3220216', '_blank', 'noopener,noreferrer')}>
              <ExternalLink className="h-4 w-4 mr-2" />Help
            </Button>
          </div>

          {permission === 'granted' && (
            <div className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <Check className="h-4 w-4" />
              You can close this tab and return to FlowFocus.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PermissionHelper;
