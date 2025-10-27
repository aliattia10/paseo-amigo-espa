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
      .select(`
        *,
        matched_user:users!matches_matched_user_id_fkey(*)
      `)
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)
      .eq('is_mutual', true)
      .order('matched_at', { ascending: false });

    if (error) throw error;
    return data;
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
      .eq('user_id', userId)
      .eq('matched_user_id', matchedUserId)
      .single();

    if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "not found"
    return data as Match | null;
  } catch (error) {
    console.error('Error checking existing match:', error);
    throw error;
  }
};

export const getNewMatchesCount = async (userId: string) => {
  try {
    const { count, error } = await supabase
      .from('matches')
      .select('*', { count: 'exact', head: true })
      .eq('matched_user_id', userId)
      .eq('is_mutual', true);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting new matches count:', error);
    return 0;
  }
};

