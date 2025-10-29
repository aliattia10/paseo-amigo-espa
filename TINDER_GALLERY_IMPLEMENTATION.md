# Tinder-Style Multi-Image Gallery Implementation

## 🎯 Overview
This document outlines the implementation of Tinder-style multi-image galleries on the home page and ensures all profile data is properly connected to Supabase.

## ✅ Current Status

### What's Already Working:
1. ✅ **PetEditPage** - Multiple images with Tinder-style gallery
2. ✅ **ProfileEditPage** - Single profile image upload
3. ✅ **Database Schema** - `pets.image_url` stores JSON array of images
4. ✅ **Storage Bucket** - `avatars` bucket configured for uploads

### What Needs Implementation:
1. ⏳ **NewHomePage** - Display multiple pet images in swipeable gallery
2. ⏳ **Load Real Data** - Fetch actual pets and users from Supabase
3. ⏳ **Profile Creation Flow** - Ensure all data saves to database

## 📋 Implementation Plan

### Phase 1: Update NewHomePage to Show Multiple Images

#### Current Issue:
- Home page shows hardcoded profiles with single images
- Not connected to Supabase database
- Uses mock data instead of real profiles

#### Solution:
```typescript
// Update Profile interface to support multiple images
interface Profile {
  id: string;
  name: string;
  age?: number;
  distance: number;
  rating: number;
  imageUrls: string[]; // Changed from imageUrl to imageUrls array
  currentImageIndex: number; // Track which image is showing
  bio?: string;
  hourlyRate?: number;
  type: 'pet' | 'walker';
  petType?: 'dog' | 'cat'; // For pets
}
```

#### Add Image Navigation:
```typescript
const [profileImageIndexes, setProfileImageIndexes] = useState<Record<string, number>>({});

const nextImage = (profileId: string, totalImages: number) => {
  setProfileImageIndexes(prev => ({
    ...prev,
    [profileId]: ((prev[profileId] || 0) + 1) % totalImages
  }));
};

const prevImage = (profileId: string, totalImages: number) => {
  setProfileImageIndexes(prev => ({
    ...prev,
    [profileId]: ((prev[profileId] || 0) - 1 + totalImages) % totalImages
  }));
};
```

#### Update Card Display:
```tsx
{/* Main Card with Image Gallery */}
<div className="relative">
  {/* Image */}
  <div 
    className="bg-cover bg-center h-full"
    style={{
      backgroundImage: `url("${currentProfile.imageUrls[profileImageIndexes[currentProfile.id] || 0]}")`
    }}
  >
    {/* Image Navigation Arrows */}
    {currentProfile.imageUrls.length > 1 && (
      <>
        <button
          onClick={(e) => {
            e.stopPropagation();
            prevImage(currentProfile.id, currentProfile.imageUrls.length);
          }}
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          ‹
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            nextImage(currentProfile.id, currentProfile.imageUrls.length);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full"
        >
          ›
        </button>
      </>
    )}
    
    {/* Dot Indicators */}
    <div className="absolute top-2 left-0 right-0 flex justify-center gap-1">
      {currentProfile.imageUrls.map((_, index) => (
        <div
          key={index}
          className={`h-1 rounded-full transition-all ${
            index === (profileImageIndexes[currentProfile.id] || 0)
              ? 'w-6 bg-white'
              : 'w-1 bg-white/50'
          }`}
        />
      ))}
    </div>
  </div>
</div>
```

### Phase 2: Connect to Supabase Database

#### Fetch Real Pets:
```typescript
const [pets, setPets] = useState<Profile[]>([]);
const [walkers, setWalkers] = useState<Profile[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchProfiles();
}, [userRole]);

const fetchProfiles = async () => {
  setLoading(true);
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    if (userRole === 'sitter') {
      // Fetch pets for sitters to browse
      const { data: petsData, error } = await supabase
        .from('pets')
        .select(`
          id,
          name,
          age,
          pet_type,
          breed,
          image_url,
          owner:users!pets_owner_id_fkey(
            id,
            name,
            city,
            latitude,
            longitude
          )
        `)
        .limit(20);
      
      if (error) throw error;
      
      // Parse image URLs from JSON
      const parsedPets = petsData?.map(pet => {
        let imageUrls: string[] = [];
        try {
          imageUrls = JSON.parse(pet.image_url || '[]');
        } catch {
          imageUrls = pet.image_url ? [pet.image_url] : [];
        }
        
        return {
          id: pet.id,
          name: pet.name,
          age: pet.age,
          imageUrls: imageUrls.length > 0 ? imageUrls : ['https://via.placeholder.com/400'],
          type: 'pet' as const,
          petType: pet.pet_type,
          distance: calculateDistance(pet.owner?.latitude, pet.owner?.longitude),
          rating: 0,
        };
      }) || [];
      
      setPets(parsedPets);
    } else {
      // Fetch walkers for owners to browse
      const { data: walkersData, error } = await supabase
        .from('users')
        .select(`
          id,
          name,
          profile_image,
          avatar_url,
          bio,
          city,
          latitude,
          longitude,
          walker_profiles!walker_profiles_user_id_fkey(
            hourly_rate,
            rating,
            total_walks
          )
        `)
        .eq('user_type', 'walker')
        .limit(20);
      
      if (error) throw error;
      
      const parsedWalkers = walkersData?.map(walker => ({
        id: walker.id,
        name: walker.name,
        imageUrls: [walker.profile_image || walker.avatar_url || 'https://via.placeholder.com/400'],
        bio: walker.bio,
        type: 'walker' as const,
        hourlyRate: walker.walker_profiles?.[0]?.hourly_rate,
        rating: walker.walker_profiles?.[0]?.rating || 0,
        distance: calculateDistance(walker.latitude, walker.longitude),
      })) || [];
      
      setWalkers(parsedWalkers);
    }
  } catch (error) {
    console.error('Error fetching profiles:', error);
    toast({
      title: 'Error',
      description: 'Failed to load profiles',
      variant: 'destructive',
    });
  } finally {
    setLoading(false);
  }
};

const calculateDistance = (lat?: number, lon?: number) => {
  if (!location || !lat || !lon) return 0;
  // Haversine formula for distance calculation
  const R = 6371; // Earth's radius in km
  const dLat = (lat - location.latitude) * Math.PI / 180;
  const dLon = (lon - location.longitude) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(location.latitude * Math.PI / 180) * Math.cos(lat * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Round to 1 decimal
};
```

### Phase 3: Ensure Profile Creation Saves to Database

#### DogOwnerProfileSetup.tsx:
```typescript
// Already saves to pets table ✅
// Verify image_url is saved as JSON array
const imageUrlJson = JSON.stringify([imageUrl]); // Wrap single URL in array

const { error } = await supabase
  .from('pets')
  .insert({
    owner_id: currentUser.id,
    name: petData.name,
    pet_type: petData.petType,
    age: petData.age,
    breed: petData.breed,
    notes: petData.notes,
    image_url: imageUrlJson, // Save as JSON array
  });
```

#### SitterProfileSetup.tsx:
```typescript
// Should save to both users and walker_profiles tables

// 1. Update users table
const { error: userError } = await supabase
  .from('users')
  .update({
    bio: formData.bio,
    profile_image: profileImageUrl,
  })
  .eq('id', currentUser.id);

// 2. Create/update walker_profiles
const { error: walkerError } = await supabase
  .from('walker_profiles')
  .upsert({
    user_id: currentUser.id,
    bio: formData.bio,
    experience: formData.experience,
    hourly_rate: formData.hourlyRate,
    availability: formData.availability,
    tags: formData.tags,
  });
```

## 🔗 Database Connections Checklist

### Users Table:
- ✅ `id` - Primary key
- ✅ `name` - User's name
- ✅ `email` - User's email
- ✅ `profile_image` - Profile picture URL
- ✅ `bio` - User bio
- ✅ `user_type` - 'owner' or 'walker'
- ✅ `latitude`, `longitude` - Location for distance calculation

### Pets Table:
- ✅ `id` - Primary key
- ✅ `owner_id` - Foreign key to users.id
- ✅ `name` - Pet's name
- ✅ `pet_type` - 'dog' or 'cat'
- ✅ `age` - Pet's age
- ✅ `breed` - Pet's breed
- ✅ `image_url` - **JSON array of image URLs** ⚠️
- ✅ `notes` - Additional notes

### Walker Profiles Table:
- ✅ `id` - Primary key
- ✅ `user_id` - Foreign key to users.id (UNIQUE)
- ✅ `bio` - Walker bio
- ✅ `experience` - Experience description
- ✅ `hourly_rate` - Rate per hour
- ✅ `rating` - Average rating (auto-calculated)
- ✅ `total_walks` - Total completed walks (auto-incremented)
- ✅ `total_reviews` - Total reviews (auto-calculated)

## 🚀 Implementation Priority

### High Priority (Do First):
1. ✅ Fix image upload button (DONE)
2. ⏳ Update NewHomePage to fetch real data from Supabase
3. ⏳ Add multi-image gallery to profile cards
4. ⏳ Ensure all profile creation saves correctly

### Medium Priority:
1. ⏳ Add swipe gestures for image navigation
2. ⏳ Implement distance-based filtering
3. ⏳ Add loading states

### Low Priority:
1. ⏳ Image preloading for smooth transitions
2. ⏳ Lazy loading for better performance
3. ⏳ Cache profiles locally

## 📝 Testing Checklist

### Profile Creation:
- [ ] Create pet profile → Check `pets` table has entry
- [ ] Upload pet images → Check `image_url` contains JSON array
- [ ] Create walker profile → Check `users` and `walker_profiles` tables
- [ ] Upload profile picture → Check `users.profile_image` has URL

### Home Page Display:
- [ ] Switch to "Find Sitters" → See real walker profiles
- [ ] Switch to "Find Pets" → See real pet profiles
- [ ] Click image arrows → Navigate through multiple images
- [ ] Swipe card → Move to next profile
- [ ] Like profile → Save to database

### Data Integrity:
- [ ] All images display correctly
- [ ] Distance calculation works
- [ ] Ratings display correctly
- [ ] Profile data matches database

## 🎉 Expected Result

After full implementation:
- ✅ Home page shows real profiles from Supabase
- ✅ Pet profiles display multiple images in Tinder-style gallery
- ✅ Walker profiles display profile pictures
- ✅ All profile creation flows save to correct tables
- ✅ Image navigation works smoothly
- ✅ Distance-based sorting works
- ✅ Everything is connected to Supabase

## 🔧 Quick Fixes Needed

1. **DogOwnerProfileSetup** - Ensure image_url saves as JSON array
2. **SitterProfileSetup** - Save to walker_profiles table
3. **NewHomePage** - Replace mock data with Supabase queries
4. **Image Display** - Parse JSON array and show gallery

This is a comprehensive update that will take some time to implement fully. Would you like me to start with the most critical part first?
