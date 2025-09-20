import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SystemWideMonitoringDashboard } from '@/components/SystemWideMonitoringDashboard';

const SystemWideMonitoring: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Authentication guard - redirect if not authenticated
  useEffect(() => {
    console.log('SystemWideMonitoring auth check:', { 
      user: !!user, 
      loading, 
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    });
    
    if (!loading && !user) {
      console.log('SystemWideMonitoring: Redirecting to /auth - no user found');
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    console.log('SystemWideMonitoring: No user, returning null');
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SystemWideMonitoringDashboard />
    </div>
  );
};

export default SystemWideMonitoring;