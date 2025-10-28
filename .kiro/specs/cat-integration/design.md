# Complete Cat Integration Design

## Overview

This design transforms Petflik from a dog-only platform to a comprehensive pet care platform supporting both dogs and cats, with a seamless, intuitive user experience.

## Architecture

### Data Model Changes

```typescript
// Updated Pet/Dog Model
interface Pet {
  id: string;
  owner_id: string;
  name: string;
  pet_type: 'dog' | 'cat';  // NEW
  breed: string;
  age: string;
  temperament: string;
  special_needs: string;
  feeding_schedule: string;
  images: string[];  // NEW: Multiple images
  primary_image: string;
  
  // Dog-specific (optional)
  walking_schedule?: string;
  potty_training_status?: string;
  leash_behavior?: string;
  
  // Cat-specific (optional)
  litter_box_details?: string;
  indoor_outdoor?: 'indoor' | 'outdoor' | 'both';
  scratching_preferences?: string;
  
  created_at: timestamp;
  updated_at: timestamp;
}

// Updated Sitter Profile
interface SitterProfile {
  id: string;
  user_id: string;
  bio: string;
  experience: string;
  
  // NEW: Pet preferences
  pet_preferences: {
    dogs: boolean;
    cats: boolean;
  };
  
  // NEW: Pet-specific experience
  dog_experience?: string;
  cat_experience?: string;
  
  // NEW: Pet-specific rates
  dog_hourly_rate?: number;
  cat_hourly_rate?: number;
  
  // NEW: Multiple images
  images: string[];
  primary_image: string;
  
  rating: number;
  total_bookings: number;
  verified: boolean;
  tags: string[];
}
```

### Database Schema Updates

```sql
-- Update pets/dogs table
ALTER TABLE dogs RENAME TO pets;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS pet_type VARCHAR(10) DEFAULT 'dog' CHECK (pet_type IN ('dog', 'cat'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS primary_image TEXT;

-- Dog-specific fields (nullable)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS walking_schedule TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS potty_training_status TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS leash_behavior TEXT;

-- Cat-specific fields (nullable)
ALTER TABLE pets ADD COLUMN IF NOT EXISTS litter_box_details TEXT;
ALTER TABLE pets ADD COLUMN IF NOT EXISTS indoor_outdoor VARCHAR(10) CHECK (indoor_outdoor IN ('indoor', 'outdoor', 'both'));
ALTER TABLE pets ADD COLUMN IF NOT EXISTS scratching_preferences TEXT;

-- Update walker_profiles table
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS pet_preferences JSONB DEFAULT '{"dogs": true, "cats": false}'::jsonb;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS dog_experience TEXT;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS cat_experience TEXT;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS dog_hourly_rate INTEGER;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS cat_hourly_rate INTEGER;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE walker_profiles ADD COLUMN IF NOT EXISTS primary_image TEXT;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_pets_type ON pets(pet_type);
CREATE INDEX IF NOT EXISTS idx_pets_owner_type ON pets(owner_id, pet_type);
CREATE INDEX IF NOT EXISTS idx_walker_pet_prefs ON walker_profiles USING gin(pet_preferences);
```

## UI Components

### 1. Pet Type Selector Component

```typescript
// src/components/pet/PetTypeSelector.tsx
interface PetTypeSelectorProps {
  value: 'dog' | 'cat';
  onChange: (type: 'dog' | 'cat') => void;
}

const PetTypeSelector: React.FC<PetTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        onClick={() => onChange('dog')}
        className={`p-6 rounded-xl border-2 transition-all ${
          value === 'dog'
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="text-4xl mb-2">🐕</span>
        <h3 className="font-bold">Dog</h3>
        <p className="text-sm text-gray-600">Walks, playtime, training</p>
      </button>
      
      <button
        onClick={() => onChange('cat')}
        className={`p-6 rounded-xl border-2 transition-all ${
          value === 'cat'
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className="text-4xl mb-2">🐱</span>
        <h3 className="font-bold">Cat</h3>
        <p className="text-sm text-gray-600">Play, feeding, litter care</p>
      </button>
    </div>
  );
};
```

### 2. Breed Selector Component

```typescript
// src/components/pet/BreedSelector.tsx
const DOG_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
  'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
  'German Shorthaired Pointer', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Great Dane', 'Doberman Pinscher',
  'Mixed Breed', 'Other'
];

const CAT_BREEDS = [
  'Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Maine Coon',
  'Persian', 'Ragdoll', 'Bengal', 'British Shorthair', 'Abyssinian',
  'Scottish Fold', 'Sphynx', 'Russian Blue', 'American Shorthair',
  'Oriental', 'Birman', 'Mixed Breed', 'Other'
];

interface BreedSelectorProps {
  petType: 'dog' | 'cat';
  value: string;
  onChange: (breed: string) => void;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({ petType, value, onChange }) => {
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full p-3 border rounded-lg"
    >
      <option value="">Select {petType} breed...</option>
      {breeds.map(breed => (
        <option key={breed} value={breed}>{breed}</option>
      ))}
    </select>
  );
};
```

### 3. Multi-Image Upload Component

```typescript
// src/components/pet/MultiImageUpload.tsx
interface MultiImageUploadProps {
  images: string[];
  maxImages: number;
  onImagesChange: (images: string[]) => void;
  entityType: 'pet' | 'sitter';
  entityId: string;
}

const MultiImageUpload: React.FC<MultiImageUploadProps> = ({
  images,
  maxImages,
  onImagesChange,
  entityType,
  entityId
}) => {
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file: File) => {
    if (images.length >= maxImages) {
      toast({ title: `Maximum ${maxImages} images allowed` });
      return;
    }
    
    setUploading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${entityId}/${Date.now()}.${fileExt}`;
      const bucket = entityType === 'pet' ? 'pet-images' : 'sitter-images';
      
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
      
      onImagesChange([...images, publicUrl]);
      
      toast({ title: 'Image uploaded successfully' });
    } catch (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };
  
  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };
  
  const handleReorder = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {images.map((url, index) => (
          <div key={index} className="relative aspect-square">
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="w-full h-full object-cover rounded-lg"
            />
            {index === 0 && (
              <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                Primary
              </div>
            )}
            <button
              onClick={() => handleRemove(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        
        {images.length < maxImages && (
          <label className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-600 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              className="hidden"
              disabled={uploading}
            />
            {uploading ? (
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            ) : (
              <>
                <Plus className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-sm text-gray-600">Add Photo</span>
                <span className="text-xs text-gray-400">
                  {images.length}/{maxImages}
                </span>
              </>
            )}
          </label>
        )}
      </div>
      
      <p className="text-sm text-gray-600">
        First photo will be your primary image. Drag to reorder.
      </p>
    </div>
  );
};
```

### 4. Pet-Specific Care Fields Component

```typescript
// src/components/pet/PetCareFields.tsx
interface PetCareFieldsProps {
  petType: 'dog' | 'cat';
  values: any;
  onChange: (field: string, value: any) => void;
}

const PetCareFields: React.FC<PetCareFieldsProps> = ({ petType, values, onChange }) => {
  return (
    <div className="space-y-4">
      {/* Common fields */}
      <div>
        <label className="block text-sm font-medium mb-2">Feeding Schedule</label>
        <textarea
          value={values.feeding_schedule || ''}
          onChange={(e) => onChange('feeding_schedule', e.target.value)}
          placeholder="e.g., Twice daily, morning and evening"
          className="w-full p-3 border rounded-lg"
          rows={2}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Temperament</label>
        <input
          type="text"
          value={values.temperament || ''}
          onChange={(e) => onChange('temperament', e.target.value)}
          placeholder="e.g., Friendly, energetic, shy"
          className="w-full p-3 border rounded-lg"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Special Needs</label>
        <textarea
          value={values.special_needs || ''}
          onChange={(e) => onChange('special_needs', e.target.value)}
          placeholder="Any medical conditions, allergies, or special requirements"
          className="w-full p-3 border rounded-lg"
          rows={3}
        />
      </div>
      
      {/* Dog-specific fields */}
      {petType === 'dog' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Walking Schedule</label>
            <input
              type="text"
              value={values.walking_schedule || ''}
              onChange={(e) => onChange('walking_schedule', e.target.value)}
              placeholder="e.g., 3 times daily, 30 minutes each"
              className="w-full p-3 border rounded-lg"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Potty Training Status</label>
            <select
              value={values.potty_training_status || ''}
              onChange={(e) => onChange('potty_training_status', e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select status...</option>
              <option value="fully_trained">Fully Trained</option>
              <option value="mostly_trained">Mostly Trained</option>
              <option value="in_training">In Training</option>
              <option value="not_trained">Not Trained</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Leash Behavior</label>
            <input
              type="text"
              value={values.leash_behavior || ''}
              onChange={(e) => onChange('leash_behavior', e.target.value)}
              placeholder="e.g., Walks well on leash, pulls sometimes"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </>
      )}
      
      {/* Cat-specific fields */}
      {petType === 'cat' && (
        <>
          <div>
            <label className="block text-sm font-medium mb-2">Litter Box Details</label>
            <textarea
              value={values.litter_box_details || ''}
              onChange={(e) => onChange('litter_box_details', e.target.value)}
              placeholder="e.g., Litter type preference, cleaning frequency"
              className="w-full p-3 border rounded-lg"
              rows={2}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Indoor/Outdoor</label>
            <select
              value={values.indoor_outdoor || ''}
              onChange={(e) => onChange('indoor_outdoor', e.target.value)}
              className="w-full p-3 border rounded-lg"
            >
              <option value="">Select...</option>
              <option value="indoor">Indoor Only</option>
              <option value="outdoor">Outdoor Only</option>
              <option value="both">Both Indoor & Outdoor</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Scratching Preferences</label>
            <input
              type="text"
              value={values.scratching_preferences || ''}
              onChange={(e) => onChange('scratching_preferences', e.target.value)}
              placeholder="e.g., Has scratching post, prefers cardboard"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-2">Favorite Toys/Activities</label>
        <textarea
          value={values.favorite_toys || ''}
          onChange={(e) => onChange('favorite_toys', e.target.value)}
          placeholder={petType === 'dog' ? 'e.g., Fetch, tug-of-war, squeaky toys' : 'e.g., Feather wand, laser pointer, catnip toys'}
          className="w-full p-3 border rounded-lg"
          rows={2}
        />
      </div>
    </div>
  );
};
```

### 5. Sitter Pet Preferences Component

```typescript
// src/components/sitter/PetPreferencesSelector.tsx
interface PetPreferencesSelectorProps {
  value: { dogs: boolean; cats: boolean };
  onChange: (prefs: { dogs: boolean; cats: boolean }) => void;
}

const PetPreferencesSelector: React.FC<PetPreferencesSelectorProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Which pets do you care for?</h3>
      
      <div className="space-y-3">
        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={value.dogs}
            onChange={(e) => onChange({ ...value, dogs: e.target.checked })}
            className="w-5 h-5 mr-3"
          />
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">🐕</span>
            <div>
              <div className="font-medium">Dogs</div>
              <div className="text-sm text-gray-600">Walks, playtime, training</div>
            </div>
          </div>
        </label>
        
        <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
          <input
            type="checkbox"
            checked={value.cats}
            onChange={(e) => onChange({ ...value, cats: e.target.checked })}
            className="w-5 h-5 mr-3"
          />
          <div className="flex items-center gap-3 flex-1">
            <span className="text-3xl">🐱</span>
            <div>
              <div className="font-medium">Cats</div>
              <div className="text-sm text-gray-600">Play, feeding, litter care</div>
            </div>
          </div>
        </label>
      </div>
      
      {!value.dogs && !value.cats && (
        <p className="text-sm text-red-600">Please select at least one pet type</p>
      )}
    </div>
  );
};
```

## Terminology Mapping

### Global Replacements

| Old Term | New Term | Context |
|----------|----------|---------|
| "dog" | "pet" | General references |
| "dogs" | "pets" | Plural general references |
| "pup" | "pet" | Casual references |
| "pups" | "pets" | Casual plural |
| "dog owner" | "pet owner" | User type |
| "dog walker" | "pet sitter" | Service provider |
| "walk" | "care session" | When referring to both types |
| "Find dog sitters" | "Find pet sitters" | Marketing copy |

### Specific Terminology (Keep Differentiated)

| Dog Term | Cat Term | Generic Term |
|----------|----------|--------------|
| Walk | Play session | Care session |
| Leash | Harness | Equipment |
| Potty training | Litter training | Training |
| Dog park | Play area | Activity space |
| Fetch | Chase toys | Play activity |

## Migration Strategy

### Phase 1: Database Migration
1. Run `add_cat_support.sql`
2. Add pet_type column with default 'dog'
3. Add cat-specific fields
4. Update existing records

### Phase 2: Backend Updates
1. Update API endpoints to handle pet_type
2. Add validation for pet-specific fields
3. Update search/filter logic
4. Update booking logic

### Phase 3: Frontend Updates
1. Update all text/copy
2. Add pet type selectors
3. Update forms with conditional fields
4. Add multi-image upload
5. Update filters

### Phase 4: Testing & Rollout
1. Test with both pet types
2. Test mixed households
3. Test sitter preferences
4. Gradual rollout to users

## Success Metrics

- % of users with cats vs dogs
- % of sitters accepting both types
- Booking conversion rate by pet type
- User satisfaction scores
- Search filter usage
