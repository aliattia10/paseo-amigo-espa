import { supabase } from './supabase';
import type { Match } from '@/types';

export const createMatch = async (userId: string, matchedUserId: string, matchType: 'like' | 'superlike' | 'pass') => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .insert({
        user_id: userId,
        matched_user_id: matchedUserId,
        match_type: matchType
      })
      .select()
      .single();

    if (error) throw error;
    return data as Match;
  } catch (error) {
    console.error('Error creating match:', error);
    throw error;
  }
};

export const getMatches = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`
        *,
        matched_user:users!matches_matched_user_id_fkey(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching matches:', error);
    throw error;
  }
};

export const getMutualMatches = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select(`*`)
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
      .eq('is_mutual', true);

    if (error) throw error;

    const matchesWithUsers = await Promise.all(
      data.map(async (match: any) => {
        const otherUserId = match.user_id === userId ? match.matched_user_id : match.user_id;

        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single();

        return {
          ...match,
          matched_user: userData
        };
      })
    );

    return matchesWithUsers;
  } catch (error) {
    console.error('Error fetching mutual matches:', error);
    throw error;
  }
};

export const checkExistingMatch = async (userId: string, matchedUserId: string) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`);

    if (error) throw error;
    
    const match = data.find((m: any) => 
      (m.user_id === userId && m.matched_user_id === matchedUserId) ||
      (m.user_id === matchedUserId && m.matched_user_id === userId)
    );

    return match || null;
  } catch (error) {
    console.error('Error checking existing match:', error);
    throw error;
  }
};

export const getNewMatchesCount = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('matches')
      .select('*')
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
      .eq('is_mutual', true);

    if (error) throw error;
    
    const mutualCount = data?.length || 0;

    return mutualCount;
  } catch (error) {
    console.error('Error getting new matches count:', error);
    return 0;
  }
};

