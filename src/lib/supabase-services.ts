import { supabase } from '@/integrations/supabase/client';
import type { Dog, User, WalkerProfile } from '@/types';

// User Services
export const createUser = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userId,
      name: userData.name,
      phone: userData.phone,
      city: userData.city,
      postal_code: userData.postalCode,
      user_type: userData.userType,
      bio: userData.bio,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.user_id,
      name: data.name,
      email: '',
      phone: data.phone,
      city: data.city,
      postalCode: data.postal_code,
      userType: data.user_type as 'owner' | 'walker',
      bio: data.bio,
      rating: data.rating || 0,
      verified: data.verified || false,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const updateData: any = {};
  
  if (userData.name) updateData.name = userData.name;
  if (userData.phone) updateData.phone = userData.phone;
  if (userData.city) updateData.city = userData.city;
  if (userData.postalCode) updateData.postal_code = userData.postalCode;
  if (userData.userType) updateData.user_type = userData.userType;
  if (userData.bio) updateData.bio = userData.bio;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('user_id', userId);

  if (error) throw error;
};

export const switchUserRole = async (userId: string, newRole: 'owner' | 'walker') => {
  const { error } = await supabase
    .from('profiles')
    .update({ user_type: newRole })
    .eq('user_id', userId);

  if (error) throw error;
};

// Dog Services
export const createDog = async (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('dogs')
    .insert({
      owner_id: dogData.ownerId,
      name: dogData.name,
      age: dogData.age,
      breed: dogData.breed,
      notes: dogData.notes,
      image_url: dogData.imageUrl,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating dog:', error);
    throw error;
  }
  return data.id;
};

export const getDogsByOwner = async (ownerId: string): Promise<Dog[]> => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) throw error;

  return (data || []).map(dog => ({
    id: dog.id,
    ownerId: dog.owner_id,
    name: dog.name,
    age: dog.age || '0',
    breed: dog.breed || '',
    notes: dog.notes || '',
    imageUrl: dog.image_url || undefined,
    createdAt: new Date(dog.created_at),
    updatedAt: new Date(dog.updated_at),
  }));
};

export const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
  const updateData: any = {};
  
  if (dogData.name) updateData.name = dogData.name;
  if (dogData.age) updateData.age = dogData.age;
  if (dogData.breed !== undefined) updateData.breed = dogData.breed;
  if (dogData.notes) updateData.notes = dogData.notes;
  if (dogData.imageUrl !== undefined) updateData.image_url = dogData.imageUrl;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('dogs')
    .update(updateData)
    .eq('id', dogId);

  if (error) throw error;
};

// Walker Profile Services
export const createWalkerProfile = async (profileData: Partial<WalkerProfile>) => {
  const { data, error } = await supabase
    .from('walker_profiles')
    .insert({
      user_id: profileData.userId,
      bio: profileData.bio || '',
      experience: profileData.experience || '',
      hourly_rate: profileData.hourlyRate || 0,
      availability: profileData.availability || [],
      tags: profileData.tags || [],
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getWalkerProfile = async (userId: string): Promise<WalkerProfile | null> => {
  const { data, error } = await supabase
    .from('walker_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id,
    userId: data.user_id,
    bio: data.bio,
    experience: data.experience,
    hourlyRate: data.hourly_rate,
    availability: data.availability,
    rating: data.rating || 0,
    totalWalks: data.total_walks || 0,
    verified: data.verified || false,
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

// Walk Request Services - Placeholder
export const getWalkRequestsByOwner = async (ownerId: string) => {
  // TODO: Implement
  return [];
};

export const getWalkRequestsByWalker = async (walkerId: string) => {
  // TODO: Implement
  return [];
};

// Chat Services - Placeholder
export const sendMessage = async (requestId: string, senderId: string, message: string) => {
  // TODO: Implement
  throw new Error('Chat services not yet implemented');
};

export const getChatMessages = async (requestId: string) => {
  // TODO: Implement
  return [];
};

export const subscribeToChatMessages = (requestId: string, callback: (message: any) => void) => {
  // TODO: Implement
  return { unsubscribe: () => {} };
};

// Location Services - Placeholder
export const getNearbyUsers = async (userType: string, latitude?: number, longitude?: number, radius?: number): Promise<User[]> => {
  // TODO: Implement nearby users query
  return [];
};

export const updateUserLocation = async (userId: string, latitude: number, longitude: number) => {
  // TODO: Implement location update
  console.log('Location update not yet implemented');
};

export const getNearbyWalkers = async (latitude: number, longitude: number, radius: number): Promise<WalkerProfile[]> => {
  // TODO: Implement nearby walkers query
  return [];
};

// Image Upload - Placeholder
export const uploadImage = async (file: File, bucket: string = 'images') => {
  // TODO: Implement image upload to Supabase Storage
  throw new Error('Image upload not yet implemented');
};

