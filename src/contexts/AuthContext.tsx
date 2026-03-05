import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { createUser, getUser } from '@/lib/supabase-services';
import { signUpWithProfile } from '@/lib/auth-api';
import type { User } from '@/types';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; user: SupabaseUser | null }>;
  logout: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = (user: SupabaseUser | null) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      // Add admin emails here
      const adminEmails = ['attiaali853@gmail.com', 'admin@petflik.com'];
      setIsAdmin(adminEmails.includes(user.email || ''));
    };

    const fetchUserProfile = async (userId: string) => {
      try {
        const profile = await getUser(userId);
        setUserProfile(profile);
      } catch (error) {
        console.error('AuthContext: Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    // Get initial session – race with short timeout so we never block the UI
    const getInitialSession = async () => {
      const SESSION_WAIT_MS = 4000;
      try {
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise<{ data: { session: null } }>((resolve) =>
          setTimeout(() => resolve({ data: { session: null } }), SESSION_WAIT_MS)
        );
        const { data } = await Promise.race([sessionPromise, timeoutPromise]);
        const session = data?.session;

        if (session?.user) {
          // Check if the access token is already expired.
          // If it is, don't trust the stored session yet — let Supabase's internal
          // _recoverAndRefresh handle the refresh. onAuthStateChange will fire
          // with the valid session (or SIGNED_OUT if the refresh token is also invalid).
          // This prevents a flood of 401 API calls when the project was paused/restored.
          const expiresAt = (session as any).expires_at ?? 0;
          const tokenExpired = expiresAt > 0 && expiresAt * 1000 < Date.now() + 5000;

          if (tokenExpired) {
            // Token is expired — try a silent refresh first
            const { data: refreshed, error: refreshErr } = await supabase.auth.refreshSession();
            if (refreshErr || !refreshed?.session) {
              // Refresh token is invalid (project was paused/restored) → clear it
              await supabase.auth.signOut({ scope: 'local' });
              setLoading(false);
              return;
            }
            // Refresh succeeded
            setCurrentUser(refreshed.session.user);
            checkAdminStatus(refreshed.session.user);
            setLoading(false);
            fetchUserProfile(refreshed.session.user.id);
          } else {
            // Token is still valid — set the user immediately
            setCurrentUser(session.user);
            checkAdminStatus(session.user);
            setLoading(false);
            fetchUserProfile(session.user.id);
          }
        } else {
          setLoading(false);
        }
      } catch (error) {
        setLoading(false);
      }
    };

    getInitialSession();

    // Hard cap: force loading off after 6s no matter what
    const timeoutId = setTimeout(() => {
      setLoading((prev) => (prev ? false : prev));
    }, 6000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' as any) {
        if (!session) {
          // Session was cleared (expired, project restored, or explicit sign-out)
          // Remove any stale local storage entries so re-login is clean
          try {
            Object.keys(localStorage)
              .filter(k => k.startsWith('sb-') && k.endsWith('-auth-token'))
              .forEach(k => localStorage.removeItem(k));
          } catch { /* ignore */ }
          setCurrentUser(null);
          setUserProfile(null);
          setLoading(false);
          return;
        }
      }

      setCurrentUser(session?.user ?? null);
      checkAdminStatus(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const SIGNIN_TIMEOUT_MS = 10000;
    const authPromise = supabase.auth.signInWithPassword({ email, password });
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Connection timed out. Please check your connection and try again.')), SIGNIN_TIMEOUT_MS)
    );
    const { error } = await Promise.race([authPromise, timeoutPromise]);
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      // Use the new signUpWithProfile function
      const result = await signUpWithProfile(email, password, {
        name: userData.name,
        phone: userData.phone,
        city: userData.city,
        postalCode: userData.postalCode,
        userType: userData.userType,
      });
      
      // If profile creation failed but auth user was created, that's still a success
      // The user can sign in and we can try to create the profile later
      return result;
    } catch (error) {
      // If the error is about profile creation but auth user was created, 
      // we should still consider it a success
      if (error instanceof Error && error.message.includes('profile')) {
        console.warn('Profile creation failed, but auth user was created');
        return { success: true, user: null };
      }
      throw error;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserProfile(null);
    setIsAdmin(false);

    const doRedirect = () => {
      window.location.href = '/home';
    };

    try {
      await Promise.race([
        supabase.auth.signOut(),
        new Promise<void>((resolve) => setTimeout(resolve, 3000)),
      ]);
    } catch (error) {
      console.error('Logout error:', error);
    }
    doRedirect();
  };

  const refreshUserProfile = async () => {
    if (!currentUser) return;
    try {
      const profile = await getUser(currentUser.id);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error refreshing user profile:', error);
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    isAdmin,
    signIn,
    signUp,
    logout,
    refreshUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 