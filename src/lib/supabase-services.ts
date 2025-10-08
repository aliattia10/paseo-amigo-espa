import { supabase } from '@/integrations/supabase/client';
import type { User, Dog, WalkerProfile, WalkRequest, ChatMessage, Review } from '@/types';
import type { Database } from '@/integrations/supabase/types';

// User Services
export const createUser = async (userId: string, userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('createUser: Starting user creation for ID:', userId);
    console.log('createUser: User data:', userData);
    
    // Try to get session, but don't fail if it's not available
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log('createUser: No active session, proceeding with user creation anyway');
    } else {
      console.log('createUser: Active session found for user:', session.user.id);
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
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
      console.error('createUser: Database error:', error);
      
      // Handle specific error cases
      if (error.code === '23505') {
        console.log('createUser: User already exists, this is OK');
        return userId; // User already exists, return the ID
      }
      
      if (error.code === '42501') {
        throw new Error('No tienes permisos para crear este perfil. Contacta al soporte.');
      }
      
      throw error;
    }
    
    console.log('createUser: User created successfully:', data);
    return data.id;
  } catch (error) {
    console.error('createUser: Unexpected error:', error);
    throw error;
  }
};

export const getUser = async (userId: string): Promise<User | null> => {
  try {
    console.log('getUser: Fetching user with ID:', userId);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('getUser: Error fetching user:', error);
      if (error.code === 'PGRST116') {
        console.log('getUser: No user found with ID:', userId);
        return null; // No rows returned
      }
      // For 406 errors or other issues, return null instead of throwing
      if (error.code === '406' || error.status === 406) {
        console.warn('getUser: 406 error - possibly RLS issue, returning null');
        return null;
      }
      throw error;
    }

    console.log('getUser: Successfully fetched user:', data);
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      city: data.city,
      postalCode: data.postal_code,
      userType: data.user_type,
      profileImage: data.profile_image,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } catch (error) {
    console.error('getUser: Unexpected error:', error);
    return null; // Return null instead of throwing to prevent app crash
  }
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  const updateData: any = {};
  
  if (userData.name) updateData.name = userData.name;
  if (userData.email) updateData.email = userData.email;
  if (userData.phone) updateData.phone = userData.phone;
  if (userData.city) updateData.city = userData.city;
  if (userData.postalCode) updateData.postal_code = userData.postalCode;
  if (userData.userType) updateData.user_type = userData.userType;
  if (userData.profileImage) updateData.profile_image = userData.profileImage;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId);

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
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(dog => ({
    id: dog.id,
    ownerId: dog.owner_id,
    name: dog.name,
    age: dog.age,
    breed: dog.breed,
    notes: dog.notes,
    imageUrl: dog.image_url,
    createdAt: new Date(dog.created_at),
    updatedAt: new Date(dog.updated_at),
  }));
};

export const updateDog = async (dogId: string, dogData: Partial<Dog>) => {
  const updateData: any = {};
  
  if (dogData.name) updateData.name = dogData.name;
  if (dogData.age) updateData.age = dogData.age;
  if (dogData.breed) updateData.breed = dogData.breed;
  if (dogData.notes) updateData.notes = dogData.notes;
  if (dogData.imageUrl) updateData.image_url = dogData.imageUrl;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('dogs')
    .update(updateData)
    .eq('id', dogId);

  if (error) throw error;
};

// Walker Profile Services
export const createWalkerProfile = async (profileData: Omit<WalkerProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('walker_profiles')
    .insert({
      user_id: profileData.userId,
      bio: profileData.bio,
      experience: profileData.experience,
      hourly_rate: profileData.hourlyRate,
      availability: profileData.availability,
      rating: profileData.rating,
      total_walks: profileData.totalWalks,
      verified: profileData.verified,
      tags: profileData.tags,
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
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    bio: data.bio,
    experience: data.experience,
    hourlyRate: data.hourly_rate,
    availability: data.availability,
    rating: data.rating,
    totalWalks: data.total_walks,
    verified: data.verified,
    tags: data.tags,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
};

export const getNearbyWalkers = async (city: string): Promise<WalkerProfile[]> => {
  const { data, error } = await supabase
    .from('walker_profiles')
    .select('*')
    .eq('verified', true)
    .order('rating', { ascending: false });

  if (error) throw error;

  return data.map(profile => ({
    id: profile.id,
    userId: profile.user_id,
    bio: profile.bio,
    experience: profile.experience,
    hourlyRate: profile.hourly_rate,
    availability: profile.availability,
    rating: profile.rating,
    totalWalks: profile.total_walks,
    verified: profile.verified,
    tags: profile.tags,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  }));
};

// Walk Request Services
export const createWalkRequest = async (requestData: Omit<WalkRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  const { data, error } = await supabase
    .from('walk_requests')
    .insert({
      owner_id: requestData.ownerId,
      walker_id: requestData.walkerId,
      dog_id: requestData.dogId,
      service_type: requestData.serviceType,
      duration: requestData.duration,
      date: requestData.date.toISOString(),
      time: requestData.time,
      location: requestData.location,
      notes: requestData.notes,
      status: requestData.status,
      price: requestData.price,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getWalkRequestsByOwner = async (ownerId: string): Promise<WalkRequest[]> => {
  const { data, error } = await supabase
    .from('walk_requests')
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(request => ({
    id: request.id,
    ownerId: request.owner_id,
    walkerId: request.walker_id,
    dogId: request.dog_id,
    serviceType: request.service_type,
    duration: request.duration,
    date: new Date(request.date),
    time: request.time,
    location: request.location,
    notes: request.notes,
    status: request.status,
    price: request.price,
    createdAt: new Date(request.created_at),
    updatedAt: new Date(request.updated_at),
  }));
};

export const getWalkRequestsByWalker = async (walkerId: string): Promise<WalkRequest[]> => {
  const { data, error } = await supabase
    .from('walk_requests')
    .select('*')
    .eq('walker_id', walkerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(request => ({
    id: request.id,
    ownerId: request.owner_id,
    walkerId: request.walker_id,
    dogId: request.dog_id,
    serviceType: request.service_type,
    duration: request.duration,
    date: new Date(request.date),
    time: request.time,
    location: request.location,
    notes: request.notes,
    status: request.status,
    price: request.price,
    createdAt: new Date(request.created_at),
    updatedAt: new Date(request.updated_at),
  }));
};

export const updateWalkRequest = async (requestId: string, requestData: Partial<WalkRequest>) => {
  const updateData: any = {};
  
  if (requestData.status) updateData.status = requestData.status;
  if (requestData.notes) updateData.notes = requestData.notes;
  if (requestData.price) updateData.price = requestData.price;
  if (requestData.duration) updateData.duration = requestData.duration;
  if (requestData.date) updateData.date = requestData.date.toISOString();
  if (requestData.time) updateData.time = requestData.time;
  if (requestData.location) updateData.location = requestData.location;
  
  updateData.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from('walk_requests')
    .update(updateData)
    .eq('id', requestId);

  if (error) throw error;
};

// Chat Services
export const sendMessage = async (messageData: Omit<ChatMessage, 'id' | 'timestamp'>) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      request_id: messageData.requestId,
      sender_id: messageData.senderId,
      message: messageData.message,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getChatMessages = async (requestId: string): Promise<ChatMessage[]> => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('request_id', requestId)
    .order('timestamp', { ascending: true });

  if (error) throw error;

  return data.map(message => ({
    id: message.id,
    requestId: message.request_id,
    senderId: message.sender_id,
    message: message.message,
    timestamp: new Date(message.timestamp),
  }));
};

// Review Services
export const createReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      walk_request_id: reviewData.walkRequestId,
      reviewer_id: reviewData.reviewerId,
      reviewed_id: reviewData.reviewedId,
      rating: reviewData.rating,
      tags: reviewData.tags,
      comment: reviewData.comment,
    })
    .select()
    .single();

  if (error) throw error;
  return data.id;
};

export const getReviewsByUser = async (userId: string): Promise<Review[]> => {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewed_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(review => ({
    id: review.id,
    walkRequestId: review.walk_request_id,
    reviewerId: review.reviewer_id,
    reviewedId: review.reviewed_id,
    rating: review.rating,
    tags: review.tags,
    comment: review.comment,
    createdAt: new Date(review.created_at),
  }));
};

// Real-time subscriptions
export const subscribeToWalkRequests = (walkerId: string, callback: (requests: WalkRequest[]) => void) => {
  return supabase
    .channel('walk_requests')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'walk_requests',
        filter: `walker_id=eq.${walkerId}`,
      },
      async () => {
        const requests = await getWalkRequestsByWalker(walkerId);
        callback(requests);
      }
    )
    .subscribe();
};

export const subscribeToChatMessages = (requestId: string, callback: (messages: ChatMessage[]) => void) => {
  return supabase
    .channel('chat_messages')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'chat_messages',
        filter: `request_id=eq.${requestId}`,
      },
      async () => {
        const messages = await getChatMessages(requestId);
        callback(messages);
      }
    )
    .subscribe();
};

// File Upload Service (using Supabase Storage)
export const uploadImage = async (file: File, path: string): Promise<string> => {
  const { data, error } = await supabase.storage
    .from('images')
    .upload(path, file);

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(data.path);

  return publicUrl;
};
