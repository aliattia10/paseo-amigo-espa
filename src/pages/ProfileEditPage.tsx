import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import TinderPhotoGallery from '@/components/profile/TinderPhotoGallery';
import i18n from '@/lib/i18n';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ProfileEditPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<{
    name: string;
    phone: string;
    city: string;
    postalCode: string;
    bio: string;
    profilePictureUrl: string;
    hourlyRate: number | '';
    hasPetExperience: boolean;
    experienceDescription: string;
    petsCaredFor: number | '';
    sitterAge: number | '';
  }>({
    name: userProfile?.name || '',
    phone: userProfile?.phone || '',
    city: userProfile?.city || '',
    postalCode: userProfile?.postalCode || '',
    bio: userProfile?.bio || '',
    profilePictureUrl: userProfile?.profileImage || '',
    hourlyRate: (userProfile?.hourlyRate as number | undefined) ?? 15,
    hasPetExperience: Boolean((userProfile as any)?.hasPetExperience),
    experienceDescription: ((userProfile as any)?.experienceDescription as string | undefined) ?? '',
    petsCaredFor: ((userProfile as any)?.petsCaredFor as number | undefined) ?? 0,
    sitterAge: ((userProfile as any)?.sitterAge as number | undefined) ?? 18,
  });
  
  // Tinder-style multiple photos (max 6)
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
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
        hourlyRate: (userProfile.hourlyRate as number | undefined) ?? 15,
        hasPetExperience: Boolean((userProfile as any)?.hasPetExperience),
        experienceDescription: ((userProfile as any)?.experienceDescription as string | undefined) ?? '',
        petsCaredFor: ((userProfile as any)?.petsCaredFor as number | undefined) ?? 0,
        sitterAge: ((userProfile as any)?.sitterAge as number | undefined) ?? 18,
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

  const showPrompt = React.useMemo(() => new URLSearchParams(location.search).get('prompt') === 'complete', [location.search]);

  const handleImageUpload = async (file: File, index: number) => {
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

      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file');
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('Image must be less than 5MB');
      }

      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError || !buckets?.some((b) => b.name === 'avatars')) {
        throw new Error('Storage bucket not configured. Please contact support.');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${currentUser.id}/photo-${index}-${Date.now()}.${fileExt}`;

      if (photos[index]) {
        const oldPath = photos[index].split('/').slice(-2).join('/');
        await supabase.storage.from('avatars').remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (uploadError) {
        if (uploadError.message.includes('not found') || uploadError.message.includes('bucket')) {
          throw new Error('Storage not configured. Please contact support.');
        }
        if (uploadError.message.includes('policy') || uploadError.message.includes('permission')) {
          throw new Error('Upload permission denied.');
        }
        throw new Error('Upload failed. Please try again.');
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('avatars').getPublicUrl(fileName);

      const newPhotos = [...photos];
      newPhotos[index] = publicUrl;
      setPhotos(newPhotos);

      const photosJson = JSON.stringify(newPhotos.filter((p) => p));
      const { error: updateError } = await supabase
        .from('users')
        .update({
          profile_image: photosJson,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id)
        .select();

      if (updateError) {
        throw new Error('Failed to update profile picture.');
      }

      setFormData({ ...formData, profilePictureUrl: newPhotos[0] || publicUrl });
      await refreshUserProfile();

      toast({
        title: 'Success!',
        description: `Photo ${index + 1} uploaded successfully`,
      });
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error('Image upload error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to upload image';
      toast({ title: 'Upload Failed', description: msg, variant: 'destructive' });
    } finally {
      setUploadingImage(false);
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
    if (userProfile?.userType !== 'owner') {
      const rate = typeof formData.hourlyRate === 'number' ? formData.hourlyRate : NaN;
      if (!Number.isFinite(rate) || rate < 5 || rate > 500) {
        toast({
          title: 'Invalid hourly rate',
          description: 'Hourly rate must be between €5 and €500.',
          variant: 'destructive',
        });
        return;
      }
      const age = typeof formData.sitterAge === 'number' ? formData.sitterAge : NaN;
      if (!Number.isFinite(age) || age < 18 || age > 90) {
        toast({
          title: 'Invalid age',
          description: 'Sitter age must be between 18 and 90.',
          variant: 'destructive',
        });
        return;
      }
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
      if (typeof formData.hourlyRate === 'number' && formData.hourlyRate > 0) {
        updateData.hourly_rate = formData.hourlyRate;
      }
      if (userProfile?.userType !== 'owner') {
        updateData.has_pet_experience = Boolean(formData.hasPetExperience);
        updateData.experience_description = formData.hasPetExperience
          ? (formData.experienceDescription || '').trim().slice(0, 200) || null
          : null;
        updateData.pets_cared_for = Math.max(0, Number(formData.petsCaredFor || 0));
        updateData.sitter_age = Math.max(18, Number(formData.sitterAge || 18));
      }

      // Save photos array as JSON
      if (photos.filter(p => p).length > 0) {
        updateData.profile_image = JSON.stringify(photos.filter(p => p));
      } else if (formData.profilePictureUrl) {
        updateData.profile_image = formData.profilePictureUrl;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        throw new Error('No active session. Please log in again.');
      }
      const userId = session.user.id;

      // Retry the update while stripping optional columns that the DB
      // schema cache may not yet have (migrations not yet applied).
      const OPTIONAL_COLUMNS = [
        'sitter_age',
        'has_pet_experience',
        'experience_description',
        'pets_cared_for',
        'years_experience',
      ];
      let payload: Record<string, unknown> = { ...updateData };
      let data: unknown[] | null = null;
      let error: { message?: string; code?: string } | null = null;
      for (let attempts = 0; attempts < 6; attempts++) {
        const res = await supabase.from('users').update(payload).eq('id', userId).select();
        data = res.data;
        error = res.error;
        if (!error) break;
        const msg = error.message || '';
        // Detect a missing column and drop it, then retry.
        const match = msg.match(/Could not find the '([^']+)' column/);
        const droppedField = match?.[1];
        if (droppedField && droppedField in payload) {
          const { [droppedField]: _removed, ...rest } = payload;
          payload = rest;
          continue;
        }
        if (error.code === 'PGRST204' && OPTIONAL_COLUMNS.some((c) => c in payload)) {
          const next: Record<string, unknown> = { ...payload };
          for (const c of OPTIONAL_COLUMNS) delete next[c];
          payload = next;
          continue;
        }
        break;
      }

      if (error) {
        const msg = error.message || '';
        if (/does not exist|not find/i.test(msg)) {
          throw new Error('Database not set up. Please contact support.');
        }
        if (/permission|denied|policy/i.test(msg)) {
          throw new Error('Permission denied. Please contact support.');
        }
        if (/violates/i.test(msg)) {
          throw new Error('Invalid data. Please check all fields and try again.');
        }
        throw new Error('Could not save profile. Please try again.');
      }

      if (!data || data.length === 0) {
        throw new Error('Update was blocked. Please refresh and try again.');
      }

      await refreshUserProfile();

      toast({
        title: '✓ Saved!',
        description: 'Your profile has been updated',
      });

      navigate('/profile', { replace: true });
    } catch (error: unknown) {
      if (import.meta.env.DEV) console.error('Save error:', error);
      const msg = error instanceof Error ? error.message : 'Failed to update profile.';
      toast({ title: 'Save Failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Call handleSave when form is submitted
    handleSave();
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'You must be logged in to delete your account.',
        variant: 'destructive',
      });
      return;
    }

    if (deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      toast({
        title: 'Confirmation required',
        description: 'Type DELETE to confirm account removal.',
        variant: 'destructive',
      });
      return;
    }

    setDeletingAccount(true);
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.functions.invoke('delete-account');

      if (error) {
        throw new Error(error.message || 'Could not delete account');
      }

      // Clear local session and return to the public landing page.
      await supabase.auth.signOut({ scope: 'local' });
      setDeleteDialogOpen(false);
      toast({
        title: 'Account deleted',
        description: 'Your profile and account have been removed.',
      });
      window.location.href = '/home';
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not delete account';
      toast({
        title: 'Delete failed',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setDeletingAccount(false);
    }
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
          {t('profile.editProfile', 'Edit Profile')}
        </h2>
        <button
          onClick={() => {
            const languages = ['en', 'es', 'fr'];
            const currentIndex = languages.indexOf(i18n.language);
            const nextIndex = (currentIndex + 1) % languages.length;
            i18n.changeLanguage(languages[nextIndex]);
          }}
          className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {i18n.language === 'en' ? 'EN' : i18n.language === 'es' ? 'ES' : 'FR'}
        </button>
      </div>

      {/* Main Content - Scrollable */}
      <main className="flex-1 overflow-y-auto pb-20">
        {showPrompt && (
          <div className="m-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 p-3 text-sm text-yellow-900 dark:text-yellow-200">
            Please add at least one photo and complete your basic info.
            If you are a sitter, set your hourly rate and availability to appear in search.
          </div>
        )}
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
            {t('profile.aboutMe')}
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
                  Hourly Rate (€/hr)
                </label>
                <Input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, hourlyRate: v === '' ? '' : Number(v) });
                  }}
                  className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                  placeholder="15"
                  min="5"
                  max="500"
                  step="1"
                  inputMode="numeric"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Set your base hourly rate (€5-€500)
                </p>
              </div>
            )}
            {userProfile?.userType !== 'owner' && (
              <>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('sitter.age', 'Age')}
                  </label>
                  <Input
                    type="number"
                    value={formData.sitterAge}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, sitterAge: v === '' ? '' : Number(v) });
                    }}
                    className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    min="18"
                    max="90"
                    placeholder="18"
                    inputMode="numeric"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('sitter.experienceQuestion', 'Have you had experience sitting pets?')}
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="inline-flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.hasPetExperience}
                        onChange={(e) => setFormData({ ...formData, hasPetExperience: e.target.checked })}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {t('sitter.experienceYes', 'Yes, I have experience')}
                    </label>
                  </div>
                  {formData.hasPetExperience && (
                    <div className="mt-2">
                      <Input
                        type="text"
                        value={formData.experienceDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, experienceDescription: e.target.value.slice(0, 200) })
                        }
                        className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                        placeholder={t('sitter.experiencePlaceholder', 'e.g. 6 months, 2 years, since I was a kid')}
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {formData.experienceDescription.length}/200
                      </p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {t('sitter.petsCaredFor', 'Pets cared for')}
                  </label>
                  <Input
                    type="number"
                    value={formData.petsCaredFor}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, petsCaredFor: v === '' ? '' : Math.max(0, Number(v)) });
                    }}
                    className="w-full bg-white dark:bg-[#2a2a2a] border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white"
                    min="0"
                    max="10000"
                    placeholder="0"
                    inputMode="numeric"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Tinder-style Danger Zone */}
        <div className="bg-white dark:bg-[#1a1a1a] p-4 mb-4">
          <h3 className="text-base font-semibold text-red-600 mb-1">Delete Account</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            This is permanent and cannot be undone.
          </p>
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                Delete my profile
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete your profile?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will permanently remove your account, profile, photos, and related data.
                  To confirm, type <strong>DELETE</strong> below.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="py-1">
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="Type DELETE"
                  className="w-full"
                />
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deletingAccount}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={deletingAccount}
                  onClick={(e) => {
                    e.preventDefault();
                    void handleDeleteAccount();
                  }}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deletingAccount ? 'Deleting...' : 'Delete account'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
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
