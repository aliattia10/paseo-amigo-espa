import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import PetTypeSelector from '@/components/pet/PetTypeSelector';
import BreedSelector from '@/components/pet/BreedSelector';
import TinderPhotoGallery from '@/components/profile/TinderPhotoGallery';

const DogOwnerProfileSetup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [petType, setPetType] = useState<'dog' | 'cat'>('dog');
  const [petData, setPetData] = useState({
    name: '',
    age: '',
    breed: '',
    notes: '',
    imageUrl: '',
    temperament: [] as string[],
    specialNeeds: '',
    energyLevel: 'medium' as 'low' | 'medium' | 'high',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const MAX_PHOTOS = 6;

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-pet-${Date.now()}.${fileExt}`;
      const filePath = `pets/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setPetData({ ...petData, imageUrl: publicUrl });
      
      toast({
        title: t('common.success'),
        description: `${petType === 'dog' ? 'Dog' : 'Cat'} picture uploaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: 'Image size must be less than 5MB',
          variant: 'destructive',
        });
        return;
      }
      
      handleImageUpload(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!petData.name.trim()) {
      toast({
        title: t('common.error'),
        description: `Please enter your ${petType}'s name`,
        variant: 'destructive',
      });
      return;
    }
    
    if (!petData.age.trim()) {
      toast({
        title: t('common.error'),
        description: `Please enter your ${petType}'s age`,
        variant: 'destructive',
      });
      return;
    }
    
    if (photos.filter(p => p).length === 0) {
      toast({
        title: t('common.error'),
        description: `Please upload at least one picture of your ${petType}`,
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      console.log('=== CREATING PET PROFILE ===');
      console.log('Pet data:', petData);
      
      // Use photos array for multi-image support
      const imageUrlJson = JSON.stringify(photos.filter(p => p));
      
      // Verify user is logged in
      if (!currentUser) {
        throw new Error('You must be logged in to create a pet profile');
      }

      console.log('Current user ID:', currentUser.id);
      console.log('Photos to save:', photos.filter(p => p));

      // Try pets table first (new structure)
      const { data: insertedPet, error: petsError } = await supabase
        .from('pets')
        .insert({
          owner_id: currentUser.id,
          name: petData.name,
          pet_type: petType,
          age: petData.age,
          breed: petData.breed || null,
          notes: petData.notes,
          image_url: imageUrlJson,
          temperament: petData.temperament,
          special_needs: petData.specialNeeds || null,
          energy_level: petData.energyLevel,
        })
        .select()
        .single();

      console.log('Insert result:', { insertedPet, petsError });

      if (petsError) {
        console.error('Pets table error:', {
          message: petsError.message,
          details: petsError.details,
          hint: petsError.hint,
          code: petsError.code
        });
        
        // Fallback to dogs table if pets doesn't exist
        if (petsError.message.includes('does not exist') || petsError.message.includes('not find')) {
          console.log('Trying dogs table as fallback...');
          const { error: dogsError } = await supabase
            .from('dogs')
            .insert({
              owner_id: currentUser!.id,
              name: petData.name,
              age: petData.age,
              breed: petData.breed || null,
              notes: petData.notes,
              image_url: imageUrlJson,
              temperament: petData.temperament,
              special_needs: petData.specialNeeds || null,
              energy_level: petData.energyLevel,
            });
          
          if (dogsError) throw dogsError;
        } else {
          throw petsError;
        }
      }

      console.log('Pet profile created successfully');
      
      // Use the returned pet data if available
      if (insertedPet) {
        console.log('Created pet:', insertedPet);
        toast({
          title: t('common.success'),
          description: `${petType === 'dog' ? 'Dog' : 'Cat'} profile created! You can add more photos and details.`,
        });
        navigate(`/pet/${insertedPet.id}/edit`);
      } else {
        // Fallback: try to fetch the created pet
        const { data: createdPet, error: fetchError } = await supabase
          .from('pets')
          .select('id')
          .eq('owner_id', currentUser.id)
          .eq('name', petData.name)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (fetchError) {
          console.error('Fetch error:', fetchError);
          // Try dogs table as fallback
          const { data: createdDog } = await supabase
            .from('dogs')
            .select('id')
            .eq('owner_id', currentUser.id)
            .eq('name', petData.name)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          
          if (createdDog) {
            toast({
              title: t('common.success'),
              description: `${petType === 'dog' ? 'Dog' : 'Cat'} profile created! You can add more photos and details.`,
            });
            navigate(`/pet/${createdDog.id}/edit`);
            return;
          }
        }

        if (createdPet) {
          toast({
            title: t('common.success'),
            description: `${petType === 'dog' ? 'Dog' : 'Cat'} profile created! You can add more photos and details.`,
          });
          navigate(`/pet/${createdPet.id}/edit`);
        } else {
          // Fallback to dashboard if we can't get the ID
          toast({
            title: t('common.success'),
            description: `${petType === 'dog' ? 'Dog' : 'Cat'} profile created successfully!`,
          });
          navigate('/dashboard');
        }
      }
    } catch (error: any) {
      console.error('Create pet error:', error);
      toast({
        title: t('common.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => navigate('/')}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              close
            </span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-primary-light dark:text-text-primary-dark">
          Add Your Pet
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        <div className="text-center py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Let's create a profile for your furry friend! This helps sitters know your pet better.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Pet Type Selection */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
              Pet Type <span className="text-red-500">*</span>
            </label>
            <PetTypeSelector value={petType} onChange={setPetType} />
          </div>

          {/* Tinder-Style Pet Photo Gallery */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark px-4 mb-2">
              {petType === 'dog' ? 'Dog' : 'Cat'} Photos <span className="text-red-500">*</span>
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark px-4 mb-3">
              Add up to 6 photos of your {petType}. At least one photo is required.
            </p>
            <TinderPhotoGallery
              photos={photos}
              onPhotosChange={(newPhotos) => setPhotos(newPhotos)}
              maxPhotos={MAX_PHOTOS}
            />
            {photos.filter(p => p).length === 0 && (
              <p className="text-xs text-red-500 font-medium text-center mt-2">* At least one photo is required</p>
            )}
          </div>

          {/* Pet Name - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Pet's Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={petData.name}
              onChange={(e) => setPetData({ ...petData, name: e.target.value })}
              className="w-full"
              placeholder="e.g., Max, Bella, Charlie"
              required
            />
          </div>

          {/* Pet Age - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={petData.age}
              onChange={(e) => setPetData({ ...petData, age: e.target.value })}
              className="w-full"
              placeholder="e.g., 2 years, 6 months"
              required
            />
          </div>

          {/* Pet Breed - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <BreedSelector 
              petType={petType} 
              value={petData.breed} 
              onChange={(breed) => setPetData({ ...petData, breed })}
            />
          </div>

          {/* Energy Level - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Energy Level <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setPetData({ ...petData, energyLevel: level })}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors capitalize ${
                    petData.energyLevel === level
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Temperament - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Temperament (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Friendly', 'Shy', 'Energetic', 'Calm', 'Playful', 'Anxious', 'Good with Kids', 'Good with Dogs'].map((trait) => (
                <button
                  key={trait}
                  type="button"
                  onClick={() => {
                    const newTemperament = petData.temperament.includes(trait)
                      ? petData.temperament.filter(t => t !== trait)
                      : [...petData.temperament, trait];
                    setPetData({ ...petData, temperament: newTemperament });
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    petData.temperament.includes(trait)
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark'
                  }`}
                >
                  {trait}
                </button>
              ))}
            </div>
          </div>

          {/* Special Needs - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Special Needs (Optional)
            </label>
            <textarea
              value={petData.specialNeeds}
              onChange={(e) => setPetData({ ...petData, specialNeeds: e.target.value })}
              className="w-full min-h-[80px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Medications, allergies, behavioral notes..."
            />
          </div>

          {/* Notes - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={petData.notes}
              onChange={(e) => setPetData({ ...petData, notes: e.target.value })}
              className="w-full min-h-[80px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Any other information about your dog..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <Button
              type="submit"
              disabled={loading || uploadingImage || !petData.imageUrl}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold"
            >
              {loading ? t('common.loading') : 'Create Pet Profile'}
            </Button>
            
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center mt-3">
              You can add more pets later from your profile
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DogOwnerProfileSetup;
