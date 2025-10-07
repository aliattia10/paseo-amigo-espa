import { Request, Response } from 'express';
import { supabase } from '@/config/database';
import { AuthRequest } from '@/middleware/auth';

// Get dogs for the authenticated user
export const getDogs = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const { data: dogs, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('owner_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      count: dogs.length,
      data: dogs
    });
  } catch (error) {
    console.error('Get dogs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dogs'
    });
  }
};

// Get dog by ID
export const getDogById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { data: dog, error } = await supabase
      .from('dogs')
      .select('*')
      .eq('id', id)
      .eq('owner_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Dog not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('Get dog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get dog'
    });
  }
};

// Create new dog
export const createDog = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { name, age, breed, notes, imageUrl } = req.body;

    const { data: dog, error } = await supabase
      .from('dogs')
      .insert({
        owner_id: userId,
        name,
        age,
        breed,
        notes,
        image_url: imageUrl
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('Create dog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create dog'
    });
  }
};

// Update dog
export const updateDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { name, age, breed, notes, imageUrl } = req.body;

    const updateData: any = {};
    if (name) updateData.name = name;
    if (age) updateData.age = age;
    if (breed) updateData.breed = breed;
    if (notes) updateData.notes = notes;
    if (imageUrl) updateData.image_url = imageUrl;

    const { data: dog, error } = await supabase
      .from('dogs')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          success: false,
          error: 'Dog not found'
        });
      }
      throw error;
    }

    res.json({
      success: true,
      data: dog
    });
  } catch (error) {
    console.error('Update dog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dog'
    });
  }
};

// Delete dog
export const deleteDog = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const { error } = await supabase
      .from('dogs')
      .delete()
      .eq('id', id)
      .eq('owner_id', userId);

    if (error) {
      throw error;
    }

    res.json({
      success: true,
      message: 'Dog deleted successfully'
    });
  } catch (error) {
    console.error('Delete dog error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dog'
    });
  }
};
