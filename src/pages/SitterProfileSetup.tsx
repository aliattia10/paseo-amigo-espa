import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import PetPreferencesSelector from '@/components/sitter/PetPreferencesSelector';
import TinderPhotoGallery from '@/components/profile/TinderPhotoGallery';

const SitterProfileSetup: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [sitterData, setSitterData] = useState({
    bio: '',
    hourlyRate: 15,
    avatarUrl: '',
    experience: [] as string[],
    dogs: true, // Default to dogs only for backward compatibility
    cats: false,
    dogExperience: '',
    catExperience: '',
  });
  const [photos, setPhotos] = useState<string[]>([]);
  const MAX_PHOTOS = 6;

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}-avatar-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setSitterData({ ...sitterData, avatarUrl: publicUrl });
      
      toast({
        title: t('common.success'),
        description: 'Profile picture uploaded successfully',
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
      if (!file.type.startsWith('image/')) {
        toast({
          title: t('common.error'),
          description: 'Please select an image file',
          variant: 'destructive',
        });
        return;
      }
      
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
    
    if (!sitterData.bio.trim()) {
      toast({
        title: t('common.error'),
        description: 'Please write a bio about yourself',
        variant: 'destructive',
      });
      return;
    }
    
    if (sitterData.hourlyRate < 5 || sitterData.hourlyRate > 100) {
      toast({
        title: t('common.error'),
        description: 'Hourly rate must be between $5 and $100',
        variant: 'destructive',
      });
      return;
    }
    
    if (!sitterData.dogs && !sitterData.cats) {
      toast({
        title: t('common.error'),
        description: 'Please select at least one pet type you can care for',
        variant: 'destructive',
      });
      return;
    }
    
    setLoading(true);
    try {
      const updateData: any = {
        bio: sitterData.bio,
        hourly_rate: sitterData.hourlyRate,
      };

      // Save photos as JSON array
      if (photos.filter(p => p).length > 0) {
        updateData.profile_image = JSON.stringify(photos.filter(p => p));
      } else if (sitterData.avatarUrl) {
        updateData.profile_image = JSON.stringify([sitterData.avatarUrl]);
      }

      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser!.id);

      if (error) {
        // If table doesn't exist, provide helpful message
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          throw new Error('Database not set up. Please contact support or run database migrations.');
        }
        throw error;
      }

      toast({
        title: t('common.success'),
        description: 'Sitter profile created! You can update your details anytime.',
      });

      // Redirect to profile edit page
      navigate('/profile/edit');
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
          Complete Your Sitter Profile
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
        <div className="text-center py-4">
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm">
            Tell pet owners about yourself and set your rate to start getting bookings!
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tinder-Style Photo Gallery */}
          <div className="mb-4">
            <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark px-4 mb-2">
              Your Photos
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark px-4 mb-3">
              Add up to 6 photos. Your first photo will be your main profile picture.
            </p>
            <TinderPhotoGallery
              photos={photos}
              onPhotosChange={(newPhotos) => setPhotos(newPhotos)}
              maxPhotos={MAX_PHOTOS}
            />
          </div>

          {/* Bio - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              About You <span className="text-red-500">*</span>
            </label>
            <textarea
              value={sitterData.bio}
              onChange={(e) => setSitterData({ ...sitterData, bio: e.target.value })}
              className="w-full min-h-[120px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Tell pet owners about yourself, your experience with pets, and why you'd be a great sitter..."
              required
              maxLength={500}
            />
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
              {sitterData.bio.length}/500 characters
            </p>
          </div>

          {/* Hourly Rate - Required */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Hourly Rate <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">$</span>
              <Input
                type="number"
                value={sitterData.hourlyRate}
                onChange={(e) => setSitterData({ ...sitterData, hourlyRate: parseInt(e.target.value) || 15 })}
                className="w-full text-lg"
                min="5"
                max="100"
                required
              />
              <span className="text-text-secondary-light dark:text-text-secondary-dark">/hour</span>
            </div>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2">
              Set your base rate. You can adjust this anytime.
            </p>
          </div>

          {/* Experience Tags - Optional */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Your Experience (Select all that apply)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {['Large Dogs', 'Small Dogs', 'Puppies', 'Senior Dogs', 'Cats', 'Kittens', 'Basic Training', 'High Energy', 'Special Needs', 'Multiple Pets'].map((exp) => (
                <button
                  key={exp}
                  type="button"
                  onClick={() => {
                    const newExperience = sitterData.experience.includes(exp)
                      ? sitterData.experience.filter(e => e !== exp)
                      : [...sitterData.experience, exp];
                    setSitterData({ ...sitterData, experience: newExperience });
                  }}
                  className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                    sitterData.experience.includes(exp)
                      ? 'bg-primary text-white'
                      : 'bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark border border-border-light dark:border-border-dark'
                  }`}
                >
                  {exp}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 pb-8">
            <Button
              type="submit"
              disabled={loading || uploadingImage}
              className="w-full bg-primary hover:bg-primary/90 text-white h-12 text-base font-bold"
            >
              {loading ? t('common.loading') : 'Complete Profile'}
            </Button>
            
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark text-center mt-3">
              You can set your availability after completing your profile
            </p>
          </div>
        </form>
      </main>
    </div>
  );
};

export default SitterProfileSetup;
