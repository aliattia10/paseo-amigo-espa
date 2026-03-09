-- Rich Sitter & Pet profiles (Petflik UX enhancement)
-- Sitter: bio, rating, experience, hobbies, preferences on users (app uses users for sitter data).
-- Pets: breed (race), mood, personality_tags.

-- ========== USERS (Sitter profile fields) ==========
-- bio already exists in many setups; add if missing
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS rating DECIMAL(3,2) DEFAULT 5.0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS years_experience INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS pets_cared_for INTEGER DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS has_pet_experience BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

COMMENT ON COLUMN public.users.bio IS 'Short sitter description';
COMMENT ON COLUMN public.users.rating IS 'Average rating (default 5.0 or null if new)';
COMMENT ON COLUMN public.users.years_experience IS 'Years of pet care experience';
COMMENT ON COLUMN public.users.pets_cared_for IS 'Total count of pets cared for';
COMMENT ON COLUMN public.users.has_pet_experience IS 'Whether sitter has prior pet experience';
COMMENT ON COLUMN public.users.hobbies IS 'e.g. Hiking, Reading, Photography';
COMMENT ON COLUMN public.users.preferences IS 'e.g. { "size": ["small","medium"], "type": ["dog","cat"], "days": ["weekends"] }';

-- ========== PETS ==========
-- breed may exist; add mood and personality_tags
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS breed TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS mood TEXT;
ALTER TABLE public.pets ADD COLUMN IF NOT EXISTS personality_tags TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.pets.breed IS 'Breed/race of the pet';
COMMENT ON COLUMN public.pets.mood IS 'Current status e.g. Happy, Sleepy, Energetic';
COMMENT ON COLUMN public.pets.personality_tags IS 'e.g. Friendly, Shy, Playful';

-- If dogs table exists and is used in parallel, add same columns for consistency
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'dogs') THEN
    ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS breed VARCHAR(100);
    ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS mood TEXT;
    ALTER TABLE public.dogs ADD COLUMN IF NOT EXISTS personality_tags TEXT[] DEFAULT '{}';
  END IF;
END $$;
