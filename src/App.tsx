
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedInterventionModal } from "@/components/EnhancedInterventionModal";
import { MonitoringBootstrap } from "@/components/MonitoringBootstrap";
import { Capacitor } from "@capacitor/core";
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
    element: <Index />
  },
  {
    path: "/auth",
    element: <Auth />
  },
  {
    path: "/focus",
    element: <Focus />
  },
  {
    path: "/diagnostics",
    element: <Diagnostics />
  },
  {
    path: "/permission-helper",
    element: <PermissionHelper />
  },
  {
    path: "/monitoring",
    element: <SystemWideMonitoring />
  },
  {
    path: "/journal",
    element: <QuickJournal />
  },
  {
    path: "/breathing",
    element: <BreathingExercise />
  },
  {
    path: "/stretch",
    element: <MicroStretch />
  },
  {
    path: "/walk",
    element: <WalkTimer />
  },
  {
    path: "/voice",
    element: <VoiceReflection />
  },
  {
    path: "/gratitude",
    element: <QuickGratitude />
  },
  {
    path: "*",
    element: <NotFound />
  }
]);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <RouterProvider router={router} />
          <EnhancedInterventionModal />
          <MonitoringBootstrap />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
