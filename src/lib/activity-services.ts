import { supabase } from './supabase';
import type { ActivityFeedItem } from '@/types';

export const createActivity = async (
  userId: string, 
  activityType: ActivityFeedItem['activityType'], 
  activityData: any,
  isPublic: boolean = true
) => {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData,
        is_public: isPublic
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw error;
  }
};

export const getPublicActivities = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        user:users(id, name, profile_image, city)
      `)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching public activities:', error);
    throw error;
  }
};

export const getUserActivities = async (userId: string, limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from('activity_feed')
      .select(`
        *,
        user:users(id, name, profile_image, city)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching user activities:', error);
    throw error;
  }
};

export const subscribeToActivities = (callback: (activity: any) => void) => {
  const channel = supabase
    .channel('activity-feed')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'activity_feed',
        filter: 'is_public=eq.true'
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();

  return channel;
};

