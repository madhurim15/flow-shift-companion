
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { EnhancedInterventionModal } from "@/components/EnhancedInterventionModal";
import { Capacitor } from "@capacitor/core";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Focus from "./pages/Focus";
import Diagnostics from "./pages/Diagnostics";
import PermissionHelper from "./pages/PermissionHelper";
import SystemWideMonitoring from "./pages/SystemWideMonitoring";
import NotFound from "./pages/NotFound";

// Early startup logging for debugging
console.log('🚀 FlowLight App Starting');
console.log('📱 Platform:', Capacitor.getPlatform());
console.log('🏠 Native:', Capacitor.isNativePlatform());
console.log('🌐 URL:', window.location.href);
console.log('⚙️ Environment:', import.meta.env.MODE);

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
          <Sonner />
          <RouterProvider router={router} />
          <EnhancedInterventionModal />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
