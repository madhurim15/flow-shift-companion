
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashRouter, RouterProvider, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TrialProvider } from "@/contexts/TrialContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedInterventionModal } from "@/components/EnhancedInterventionModal";
import { MonitoringBootstrap } from "@/components/MonitoringBootstrap";
import { Capacitor } from "@capacitor/core";
import { App as CapApp } from '@capacitor/app';
import type { URLOpenListenerEvent } from '@capacitor/app';
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Focus from "./pages/Focus";
import Diagnostics from "./pages/Diagnostics";
import PermissionHelper from "./pages/PermissionHelper";
import SystemWideMonitoring from "./pages/SystemWideMonitoring";
import QuickJournal from "./pages/QuickJournal";
import BreathingExercise from "./pages/BreathingExercise";
import MicroStretch from "./pages/MicroStretch";
import WalkTimer from "./pages/WalkTimer";
import VoiceReflection from "./pages/VoiceReflection";
import QuickGratitude from "./pages/QuickGratitude";
import NotFound from "./pages/NotFound";

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

// Landing route wrapper (redirects to /app if authenticated)
const LandingRoute = () => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (user) {
    return <Navigate to="/app" replace />;
  }
  
  return <Landing />;
};

// Early startup logging for debugging
console.log('🚀 FlowLight App Starting');
console.log('📱 Platform:', Capacitor.getPlatform());
console.log('🏠 Native:', Capacitor.isNativePlatform());
console.log('🌐 URL:', window.location.href);
console.log('⚙️ Environment:', import.meta.env.MODE);
if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
  // Log available Capacitor plugins to confirm native bridge exposure
  // @ts-ignore
  const pluginKeys = Object.keys((window as any).Capacitor?.Plugins || {});
  console.log('🔌 Capacitor plugins:', pluginKeys);
  console.log('🔎 SystemMonitoring present:', pluginKeys.includes('SystemMonitoring'));
}

const queryClient = new QueryClient();

const router = createHashRouter([
  {
    path: "/",
    element: <LandingRoute />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/app",
    element: <ProtectedRoute><Index /></ProtectedRoute>
  },
  {
    path: "/focus",
    element: <ProtectedRoute><Focus /></ProtectedRoute>
  },
  {
    path: "/diagnostics",
    element: <ProtectedRoute><Diagnostics /></ProtectedRoute>
  },
  {
    path: "/permission-helper",
    element: <ProtectedRoute><PermissionHelper /></ProtectedRoute>
  },
  {
    path: "/monitoring",
    element: <ProtectedRoute><SystemWideMonitoring /></ProtectedRoute>
  },
  {
    path: "/journal",
    element: <ProtectedRoute><QuickJournal /></ProtectedRoute>
  },
  {
    path: "/breathing",
    element: <ProtectedRoute><BreathingExercise /></ProtectedRoute>
  },
  {
    path: "/stretch",
    element: <ProtectedRoute><MicroStretch /></ProtectedRoute>
  },
  {
    path: "/walk",
    element: <ProtectedRoute><WalkTimer /></ProtectedRoute>
  },
  {
    path: "/voice",
    element: <ProtectedRoute><VoiceReflection /></ProtectedRoute>
  },
  {
    path: "/gratitude",
    element: <ProtectedRoute><QuickGratitude /></ProtectedRoute>
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

// Deep-link handler component
const DeepLinkHandler = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    
    const handleDeepLink = (data: URLOpenListenerEvent) => {
      const url = data.url;
      console.log('Deep link opened:', url);
      
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
          'gratitude': '/gratitude'
        };
        
        if (routeMap[action]) {
          console.log('Navigating to:', routeMap[action]);
          navigate(routeMap[action]);
        }
      }
    };
    
    const listener = CapApp.addListener('appUrlOpen', handleDeepLink);
    
    return () => {
      listener.then(handle => handle.remove());
    };
  }, [navigate]);
  
  return null;
};

const App = () => {
  const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TrialProvider>
            <TooltipProvider>
              <Toaster />
              <RouterProvider router={router}>
                <DeepLinkHandler />
              </RouterProvider>
              <EnhancedInterventionModal />
              {isNativeAndroid && <MonitoringBootstrap />}
            </TooltipProvider>
          </TrialProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
