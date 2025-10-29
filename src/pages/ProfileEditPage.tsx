import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TinderPhotoGallery from '@/components/profile/TinderPhotoGallery';

const ProfileEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    postalCode: userProfile?.postalCode || '',
    bio: userProfile?.bio || '',
    profilePictureUrl: userProfile?.profileImage || '',
  });
  
  // Tinder-style multiple photos (max 6)
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const MAX_PHOTOS = 6;

  // Update form data when userProfile changes
  React.useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        phone: userProfile.phone || '',
        city: userProfile.city || '',
        postalCode: userProfile.postalCode || '',
        bio: userProfile.bio || '',
        profilePictureUrl: userProfile.profileImage || '',
      });
      
      // Load existing photos from profile_image (stored as JSON array)
      if (userProfile.profileImage) {
        try {
          const parsed = JSON.parse(userProfile.profileImage);
          if (Array.isArray(parsed)) {
            setPhotos(parsed);
          } else {
            setPhotos([userProfile.profileImage]);
          }
        } catch {
          setPhotos([userProfile.profileImage]);
        }
      }
    }
  }, [userProfile]);

  const handleImageUpload = async (file: File, index: number) => {
    console.log('=== IMAGE UPLOAD START ===');
    console.log('File:', file.name, file.type, file.size, 'Index:', index);
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload images',
        variant: 'destructive',
      });
      return;
    }

    setUploadingIndex(index);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }
      
      // Check if avatars bucket exists
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      console.log('Available buckets:', buckets);
      
      if (bucketsError || !buckets?.some(b => b.name === 'avatars')) {
        throw new Error('Storage bucket not configured. Please run: database/fix_profile_storage.sql or database/fix_storage_bucket.sql');
      }
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/photo-${index}-${Date.now()}.${fileExt}`;
      console.log('Uploading to:', fileName);

      // Delete old image at this index if exists
      if (photos[index]) {
        const oldPath = photos[index].split('/').slice(-2).join('/');
        console.log('Deleting old image:', oldPath);
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new image
      console.log('Uploading file to storage...');
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          throw new Error('Storage not configured. Please contact support or run database/fix_profile_storage.sql in Supabase SQL Editor');
        }
        if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
          throw new Error('Upload permission denied. Please check storage policies in Supabase');
        }
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      console.log('File uploaded successfully');
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
      
      console.log('Public URL:', publicUrl);

      // Update photos array
      const newPhotos = [...photos];
      newPhotos[index] = publicUrl;
      setPhotos(newPhotos);

      // Update the profile pictures in the database immediately
      console.log('Updating database with new photos array...');
      const photosJson = JSON.stringify(newPhotos.filter(p => p)); // Remove empty slots
      
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_image: photosJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id)
        .select();

      if (updateError) {
        console.error('Profile update error:', {
          message: updateError.message,
          details: updateError.details,
          hint: updateError.hint
        });
        throw new Error(`Failed to update profile picture: ${updateError.message}`);
      }

      console.log('Database updated:', updateData);
      setFormData({ ...formData, profilePictureUrl: newPhotos[0] || publicUrl });
      
      // Refresh the user profile in auth context
      console.log('Refreshing user profile...');
      await refreshUserProfile();
      console.log('Profile refreshed');
      
      toast({
        title: 'Success!',
        description: `Photo ${index + 1} uploaded successfully`,
      });
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: 'Upload Failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
    } finally {
      setUploadingImage(false);
      console.log('=== IMAGE UPLOAD END ===');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent any event bubbling
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      await handleImageUpload(file);
    }
    // Reset input to allow same file selection
    e.target.value = '';
  };

  const handleSave = async () => {
    console.log('=== SAVE PROFILE START ===');
    console.log('Current user:', currentUser?.id);
    console.log('Form data:', formData);
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to update your profile',
        variant: 'destructive',
      });
      return;
    }

    // Validate required fields
    if (!formData.name || !formData.phone) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in your name and phone number',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      const updateData: any = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        city: formData.city?.trim() || null,
        postal_code: formData.postalCode?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      // Add bio if it exists
      if (formData.bio) {
        updateData.bio = formData.bio.trim();
      }

      if (formData.profilePictureUrl) {
        updateData.profile_image = formData.profilePictureUrl;
      }

      console.log('Updating profile with data:', updateData);
      console.log('User ID:', currentUser.id);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id)
        .select();

      if (error) {
        console.error('Update error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        // If table doesn't exist, provide helpful message
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          throw new Error('Database not set up. Please contact support.');
        }
        if (error.message.includes('permission') || error.message.includes('denied') || error.message.includes('policy')) {
          throw new Error('Permission denied. Please check your database RLS policies or contact support.');
        }
        if (error.message.includes('violates')) {
          throw new Error('Invalid data. Please check all fields and try again.');
        }
        throw new Error(`Database error: ${error.message}`);
      }

      // Check if update actually happened
      if (!data || data.length === 0) {
        console.warn('No data returned from update - this might indicate RLS policy issues');
        throw new Error('Profile update may have failed. Please check console for details.');
      }

      console.log('Profile updated successfully:', data);

      // Refresh the user profile in auth context
      console.log('Refreshing user profile...');
      await refreshUserProfile();
      console.log('User profile refreshed');

      toast({
        title: '✓ Saved!',
        description: 'Your profile has been updated',
      });

      // Navigate back without reload - use replace to avoid adding to history
      setTimeout(() => {
        console.log('Navigating back to profile...');
        navigate('/profile', { replace: true });
      }, 1000);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
      console.log('=== SAVE PROFILE END ===');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Form submit prevented');
    // Call handleSave when form is submitted
    handleSave();
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-background-light dark:bg-background-dark max-w-md mx-auto">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button 
            type="button" 
            onClick={(e) => {
              e.preventDefault();
              navigate('/profile');
            }}
          >
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              arrow_back
            </span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-primary-light dark:text-text-primary-dark">
          {t('dashboard.editProfile')}
        </h2>
        <div className="flex w-12 items-center justify-end"></div>
      </div>

      {/* Main Content */}
      <main className="flex-1 p-4 space-y-4">
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
            onPhotosChange={async (newPhotos) => {
              setPhotos(newPhotos);
              // Update database
              try {
                const { supabase } = await import('@/integrations/supabase/client');
                const photosJson = JSON.stringify(newPhotos.filter(p => p));
                await supabase
                  .from('users')
                  .update({ profile_image: photosJson })
                  .eq('id', currentUser!.id);
                await refreshUserProfile();
              } catch (error) {
                console.error('Failed to update photos:', error);
              }
            }}
            maxPhotos={MAX_PHOTOS}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.name')}
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full"
              placeholder="Your name"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.phone')}
            </label>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full"
              placeholder="Your phone number"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.city')}
            </label>
            <Input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className="w-full"
              placeholder="Your city"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              {t('auth.postalCode')}
            </label>
            <Input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              className="w-full"
              placeholder="Your postal code"
            />
          </div>

          <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
            <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="w-full min-h-[100px] p-3 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark"
              placeholder="Tell us about yourself..."
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-4 pb-8">
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white h-12"
          >
            {loading ? t('common.loading') : t('common.save')}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ProfileEditPage;
