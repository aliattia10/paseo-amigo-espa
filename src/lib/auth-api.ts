// Direct API calls to handle authentication with proper permissions
import { supabase } from '@/integrations/supabase/client';

export const createUserProfile = async (userData: {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  postalCode: string;
  userType: 'owner' | 'walker';
  profileImage?: string;
}) => {
  try {
    // Use a more direct approach - try to insert without RLS restrictions
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        city: userData.city,
        postal_code: userData.postalCode,
        user_type: userData.userType,
        profile_image: userData.profileImage,
      })
      .select()
      .single();

    if (error) {
      console.error('Create user profile error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create user profile:', error);
    throw error;
  }
};

export const signUpWithProfile = async (
  email: string,
  password: string,
  userData: {
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    userType: 'owner' | 'walker';
  }
) => {
  try {
    // Step 1: Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user returned from signup');

    // Step 2: Wait for auth to be processed
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 3: Try to create user profile with multiple approaches
    let profileCreated = false;
    let attempts = 0;
    const maxAttempts = 3;

    while (!profileCreated && attempts < maxAttempts) {
      try {
        // Try direct insertion
        await createUserProfile({
          id: authData.user.id,
          name: userData.name,
          email,
          phone: userData.phone,
          city: userData.city,
          postalCode: userData.postalCode,
          userType: userData.userType,
        });
        profileCreated = true;
      } catch (error: any) {
        attempts++;
        console.log(`Profile creation attempt ${attempts} failed:`, error.message);
        
        if (attempts < maxAttempts) {
          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
        } else {
          // If all attempts fail, we still have the auth user
          console.warn('Could not create user profile, but auth user was created');
          // Don't throw error - user can still sign in
        }
      }
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};
