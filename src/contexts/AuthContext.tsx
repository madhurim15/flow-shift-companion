
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthContext: Initializing auth listener', {
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      userAgent: navigator.userAgent
    });

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email,
          isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Force storage update on mobile
        if (session && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
          console.log('Mobile detected: Ensuring session persistence');
          localStorage.setItem('supabase.auth.token', JSON.stringify(session));
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session check:', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userEmail: session?.user?.email,
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      });
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    console.log('Sign up redirect URL:', redirectUrl);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting sign in...', { 
        email, 
        online: navigator.onLine,
        timestamp: new Date().toISOString()
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('Supabase auth error:', {
          message: error.message,
          status: error.status,
          name: error.name,
          stack: error.stack
        });
      } else {
        console.log('Sign in successful:', { 
          userId: data.user?.id,
          sessionExists: !!data.session 
        });
      }
      
      return { error };
    } catch (err: any) {
      console.error('Unexpected error during sign in:', {
        message: err?.message,
        name: err?.name,
        stack: err?.stack,
        online: navigator.onLine
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
