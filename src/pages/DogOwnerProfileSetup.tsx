import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const DogOwnerProfileSetup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [dogData, setDogData] = useState({
    name: '',
    age: '',
    breed: '',
    notes: '',
    imageUrl: '',
    temperament: [] as string[],
    specialNeeds: '',
    energyLevel: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-dog-${Date.now()}.${fileExt}`;
      const filePath = `dogs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setDogData({ ...dogData, imageUrl: publicUrl });
      
      toast({
        title: t('common.success'),
        description: 'Dog picture uploaded successfully',
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
    if (!dogData.name.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please enter your dog\'s name',
        variant: 'destructive',
      });
      return;
    }
    
    if (!dogData.age.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please enter your dog\'s age',
        variant: 'destructive',
      });
      return;
    }
    
    if (!dogData.imageUrl) {
      toast({
        title: t('common.error'),
        description: 'Please upload a picture of your dog',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('dogs')
        .insert({
          owner_id: currentUser!.id,
          name: dogData.name,
          age: dogData.age,
          breed: dogData.breed || null,
          notes: dogData.notes,
          image_url: dogData.imageUrl,
          temperament: dogData.temperament,
          special_needs: dogData.specialNeeds || null,
          energy_level: dogData.energyLevel,
        });

      if (error) {
        // If table doesn't exist, provide helpful message
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          throw new Error('Database not set up. Please contact support or run database migrations.');
        }
        throw error;
      }

      toast({
        title: t('common.success'),
        description: 'Dog profile created successfully!',
      });

      navigate('/');
    } catch (error: any) {
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
          Add Your Dog
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        <div className="text-center py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Let's create a profile for your furry friend! This helps sitters know your dog better.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dog Picture - Required */}
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="relative">
              <div 
                className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-40 w-40 border-4 border-card-light dark:border-card-dark shadow-lg"
                style={{
                  backgroundImage: dogData.imageUrl 
                    ? `url("${dogData.imageUrl}")`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {!dogData.imageUrl && (
                  <div className="flex items-center justify-center h-full">
                    <span className="material-symbols-outlined text-white text-6xl">pets</span>
                  </div>
                )}
              </div>
              {uploadingImage && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            
            <label htmlFor="dog-picture" className="cursor-pointer">
              <input
                id="dog-picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                required
              />
              <Button 
                type="button" 
                variant="outline" 
                className="text-primary border-2 border-primary hover:bg-primary hover:text-white transition-colors" 
                disabled={uploadingImage}
              >
                <span className="material-symbols-outlined mr-2">photo_camera</span>
                {uploadingImage ? 'Uploading...' : dogData.imageUrl ? 'Change Photo' : 'Upload Photo *'}
              </Button>
            </label>
            
            {!dogData.imageUrl && (
              <p className="text-xs text-red-500 font-medium">* Photo is required</p>
            )}
          </div>

          {/* Dog Name - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Dog's Name <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={dogData.name}
              onChange={(e) => setDogData({ ...dogData, name: e.target.value })}
              className="w-full"
              placeholder="e.g., Max, Bella, Charlie"
              required
            />
          </div>

          {/* Dog Age - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Age <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={dogData.age}
              onChange={(e) => setDogData({ ...dogData, age: e.target.value })}
              className="w-full"
              placeholder="e.g., 2 years, 6 months"
              required
            />
          </div>

          {/* Dog Breed - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Breed (Optional)
            </label>
            <Input
              type="text"
              value={dogData.breed}
              onChange={(e) => setDogData({ ...dogData, breed: e.target.value })}
              className="w-full"
              placeholder="e.g., Golden Retriever, Mixed"
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
                  onClick={() => setDogData({ ...dogData, energyLevel: level })}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors capitalize ${
                    dogData.energyLevel === level
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
                    const newTemperament = dogData.temperament.includes(trait)
                      ? dogData.temperament.filter(t => t !== trait)
                      : [...dogData.temperament, trait];
                    setDogData({ ...dogData, temperament: newTemperament });
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    dogData.temperament.includes(trait)
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
              value={dogData.specialNeeds}
              onChange={(e) => setDogData({ ...dogData, specialNeeds: e.target.value })}
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
              value={dogData.notes}
              onChange={(e) => setDogData({ ...dogData, notes: e.target.value })}
              className="w-full min-h-[80px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Any other information about your dog..."
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <Button
              type="submit"
              disabled={loading || uploadingImage || !dogData.imageUrl}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold"
            >
              {loading ? t('common.loading') : 'Create Dog Profile'}
            </Button>
            
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center mt-3">
              You can add more dogs later from your profile
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default DogOwnerProfileSetup;
