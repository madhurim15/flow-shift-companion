
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { User, LogOut, Settings, Bug, Smartphone, Zap, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { SystemMonitoring } from '@/plugins/system-monitoring';
import { useState, useEffect } from 'react';

const UserMenu = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isDebugEnabled, setIsDebugEnabled] = useState(false);
  const [hasUsageAccess, setHasUsageAccess] = useState(false);
  
  const isNativeAndroid = Capacitor.getPlatform() === 'android' && Capacitor.isNativePlatform();

  // Check debug state and usage access on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const debugParam = urlParams.get('debug') === '1';
    const debugStorage = localStorage.getItem('debug-panel-enabled') === 'true';
    
    // Only show developer tools if explicitly enabled
    setIsDebugEnabled(debugParam || debugStorage);

    // Check usage access if on native Android
    if (isNativeAndroid) {
      checkUsageAccess();
    }
  }, [isNativeAndroid]);

  const checkUsageAccess = async () => {
    try {
      const permissions = await SystemMonitoring.checkPermissions();
      setHasUsageAccess(permissions.usageAccess);
    } catch (error) {
      console.error('Failed to check usage access:', error);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Couldn't sign out",
        description: "Please try again in a moment.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "Take care of yourself. We'll be here when you're ready to return. 💙"
      });
    }
  };

  const toggleDebugPanel = () => {
    const newState = !isDebugEnabled;
    setIsDebugEnabled(newState);
    localStorage.setItem('debug-panel-enabled', newState.toString());
    
    toast({
      title: newState ? "Debug Panel Enabled" : "Debug Panel Disabled",
      description: newState ? "Access test controls via the debug interface" : "Returning to normal mode",
      duration: 3000
    });
  };

  const handleStartMonitoring = async () => {
    try {
      await SystemMonitoring.startMonitoring({ debug: true });
      toast({
        title: "Monitoring Started",
        description: "FlowLight monitoring is now active with debug thresholds",
        duration: 4000
      });
      checkUsageAccess();
    } catch (error) {
      toast({
        title: "Failed to Start",
        description: "Could not start monitoring. Check permissions.",
        variant: "destructive"
      });
    }
  };

  const handleStopMonitoring = async () => {
    try {
      await SystemMonitoring.stopMonitoring();
      toast({
        title: "Monitoring Stopped",
        description: "FlowLight monitoring has been paused",
        duration: 3000
      });
    } catch (error) {
      toast({
        title: "Failed to Stop",
        description: "Could not stop monitoring service",
        variant: "destructive"
      });
    }
  };

  const handleOpenUsageSettings = async () => {
    try {
      await SystemMonitoring.requestPermissions();
      toast({
        title: "Opening Settings",
        description: "Please enable Usage Access for FlowLight",
        duration: 5000
      });
    } catch (error) {
      toast({
        title: "Settings Error",
        description: "Could not open Usage Access settings",
        variant: "destructive"
      });
    }
  };

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gentle-hover">
          <User className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem disabled className="text-xs text-muted-foreground">
          {user.email}
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/account')}>
          <Settings className="mr-2 h-4 w-4" />
          Account Settings
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => navigate('/diagnostics')}>
          <BarChart3 className="mr-2 h-4 w-4" />
          Diagnostics
        </DropdownMenuItem>
        
        {/* Developer Tools - Only show if debug mode is enabled */}
        {isNativeAndroid && isDebugEnabled && (
          <>
            <DropdownMenuSeparator />
            <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
              Developer Tools
            </div>
            
            <DropdownMenuItem onClick={toggleDebugPanel}>
              <Bug className="mr-2 h-4 w-4" />
              {isDebugEnabled ? 'Disable' : 'Enable'} Debug Panel
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleStartMonitoring}>
              <Zap className="mr-2 h-4 w-4" />
              Start Monitoring
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleStopMonitoring}>
              <Settings className="mr-2 h-4 w-4" />
              Stop Monitoring
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleOpenUsageSettings}>
              <Smartphone className="mr-2 h-4 w-4" />
              Open Usage Access Settings
              {!hasUsageAccess && (
                <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500" />
              )}
            </DropdownMenuItem>
          </>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserMenu;
