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
      .or(`user1_id.eq.${userId},user2_id.eq.${userId},user_id.eq.${userId},matched_user_id.eq.${userId}`);

    if (error) throw error;
    
    // Filter and process matches where current user is involved and it's mutual
    const mutualMatches = data.filter((m: any) => {
      // If it uses is_mutual flag, check it
      if (m.is_mutual !== undefined) return m.is_mutual === true;
      
      // If it uses the dedicated match table (only created on mutual), it's mutual
      return true;
    });

    // Load user data for each match
    const matchesWithUsers = await Promise.all(
      mutualMatches.map(async (match: any) => {
        let otherUserId = '';
        if (match.user1_id) {
          otherUserId = match.user1_id === userId ? match.user2_id : match.user1_id;
        } else {
          otherUserId = match.user_id === userId ? match.matched_user_id : match.user_id;
        }

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
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId},user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) throw error;
    
    // Check if a match exists in either column structure
    const match = data.find((m: any) => 
      (m.user_id === userId && m.matched_user_id === matchedUserId) ||
      (m.user_id === matchedUserId && m.matched_user_id === userId) ||
      (m.user1_id === userId && m.user2_id === matchedUserId) ||
      (m.user1_id === matchedUserId && m.user2_id === userId)
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
      .or(`user1_id.eq.${userId},user2_id.eq.${userId},user_id.eq.${userId},matched_user_id.eq.${userId}`);

    if (error) throw error;
    
    // Count mutual matches
    const mutualCount = data?.filter((m: any) => {
      if (m.is_mutual !== undefined) return m.is_mutual === true;
      return true;
    }).length || 0;

    return mutualCount;
  } catch (error) {
    console.error('Error getting new matches count:', error);
    return 0;
  }
};

