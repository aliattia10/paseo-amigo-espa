import { z } from 'zod';

/** Sitter profile (users table) */
export const sitterProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  rating: z.number().min(0).max(5).optional().nullable(),
  hourly_rate: z.number().min(5).max(500).optional(),
  years_experience: z.number().int().min(0).optional(),
  pets_cared_for: z.number().int().min(0).optional(),
  sitter_age: z.number().int().min(18).max(90).optional(),
  has_pet_experience: z.boolean().optional(),
  hobbies: z.array(z.string().max(50)).max(20).optional(),
  preferences: z
    .object({
      size: z.array(z.enum(['small', 'medium', 'large'])).optional(),
      type: z.array(z.enum(['dog', 'cat', 'puppy'])).optional(),
      days: z.array(z.string()).optional(),
    })
    .passthrough()
    .optional(),
});

export type SitterProfileForm = z.infer<typeof sitterProfileSchema>;

/** Pet profile (pets table) */
export const petProfileSchema = z.object({
  name: z.string().min(1).max(100),
  breed: z.string().max(100).optional(),
  mood: z.string().max(50).optional(),
  personality_tags: z.array(z.string().max(30)).max(15).optional(),
  age: z.string().optional(),
  notes: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal('')),
  petType: z.enum(['dog', 'cat']).optional(),
});

export type PetProfileForm = z.infer<typeof petProfileSchema>;

/** Sitter onboarding: experience step */
export const sitterExperienceSchema = z.object({
  has_pet_experience: z.boolean(),
  years_experience: z.number().int().min(0).max(60).optional(),
  pets_cared_for: z.number().int().min(0).optional(),
  sitter_age: z.number().int().min(18).max(90).optional(),
});

/** Sitter onboarding: preference chips (Big Dogs, Small Dogs, Cats, Puppies) */
export const sitterPreferenceChipsSchema = z.object({
  preferences: z.object({
    type: z.array(z.enum(['big_dogs', 'small_dogs', 'cats', 'puppies'])).min(1),
  }),
});

/** Hobbies selection (array of strings) */
export const sitterHobbiesSchema = z.object({
  hobbies: z.array(z.string()).min(1).max(20),
});
