import { supabase } from '@/integrations/supabase/client';
import type { Dog, User, WalkerProfile } from '@/types';

// User Services
export const createUser = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('users')
    .upsert(
      {
        id: userId,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        city: userData.city,
        postal_code: userData.postalCode,
        user_type: userData.userType,
        bio: userData.bio,
      },
      { onConflict: 'id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    const res = await Promise.race([
      supabase.from('users').select('*').eq('id', userId).single(),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000)),
    ]);
    if (!res) return null; // timed out
    const { data, error } = res as any;

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email || '',
      phone: data.phone || '',
      city: data.city || '',
      postalCode: data.postal_code || '',
      userType: data.user_type as 'owner' | 'walker',
      bio: data.bio || '',
      profileImage: data.profile_image || data.avatar_url || undefined,
      hourlyRate: data.hourly_rate || undefined,
      latitude: data.latitude || undefined,
      longitude: data.longitude || undefined,
      verified: data.verified ?? false,
      verificationStatus: data.verification_status ?? undefined,
      kycConfidence: data.kyc_confidence ?? undefined,
      kycData: data.kyc_data ?? undefined,
      rating: data.rating != null ? Number(data.rating) : undefined,
      yearsExperience: data.years_experience ?? undefined,
      petsCaredFor: data.pets_cared_for ?? undefined,
      sitterAge: data.sitter_age ?? undefined,
      hasPetExperience: data.has_pet_experience ?? undefined,
      experienceDescription: data.experience_description ?? undefined,
      hobbies: data.hobbies ?? undefined,
      preferences: data.preferences ?? undefined,
      createdAt: new Date(data.created_at || new Date()),
      updatedAt: new Date(data.updated_at || new Date()),
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
  if (userData.profileImage) updateData.profile_image = userData.profileImage;
  if (userData.rating != null) updateData.rating = userData.rating;
  if (userData.yearsExperience != null) updateData.years_experience = userData.yearsExperience;
  if (userData.petsCaredFor != null) updateData.pets_cared_for = userData.petsCaredFor;
  if (userData.sitterAge != null) updateData.sitter_age = userData.sitterAge;
  if (userData.hasPetExperience != null) updateData.has_pet_experience = userData.hasPetExperience;
  if (userData.experienceDescription != null) updateData.experience_description = userData.experienceDescription;
  if (userData.hobbies != null) updateData.hobbies = userData.hobbies;
  if (userData.preferences != null) updateData.preferences = userData.preferences;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

  if (error) throw error;
};

export const switchUserRole = async (userId: string, newRole: 'owner' | 'walker') => {
  const { error } = await supabase
    .from('users')
    .update({ user_type: newRole })
    .eq('id', userId);

  if (error) throw error;
};

/** Update user KYC fields after verification (e.g. from Python /verify). */
export const updateUserKyc = async (
  userId: string,
  payload: { verification_status: string; kyc_confidence?: number; kyc_data?: Record<string, unknown>; verified?: boolean }
) => {
  const update: Record<string, unknown> = {
    verification_status: payload.verification_status,
    updated_at: new Date().toISOString(),
  };
  if (payload.kyc_confidence != null) update.kyc_confidence = payload.kyc_confidence;
  if (payload.kyc_data != null) update.kyc_data = payload.kyc_data;
  if (payload.verified != null) update.verified = payload.verified;

  const { error } = await supabase.from('users').update(update).eq('id', userId);
  if (error) throw error;
};

// Dog Services
export const createDog = async (dogData: Omit<Dog, 'id' | 'createdAt' | 'updatedAt'>) => {
  const basePayload: Record<string, unknown> = {
    owner_id: dogData.ownerId,
    name: dogData.name,
    pet_type: 'dog',
    age: dogData.age,
    age_years: dogData.ageYears,
    age_months: dogData.ageMonths,
    breed: dogData.breed,
    breed_custom: dogData.customBreed,
    pet_size: dogData.petSize,
    allergies: dogData.allergies,
    health_issues: dogData.healthIssues,
    notes: dogData.notes,
    image_url: dogData.imageUrl,
  };

  const insertWithRetry = async (table: 'pets' | 'dogs', initialPayload: Record<string, unknown>) => {
    let payload = { ...initialPayload };
    if (table === 'dogs') {
      delete payload.pet_type;
    }

    for (let attempts = 0; attempts < 8; attempts++) {
      const { data, error } = await supabase.from(table).insert(payload).select('id').single();
      if (!error) return { data, error: null };

      const msg = error.message || '';
      const match = msg.match(/Could not find the '([^']+)' column/);
      if (match?.[1] && match[1] in payload) {
        const next = { ...payload };
        delete next[match[1]];
        payload = next;
        continue;
      }

      return { data: null, error };
    }

    return { data: null, error: { message: 'Could not create pet profile' } };
  };

  const petsResult = await insertWithRetry('pets', basePayload);
  if (petsResult.data?.id) return petsResult.data.id;

  const petsMsg = petsResult.error?.message || '';
  if (/does not exist|not find|relation/i.test(petsMsg)) {
    const dogsResult = await insertWithRetry('dogs', basePayload);
    if (dogsResult.data?.id) return dogsResult.data.id;
    throw dogsResult.error;
  }

  throw petsResult.error;
};

export const getDogsByOwner = async (ownerId: string): Promise<Dog[]> => {
  const mapDog = (dog: any): Dog => ({
    id: dog.id,
    ownerId: dog.owner_id,
    name: dog.name,
    age: dog.age || '0',
    ageYears: dog.age_years ?? null,
    ageMonths: dog.age_months ?? null,
    breed: dog.breed || '',
    customBreed: dog.breed_custom || undefined,
    petSize: (dog.pet_size as 'small' | 'medium' | 'large' | null) || undefined,
    allergies: dog.allergies || undefined,
    healthIssues: dog.health_issues || undefined,
    notes: dog.notes || '',
    imageUrl: dog.image_url || undefined,
    createdAt: new Date(dog.created_at),
    updatedAt: new Date(dog.updated_at),
  });

  const petsRes = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', ownerId)
    .eq('pet_type', 'dog');

  if (!petsRes.error) {
    return (petsRes.data || []).map(mapDog);
  }

  const petsMsg = petsRes.error.message || '';
  if (!/does not exist|not find|relation/i.test(petsMsg)) {
    throw petsRes.error;
  }

  const { data, error } = await supabase
    .from('dogs')
    .select('*')
    .eq('owner_id', ownerId);

  if (error) throw error;

  return (data || []).map(mapDog);
};

export const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
  const updateData: any = {};
  
  if (dogData.name) updateData.name = dogData.name;
  if (dogData.age) updateData.age = dogData.age;
  if (dogData.ageYears !== undefined) updateData.age_years = dogData.ageYears;
  if (dogData.ageMonths !== undefined) updateData.age_months = dogData.ageMonths;
  if (dogData.breed !== undefined) updateData.breed = dogData.breed;
  if (dogData.customBreed !== undefined) updateData.breed_custom = dogData.customBreed;
  if (dogData.petSize !== undefined) updateData.pet_size = dogData.petSize;
  if (dogData.allergies !== undefined) updateData.allergies = dogData.allergies;
  if (dogData.healthIssues !== undefined) updateData.health_issues = dogData.healthIssues;
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
  if (import.meta.env.DEV) console.debug('Location update not yet implemented');
};

export const getNearbyWalkers = async (latitude: number, longitude: number, radius: number): Promise<WalkerProfile[]> => {
  // TODO: Implement nearby walkers query
  return [];
};

// Image Upload to Supabase Storage
export const uploadImage = async (file: File, userId: string, folder: string = 'dogs'): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${folder}/${Math.random()}.${fileExt}`;

  const candidateBuckets = ['avatars', 'profile-images', 'images'] as const;
  let usedBucket: (typeof candidateBuckets)[number] | null = null;
  let lastError: Error | null = null;

  for (const bucket of candidateBuckets) {
    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (!error) {
      usedBucket = bucket;
      break;
    }
    lastError = error as unknown as Error;
  }

  if (!usedBucket) {
    throw lastError ?? new Error('Unable to upload image to storage');
  }

  const { data: { publicUrl } } = supabase.storage
    .from(usedBucket)
    .getPublicUrl(fileName);

  return publicUrl;
};

