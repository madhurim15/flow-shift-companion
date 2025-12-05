
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashRouter, RouterProvider, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { TrialProvider } from "@/contexts/TrialContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedInterventionModal } from "@/components/EnhancedInterventionModal";
import { MonitoringBootstrap } from "@/components/MonitoringBootstrap";
import { DeepLinkHandler } from "@/components/DeepLinkHandler";
import { Capacitor } from "@capacitor/core";
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
import Hydration from "./pages/Hydration";
import EyeRest from "./pages/EyeRest";
import StandingBreak from "./pages/StandingBreak";
import PhotoCapture from "./pages/PhotoCapture";
import WinLog from "./pages/WinLog";
import IntentionReset from "./pages/IntentionReset";
import Account from "./pages/Account";
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
    path: "/hydration",
    element: <ProtectedRoute><Hydration /></ProtectedRoute>
  },
  {
    path: "/eye-rest",
    element: <ProtectedRoute><EyeRest /></ProtectedRoute>
  },
  {
    path: "/standing",
    element: <ProtectedRoute><StandingBreak /></ProtectedRoute>
  },
  {
    path: "/photo",
    element: <ProtectedRoute><PhotoCapture /></ProtectedRoute>
  },
  {
    path: "/win",
    element: <ProtectedRoute><WinLog /></ProtectedRoute>
  },
  {
    path: "/intention",
    element: <ProtectedRoute><IntentionReset /></ProtectedRoute>
  },
  {
    path: "/account",
    element: <ProtectedRoute><Account /></ProtectedRoute>
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

// Wrapper component to provide router context to DeepLinkHandler
const AppContent = () => {
  return (
    <>
      <DeepLinkHandler />
    </>
  );
};

const App = () => {
  const isNativeAndroid = Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
  
  // Create router with AppContent included in layout
  const routerWithDeepLink = createHashRouter([
    {
      path: "/",
      element: (
        <>
          <AppContent />
          <LandingRoute />
        </>
      )
    },
    {
      path: "/auth",
      element: (
        <>
          <AppContent />
          <Auth />
        </>
      )
    },
    {
      path: "/app",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><Index /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/focus",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><Focus /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/diagnostics",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><Diagnostics /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/permission-helper",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><PermissionHelper /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/monitoring",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><SystemWideMonitoring /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/journal",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><QuickJournal /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/breathing",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><BreathingExercise /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/stretch",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><MicroStretch /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/walk",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><WalkTimer /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/voice",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><VoiceReflection /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/gratitude",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><QuickGratitude /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/hydration",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><Hydration /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/eye-rest",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><EyeRest /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/standing",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><StandingBreak /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/photo",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><PhotoCapture /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/win",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><WinLog /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/intention",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><IntentionReset /></ProtectedRoute>
        </>
      )
    },
    {
      path: "/account",
      element: (
        <>
          <AppContent />
          <ProtectedRoute><Account /></ProtectedRoute>
        </>
      )
    },
    {
      path: "*",
      element: (
        <>
          <AppContent />
          <NotFound />
        </>
      )
    }
  ]);
  
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <TrialProvider>
              <TooltipProvider>
                <Toaster />
                <RouterProvider router={routerWithDeepLink} />
                <EnhancedInterventionModal />
                {isNativeAndroid && <MonitoringBootstrap />}
              </TooltipProvider>
            </TrialProvider>
          </AuthProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
