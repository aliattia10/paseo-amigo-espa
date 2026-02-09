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

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          console.log('AuthContext: User found:', session.user.id);
          setCurrentUser(session.user);
          checkAdminStatus(session.user);
          await fetchUserProfile(session.user.id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('AuthContext: Error getting initial session:', error);
        setLoading(false);
      }
    };

    getInitialSession();

    // Safety timeout: prevent infinite loading if auth/profile fetch hangs
    const timeoutId = setTimeout(() => {
      setLoading((prev) => {
        if (prev) {
          console.warn('AuthContext: Loading timeout - forcing loading to false');
          return false;
        }
        return prev;
      });
    }, 5000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change:', event, session?.user?.id);
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
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      throw error;
    }
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
    try {
      // Clear all state immediately
      setCurrentUser(null);
      setUserProfile(null);
      setIsAdmin(false);
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Force reload to home page to clear any remaining local state/cache
      window.location.href = '/home';
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, ensure we redirect to home
      window.location.href = '/home';
      throw error;
    }
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