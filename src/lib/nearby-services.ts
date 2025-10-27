import { supabase } from './supabase';
import type { NearbyWalker } from '@/types';

export const getNearbyWalkers = async (userCity: string, userPostalCode?: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        walker_profiles(*)
      `)
      .eq('user_type', 'walker')
      .eq('city', userCity)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data to match NearbyWalker type
    const walkers: NearbyWalker[] = (data || []).map((user: any) => {
      const walkerProfile = user.walker_profiles?.[0];
      
      // Calculate simple distance estimate
      let distanceEstimate = 25; // default
      if (user.city === userCity) {
        distanceEstimate = user.postal_code === userPostalCode ? 1 : 5;
      }

      return {
        ...user,
        postalCode: user.postal_code,
        userType: user.user_type,
        profileImage: user.profile_image,
        rating: walkerProfile?.rating || 0,
        totalWalks: walkerProfile?.total_walks || 0,
        verified: walkerProfile?.verified || false,
        hourlyRate: walkerProfile?.hourly_rate || 0,
        availability: walkerProfile?.availability || [],
        distanceEstimate,
        walkerProfile: walkerProfile || null,
        createdAt: new Date(user.created_at),
        updatedAt: new Date(user.updated_at)
      };
    });

    // Sort by distance, then rating
    walkers.sort((a, b) => {
      if (a.distanceEstimate !== b.distanceEstimate) {
        return a.distanceEstimate - b.distanceEstimate;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    return walkers;
  } catch (error) {
    console.error('Error fetching nearby walkers:', error);
    throw error;
  }
};

export const getWalkerById = async (walkerId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        *,
        walker_profiles(*)
      `)
      .eq('id', walkerId)
      .eq('user_type', 'walker')
      .single();

    if (error) throw error;

    const walkerProfile = data.walker_profiles?.[0];

    return {
      ...data,
      postalCode: data.postal_code,
      userType: data.user_type,
      profileImage: data.profile_image,
      rating: walkerProfile?.rating || 0,
      totalWalks: walkerProfile?.total_walks || 0,
      verified: walkerProfile?.verified || false,
      hourlyRate: walkerProfile?.hourly_rate || 0,
      availability: walkerProfile?.availability || [],
      distanceEstimate: 0,
      walkerProfile: walkerProfile || null,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    } as NearbyWalker;
  } catch (error) {
    console.error('Error fetching walker by ID:', error);
    throw error;
  }
};

export const updateUserProfile = async (
  userId: string,
  updates: {
    name?: string;
    phone?: string;
    city?: string;
    postal_code?: string;
    bio?: string;
    profile_image?: string;
  }
) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

export const uploadProfileImage = async (userId: string, file: File) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `profile-images/${fileName}`;

    // Upload file to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('profile-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Update user profile with new image URL
    await updateUserProfile(userId, { profile_image: publicUrl });

    return publicUrl;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};

