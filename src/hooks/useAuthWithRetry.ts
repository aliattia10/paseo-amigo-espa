import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createUser } from '@/lib/supabase-services';
import type { User } from '@/types';

export const useAuthWithRetry = () => {
  const [loading, setLoading] = useState(false);

  const signUpWithRetry = async (
    email: string, 
    password: string, 
    userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    setLoading(true);
    
    try {
      // Step 1: Create user in Supabase Auth with rate limiting protection
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (authError) {
        // Handle rate limiting specifically
        if (authError.message.includes('rate limit') || authError.message.includes('too many requests')) {
          throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
        }
        if (authError.message.includes('For security purposes')) {
          throw new Error('Security rate limit active. Please wait before trying again.');
        }
        throw authError;
      }
      
      if (!authData.user) throw new Error('No user returned from signup');
      
      // Step 2: Wait for session to be established and refresh it
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Force refresh the session
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.log('Session refresh error:', refreshError);
      }
      
      // Step 3: Try to create user profile with multiple attempts
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts) {
        try {
          // Check if session is active
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            // Try to get the user from auth data
            if (authData.user) {
              // Use the user from signup data directly
              console.log('Using user from signup data');
            } else {
              throw new Error('No active session and no user data');
            }
          }
          
          // Try to create user profile
          await createUser(authData.user.id, {
            ...userData,
            email
          });
          
          // Success!
          return { success: true };
          
        } catch (error: any) {
          attempts++;
          console.log(`Attempt ${attempts} failed:`, error.message);
          
          if (attempts >= maxAttempts) {
            throw error;
          }
          
          // Wait before retry with exponential backoff
          await new Promise(resolve => setTimeout(resolve, 2000 * attempts));
        }
      }
      
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    signUpWithRetry,
    loading
  };
};

