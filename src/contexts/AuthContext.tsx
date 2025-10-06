import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { createUser, getUser } from '@/lib/supabase-services';
import { signUpWithProfile } from '@/lib/auth-api';
import type { User } from '@/types';

interface AuthContextType {
  currentUser: SupabaseUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => Promise<{ success: boolean; user: SupabaseUser | null }>;
  logout: () => Promise<void>;
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

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        console.log('AuthContext: Getting initial session...');
        
        // Get session without timeout to prevent hanging issues
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }
        console.log('AuthContext: Session data:', session);
        
        if (session?.user) {
          console.log('AuthContext: User found:', session.user.id);
          setCurrentUser(session.user);
          try {
            console.log('AuthContext: Fetching user profile...');
            const profile = await getUser(session.user.id);
            console.log('AuthContext: Profile data:', profile);
            setUserProfile(profile);
          } catch (error) {
            console.error('Error fetching user profile:', error);
            // If profile doesn't exist, set userProfile to null but don't fail
            setUserProfile(null);
          }
        } else {
          console.log('AuthContext: No user found in session');
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        // If there's an error, set loading to false anyway to prevent infinite loading
        setCurrentUser(null);
        setUserProfile(null);
      } finally {
        console.log('AuthContext: Setting loading to false');
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setCurrentUser(session?.user ?? null);
      
      if (session?.user) {
        try {
          const profile = await getUser(session.user.id);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          // If profile doesn't exist, set userProfile to null but don't fail
          setUserProfile(null);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    userProfile,
    loading,
    signIn,
    signUp,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 