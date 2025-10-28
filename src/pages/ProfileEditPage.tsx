import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

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
    bio: '',
    profilePictureUrl: '',
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageUpload = async (file: File) => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to upload images',
        variant: 'destructive',
      });
      return;
    }

    setUploadingImage(true);
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
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/${Date.now()}.${fileExt}`;

      // Delete old image if exists
      if (formData.profilePictureUrl) {
        const oldPath = formData.profilePictureUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      // Upload new image
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('not found')) {
          throw new Error('Storage bucket not configured. Please run: database/fix_profile_storage.sql');
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update the profile picture in the database immediately
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          profile_image: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        throw new Error('Failed to update profile picture in database');
      }

      setFormData({ ...formData, profilePictureUrl: publicUrl });
      
      // Refresh the user profile in auth context
      await refreshUserProfile();
      
      toast({
        title: 'Success!',
        description: 'Profile picture updated successfully',
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
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      handleImageUpload(file);
    }
  };

  const handleSave = async () => {
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

      if (formData.profilePictureUrl) {
        updateData.profile_image = formData.profilePictureUrl;
      }

      console.log('Updating profile with data:', updateData);

      const { data, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id)
        .select();

      if (error) {
        console.error('Update error:', error);
        // If table doesn't exist, provide helpful message
        if (error.message.includes('does not exist') || error.message.includes('not find')) {
          throw new Error('Database not set up. Please run: database/fix_profile_storage.sql');
        }
        if (error.message.includes('permission')) {
          throw new Error('Permission denied. Please check database RLS policies.');
        }
        throw error;
      }

      console.log('Profile updated successfully:', data);

      // Refresh the user profile in auth context
      await refreshUserProfile();

      toast({
        title: '✓ Saved!',
        description: 'Your profile has been updated',
      });

      // Navigate back without reload
      setTimeout(() => {
        navigate('/profile');
      }, 500);
    } catch (error: any) {
      console.error('Save error:', error);
      toast({
        title: 'Save Failed',
        description: error.message || 'Failed to update profile. Please try again.',
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
          <button onClick={() => navigate('/profile')}>
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
        {/* Profile Picture */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative">
            <div 
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-32 w-32 border-4 border-card-light dark:border-card-dark shadow-md"
              style={{
                backgroundImage: formData.profilePictureUrl 
                  ? `url("${formData.profilePictureUrl}")`
                  : 'url("https://api.dicebear.com/7.x/avataaars/svg?seed=' + (currentUser?.email || 'default') + '")'
              }}
            />
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <label htmlFor="profile-picture" className="cursor-pointer">
            <input
              id="profile-picture"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button type="button" variant="outline" className="text-primary" disabled={uploadingImage}>
              <span className="material-symbols-outlined mr-2">photo_camera</span>
              {uploadingImage ? 'Uploading...' : 'Change Photo'}
            </Button>
          </label>
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
            onClick={handleSave}
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
