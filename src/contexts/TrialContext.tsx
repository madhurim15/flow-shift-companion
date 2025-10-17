import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

interface TrialContextType {
  isInTrial: boolean;
  daysRemaining: number;
  trialEnded: boolean;
  trialStartDate: Date | null;
}

const TrialContext = createContext<TrialContextType | undefined>(undefined);

export const useTrialContext = () => {
  const context = useContext(TrialContext);
  if (!context) {
    throw new Error('useTrialContext must be used within TrialProvider');
  }
  return context;
};

export const TrialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [trialInfo, setTrialInfo] = useState<TrialContextType>({
    isInTrial: false,
    daysRemaining: 0,
    trialEnded: false,
    trialStartDate: null
  });

  useEffect(() => {
    if (user?.created_at) {
      const createdAt = new Date(user.created_at);
      const now = new Date();
      const daysSinceCreation = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24));
      const daysRemaining = Math.max(0, 14 - daysSinceCreation);
      
      setTrialInfo({
        isInTrial: daysSinceCreation < 14,
        daysRemaining,
        trialEnded: daysSinceCreation >= 14,
        trialStartDate: createdAt
      });
    }
  }, [user]);

  return (
    <TrialContext.Provider value={trialInfo}>
      {children}
    </TrialContext.Provider>
  );
};
