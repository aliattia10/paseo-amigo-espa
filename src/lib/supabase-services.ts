import { supabase } from '@/integrations/supabase/client';
import type { Dog, User, WalkerProfile } from '@/types';

// User Services
export const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      user_id: userData.id,
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

  if (error) throw error;
  return data.id;
};

export const getDogsByOwner = async (ownerId: string): Promise<Dog[]> => {
  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) throw error;

  return data.map(dog => ({
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

// Walker Profile Services - Placeholder
export const createWalkerProfile = async (profileData: Partial<WalkerProfile>) => {
  // TODO: Implement walker profile creation
  throw new Error('Walker profile creation not yet implemented');
};

export const getWalkerProfile = async (userId: string): Promise<WalkerProfile | null> => {
  // TODO: Implement walker profile fetching
  return null;
};

// Nearby Services - Placeholder
export const getNearbyUsers = async (userType: string): Promise<User[]> => {
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
