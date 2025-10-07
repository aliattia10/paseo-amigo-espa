import { Request, Response } from 'express';
import { supabase } from '@/config/database';
import { AuthRequest } from '@/middleware/auth';

// Get all walkers
export const getWalkers = async (req: Request, res: Response) => {
  try {
    const { city, verified } = req.query;

    let query = supabase
      .from('walker_profiles')
      .select(`
        *,
        users!inner(name, email, city, profile_image)
      `);

    if (verified === 'true') {
      query = query.eq('verified', true);
    }

    if (city) {
      query = query.eq('users.city', city);
    }

    const { data: walkers, error } = await query.order('rating', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: walkers.length,
      data: walkers
    });
  } catch (error) {
    console.error('Get walkers error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get walkers'
    });
  }
};

// Get walker by ID
export const getWalkerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { data: walker, error } = await supabase
      .from('walker_profiles')
      .select(`
        *,
        users!inner(*)
      `)
      .eq('user_id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Walker not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: walker
    });
  } catch (error) {
    console.error('Get walker error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get walker'
    });
  }
};

// Create walker profile
export const createWalkerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bio, experience, hourlyRate, availability, tags } = req.body;

    // Check if user is a walker
    if (req.user!.userType !== 'walker') {
      return res.status(403).json({
        success: false,
        error: 'Only walkers can create walker profiles'
      });
    }

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('walker_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      return res.status(400).json({
        success: false,
        error: 'Walker profile already exists'
      });
    }

    const { data: profile, error } = await supabase
      .from('walker_profiles')
      .insert({
        user_id: userId,
        bio,
        experience,
        hourly_rate: hourlyRate,
        availability: availability || [],
        tags: tags || []
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Create walker profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create walker profile'
    });
  }
};

// Update walker profile
export const updateWalkerProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { bio, experience, hourlyRate, availability, tags } = req.body;

    const updateData: any = {};
    if (bio) updateData.bio = bio;
    if (experience) updateData.experience = experience;
    if (hourlyRate) updateData.hourly_rate = hourlyRate;
    if (availability) updateData.availability = availability;
    if (tags) updateData.tags = tags;

    const { data: profile, error } = await supabase
      .from('walker_profiles')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Walker profile not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Update walker profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update walker profile'
    });
  }
};
