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
    hourlyRate: (userProfile as any)?.hourly_rate || 15,
  });
  
  // Tinder-style multiple photos (max 6)
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
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
        hourlyRate: (userProfile as any)?.hourly_rate || 15,
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
      await handleImageUpload(file, 0); // Upload to first slot
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

      // Add hourly rate for sitters
      if (formData.hourlyRate) {
        updateData.hourly_rate = formData.hourlyRate;
      }

      // Save photos array as JSON
      if (photos.filter(p => p).length > 0) {
        updateData.profile_image = JSON.stringify(photos.filter(p => p));
      } else if (formData.profilePictureUrl) {
        updateData.profile_image = formData.profilePictureUrl;
      }

      console.log('Updating profile with data:', updateData);
      console.log('User ID:', currentUser.id);

      // Use returning minimal to avoid RLS select issues; rely on no error for success
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', currentUser.id);

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

      console.log('Profile updated successfully');

      // Refresh the user profile in auth context
      console.log('Refreshing user profile...');
      await refreshUserProfile();
      console.log('User profile refreshed');

      toast({
        title: '✓ Saved!',
        description: 'Your profile has been updated',
      });

      // Navigate back immediately after refresh completes
      console.log('Navigating back to profile...');
      navigate('/profile', { replace: true });
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
    <div className="relative flex h-screen w-full flex-col bg-[#f8f8f8] dark:bg-[#1a1a1a] max-w-md mx-auto overflow-hidden">
      {/* Top App Bar - Tinder Style */}
      <div className="flex items-center justify-between p-4 bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800">
        <button 
          type="button" 
          onClick={(e) => {
            e.preventDefault();
            navigate('/profile');
          }}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          <span className="material-symbols-outlined text-gray-700 dark:text-gray-300 text-2xl">
            arrow_back
          </span>
        </button>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Edit Profile
        </h2>
        <div className="w-10"></div>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {/* Photos Section */}
        <div className="bg-white dark:bg-[#1a1a1a] p-4 mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Photos
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Add up to 6 photos
          </p>
          <TinderPhotoGallery
            photos={photos}
            onPhotosChange={async (newPhotos) => {
              setPhotos(newPhotos);
              try {
                const { supabase } = await import('@/integrations/supabase/client');
                const photosJson = JSON.stringify(newPhotos.filter(p => p));
                await supabase
                  .from('users')
                  .update({ profile_image: photosJson })
                  .eq('id', currentUser!.id);
                await refreshUserProfile();
                toast({
                  title: 'Photos updated',
                  description: 'Your photos have been saved',
                });
              } catch (error) {
                console.error('Failed to update photos:', error);
                toast({
                  title: 'Error',
                  description: 'Failed to update photos',
                  variant: 'destructive',
                });
              }
            }}
            maxPhotos={MAX_PHOTOS}
          />
        </div>

        {/* About Me Section */}
        <div className="bg-white dark:bg-[#1a1a1a] p-4 mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            About Me
          </h3>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full min-h-[120px] p-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder="Share a little about yourself..."
            maxLength={500}
          />
          <p className="text-xs text-gray-400 mt-1 text-right">
            {formData.bio.length}/500
          </p>
        </div>

        {/* Essentials Section */}
        <div className="bg-white dark:bg-[#1a1a1a] p-4 mb-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
            Essentials
          </h3>
          
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Name
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Your name"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Phone
              </label>
              <Input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Your phone number"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                City
              </label>
              <Input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Your city"
              />
            </div>

            {/* Postal Code */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                Postal Code
              </label>
              <Input
                type="text"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                placeholder="Your postal code"
              />
            </div>

            {/* Hourly Rate - For Sitters */}
            {userProfile?.userType !== 'owner' && (
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Hourly Rate ($/hr)
                </label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => setFormData({ ...formData, hourlyRate: parseInt(e.target.value) || 15 })}
                  className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="15"
                  min="10"
                  max="100"
                  step="1"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Set your base hourly rate ($10-$100)
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Save Button at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-[#1a1a1a] border-t border-gray-200 dark:border-gray-800">
        <Button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSave();
          }}
          disabled={loading}
          className="w-full bg-gradient-to-r from-[#FD5564] to-[#FF6B7A] hover:from-[#FD4458] hover:to-[#FF5A6E] text-white h-12 rounded-full font-semibold text-base shadow-lg disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};

export default ProfileEditPage;
