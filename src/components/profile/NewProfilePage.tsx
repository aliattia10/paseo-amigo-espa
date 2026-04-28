import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import i18n from '@/lib/i18n';
import BottomNavigation from '@/components/ui/BottomNavigation';
import PetCard from '@/components/dashboard/PetCard';
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

interface Booking {
  id: string;
  sitter_name?: string;
  owner_name?: string;
  pet_name?: string;
  start_time: string;
  end_time: string;
  status: string;
  service_type: string;
}

interface Review {
  id: string;
  reviewer_name?: string;
  reviewer_image?: string;
  rating: number;
  comment?: string;
  created_at: string;
}

const NewProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile, refreshUserProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  // Initialize activeRole based on user's profile type, defaulting to 'owner' if they have pets
  const [activeRole, setActiveRole] = useState<'sitter' | 'owner'>(() => {
    // If user is a sitter/walker, default to sitter tab
    const userType = userProfile?.userType as string;
    if (userType === 'walker' || userType === 'sitter') {
      return 'sitter';
    }
    // Otherwise default to owner tab
    return 'owner';
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pets, setPets] = useState<Array<{ id: string; name: string; breed: string; age: string; image_url: string; pet_type: 'dog' | 'cat'; mood?: string; personality_tags?: string[] }>>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);

  // Refresh profile data when component mounts or when returning from edit
  useEffect(() => {
    if (currentUser) {
      refreshUserProfile();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      toast({ title: t('common.error'), description: t('dashboard.logoutError'), variant: 'destructive' });
    }
  };

  const handleDeleteAccount = async () => {
    if (!currentUser) {
      toast({
        title: t('common.error'),
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
      if (error) throw new Error(error.message || 'Could not delete account');

      await supabase.auth.signOut({ scope: 'local' });
      setDeleteDialogOpen(false);
      toast({
        title: 'Account deleted',
        description: 'Your profile and account have been removed.',
      });
      window.location.href = '/home';
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Could not delete account';
      toast({ title: 'Delete failed', description: msg, variant: 'destructive' });
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!currentUser) return;
    
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

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        if (uploadError.message.includes('not found')) {
          throw new Error(t('profile.storageBucketError'));
        }
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      const { error: updateError } = await supabase
        .from('users')
        .update({ profile_image: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
      
      toast({
        title: t('common.success'),
        description: t('profile.pictureUpdated'),
      });

      // Reload page to show new image
      window.location.reload();
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: t('common.error'),
        description: error.message || t('profile.uploadFailed'),
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
          description: t('profile.selectImageFile'),
          variant: 'destructive',
        });
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: t('common.error'),
          description: t('profile.imageSizeLimit'),
          variant: 'destructive',
        });
        return;
      }
      
      handleImageUpload(file);
    }
  };

  // Load pets, bookings, reviews all in parallel with 5s timeouts each
  useEffect(() => {
    if (!currentUser) {
      setLoadingPets(false);
      setLoadingBookings(false);
      setLoadingReviews(false);
      return;
    }

    const TIMEOUT_MS = 5000;
    // Cast to Promise<any> because PostgrestFilterBuilder isn't a plain Promise but is awaitable
    const withTimeout = (query: any): Promise<any> =>
      Promise.race([
        Promise.resolve(query),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), TIMEOUT_MS)),
      ]).catch(() => null);

    const fetchPets = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        if (activeRole !== 'owner') { setLoadingPets(false); return; }
        const res = await withTimeout(
          supabase.from('pets').select('id, name, breed, age, image_url, pet_type, mood, personality_tags').eq('owner_id', currentUser.id)
        );
        if (res?.data) {
          setPets(res.data.map((pet: any) => ({ ...pet, pet_type: (pet.pet_type as 'cat' | 'dog') || 'dog' })));
        }
      } catch { /* silent */ } finally { setLoadingPets(false); }
    };

    const fetchBookings = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const res = await withTimeout(
          supabase
            .from('bookings')
            .select('*, sitter:users!bookings_sitter_id_fkey(name), owner:users!bookings_owner_id_fkey(name), pet:pets(name)')
            .or(`owner_id.eq.${currentUser.id},sitter_id.eq.${currentUser.id}`)
            .order('created_at', { ascending: false })
            .limit(5)
        );
        if (res?.data) {
          setBookings(res.data.map((b: any) => ({
            id: b.id,
            sitter_name: b.sitter?.name,
            owner_name: b.owner?.name,
            pet_name: b.pet?.name,
            start_time: b.start_time,
            end_time: b.end_time,
            status: b.status,
            service_type: b.service_type,
          })));
        }
      } catch { /* silent */ } finally { setLoadingBookings(false); }
    };

    const fetchReviews = async () => {
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        let res = await withTimeout(
          supabase
            .from('reviews')
            .select('*, reviewer:users!reviews_reviewer_id_fkey(name, profile_image)')
            .eq('reviewed_id', currentUser.id)
            .order('created_at', { ascending: false })
            .limit(5)
        );

        if (res?.error && /reviewed_id|column/i.test(res.error.message || '')) {
          res = await withTimeout(
            supabase
              .from('reviews')
              .select('*, reviewer:users!reviews_reviewer_id_fkey(name, profile_image)')
              .eq('reviewee_id', currentUser.id)
              .order('created_at', { ascending: false })
              .limit(5)
          );
        }

        if (res?.data) {
          setReviews(res.data.map((r: any) => ({
            id: r.id,
            reviewer_name: r.reviewer?.name,
            reviewer_image: r.reviewer?.profile_image,
            rating: r.rating,
            comment: r.comment,
            created_at: r.created_at,
          })));
        }
      } catch { /* silent */ } finally { setLoadingReviews(false); }
    };

    // Run all three in parallel — total wait = slowest single fetch (max 5s)
    Promise.all([fetchPets(), fetchBookings(), fetchReviews()]);
  }, [currentUser, activeRole]);

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark max-w-md mx-auto">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm max-w-md mx-auto w-full">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <button onClick={() => navigate('/dashboard')}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              arrow_back
            </span>
          </button>
        </div>
        <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center text-text-primary-light dark:text-text-primary-dark">
          {t('nav.profile')}
        </h2>
        <div className="flex gap-1 items-center justify-end">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center rounded-full h-9 w-9 text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title={theme === 'dark' ? t('home.lightMode') : t('home.darkMode')}
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>
          <button
            onClick={() => {
              const languages = ['en', 'es', 'fr'];
              const currentIndex = languages.indexOf(i18n.language);
              const nextIndex = (currentIndex + 1) % languages.length;
              i18n.changeLanguage(languages[nextIndex]);
            }}
            className="flex items-center justify-center rounded-full h-9 px-2 text-xs font-bold text-text-secondary-light dark:text-text-secondary-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Change language"
          >
            {i18n.language.toUpperCase()}
          </button>
          <button onClick={() => navigate('/notifications')} className="relative flex items-center justify-center rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-xl">
              notifications
            </span>
          </button>
          <button onClick={handleLogout} className="flex items-center justify-center rounded-full h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-xl">
              logout
            </span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 pb-20 overflow-y-auto">
        {/* Profile Header - Centered */}
        <div className="flex flex-col items-center justify-center px-4 pt-4 max-w-md mx-auto">
          {/* Name and Info */}
          <div className="flex flex-col items-center justify-center text-center mb-3">
            <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">
              {userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal">
              {userProfile?.city || 'Location not set'}
            </p>
            {(userProfile?.rating || userProfile?.totalWalks) && (
              <div className="mt-1 flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                  star
                </span>
                <p className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
                  {userProfile?.rating ? userProfile.rating.toFixed(1) : '5.0'}
                </p>
                <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">
                  ({userProfile?.totalWalks || reviews.length || 0} {t('profile.reviews')})
                </p>
              </div>
            )}
          </div>

          {/* Profile Avatar - Main Picture Only */}
          <div className="mb-4 w-full flex justify-center">
            {(() => {
              try {
                let photoArray = [];
                if (typeof userProfile?.profileImage === 'string') {
                  photoArray = JSON.parse(userProfile.profileImage);
                } else if (Array.isArray(userProfile?.profileImage)) {
                  photoArray = userProfile.profileImage;
                }
                photoArray = photoArray.filter(p => p);
                
                const mainPhoto = photoArray[0] || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (userProfile?.name || 'User');
                
                return (
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-primary/20 dark:border-primary/30 shadow-xl">
                    <img
                      src={mainPhoto}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                );
              } catch {
                return (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-medium-jungle to-sage-green flex items-center justify-center border-4 border-medium-jungle/20 dark:border-medium-jungle/30 shadow-xl">
                    <span className="material-symbols-outlined text-6xl text-white">
                      person
                    </span>
                  </div>
                );
              }
            })()}
          </div>

          {/* Action Buttons - Centered */}
          <div className="flex w-full gap-3 justify-center mt-3">
            <button 
              onClick={() => {
                // For owners, check if they have pets first
                if (activeRole === 'owner') {
                  if (loadingPets) {
                    // Still loading, wait
                    return;
                  }
                  if (pets.length === 0) {
                    toast({
                      title: t('profile.noPetsYet'),
                      description: t('profile.addPetFirst'),
                      variant: 'default',
                    });
                    // Redirect to add pet page
                    setTimeout(() => navigate('/pet-profile-setup'), 1500);
                  } else {
                    // Navigate to edit first pet's profile
                    navigate(`/pet/${pets[0].id}/edit`);
                  }
                } else {
                  // For sitters, edit their own profile
                  navigate('/profile/edit');
                }
              }}
              disabled={activeRole === 'owner' && loadingPets}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary/20 dark:bg-primary/30 text-primary text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {activeRole === 'owner' ? t('profile.editPetProfile') : t('dashboard.editProfile')}
              </span>
            </button>
            <button 
              onClick={() => {
                // For owners, check if they have pets first
                if (activeRole === 'owner') {
                  if (loadingPets) {
                    // Still loading, wait
                    return;
                  }
                  if (pets.length === 0) {
                    toast({
                      title: t('profile.noPetsYet'),
                      description: t('profile.addPetToView'),
                      variant: 'default',
                    });
                    // Optionally navigate to add pet page
                    setTimeout(() => navigate('/pet-profile-setup'), 1500);
                  } else {
                    // Navigate to first pet's profile view page
                    navigate(`/pet/${pets[0].id}`);
                  }
                } else {
                  // For sitters, show their public profile
                  navigate('/profile/public');
                }
              }}
              disabled={activeRole === 'owner' && loadingPets}
              className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">
                {activeRole === 'owner' ? t('profile.viewPetProfile') : t('profile.viewPublicProfile')}
              </span>
            </button>
          </div>
        </div>

        {/* Segmented Control */}
        <div className="flex px-4 py-3">
          <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-border-light dark:bg-border-dark p-1">
            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal transition-colors ${
              activeRole === 'sitter' 
                ? 'bg-card-light dark:bg-card-dark shadow-sm text-text-primary-light dark:text-text-primary-dark' 
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }`}>
              <span className="truncate">{t('auth.sitter')}</span>
              <input 
                checked={activeRole === 'sitter'} 
                onChange={() => setActiveRole('sitter')}
                className="invisible w-0" 
                type="radio" 
                value="Sitter"
              />
            </label>
            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-md px-2 text-sm font-medium leading-normal transition-colors ${
              activeRole === 'owner' 
                ? 'bg-card-light dark:bg-card-dark shadow-sm text-text-primary-light dark:text-text-primary-dark' 
                : 'text-text-secondary-light dark:text-text-secondary-dark'
            }`}>
              <span className="truncate">{t('profile.owner')}</span>
              <input 
                checked={activeRole === 'owner'} 
                onChange={() => setActiveRole('owner')}
                className="invisible w-0" 
                type="radio" 
                value="Owner"
              />
            </label>
          </div>
        </div>

        {/* Information Cards/Sections */}
        <div className="flex flex-col gap-4 px-4">
          {/* My Pets Section - Only for owners */}
          {activeRole === 'owner' && (
            <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{t('profile.myPets')}</h3>
                <button 
                  onClick={() => navigate('/pet-profile-setup')}
                  className="text-primary font-bold text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  {t('profile.addPet')}
                </button>
              </div>
              <div className="flex flex-col gap-3">
                {loadingPets ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  </div>
                ) : pets.length > 0 ? (
                  pets.map((pet) => {
                    let imageUrl = '';
                    if (pet.image_url) {
                      try {
                        const parsed = JSON.parse(pet.image_url);
                        imageUrl = Array.isArray(parsed) ? parsed[0] : pet.image_url;
                      } catch {
                        imageUrl = pet.image_url;
                      }
                    }
                    return (
                      <div key={pet.id} className="relative">
                        <PetCard
                          name={pet.name}
                          breed={pet.breed || undefined}
                          imageUrl={imageUrl || undefined}
                          mood={pet.mood || undefined}
                          personalityTags={Array.isArray(pet.personality_tags) ? pet.personality_tags : undefined}
                          onMoodClick={() => navigate(`/pet/${pet.id}/edit`)}
                        />
                        <button
                          onClick={() => navigate(`/pet/${pet.id}/edit`)}
                          className="absolute top-3 left-3 rounded-full bg-black/40 hover:bg-black/60 text-white p-2 transition-colors z-10"
                          aria-label={t('common.edit')}
                        >
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-2">
                    {t('profile.addPetToFindSitter')}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* My Availability Card */}
          {activeRole === 'sitter' && (
            <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark mb-3">Sitter details</h3>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-background-light dark:bg-background-dark p-2">
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Age</p>
                  <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{(userProfile as any)?.sitterAge ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-background-light dark:bg-background-dark p-2">
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Experience</p>
                  <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{(userProfile as any)?.yearsExperience ?? 0}y</p>
                </div>
                <div className="rounded-lg bg-background-light dark:bg-background-dark p-2">
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">Pets cared</p>
                  <p className="font-bold text-text-primary-light dark:text-text-primary-dark">{(userProfile as any)?.petsCaredFor ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          {activeRole === 'sitter' && (
            <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">{t('profile.myAvailability')}</h3>
                <button 
                  onClick={() => navigate('/availability')}
                  className="text-primary font-bold text-sm"
                >
                  {t('profile.manage')}
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {(() => {
                  const today = new Date();
                  const days = [
                    t('profile.days.sun'),
                    t('profile.days.mon'),
                    t('profile.days.tue'),
                    t('profile.days.wed'),
                    t('profile.days.thu'),
                    t('profile.days.fri'),
                    t('profile.days.sat')
                  ];
                  const nextSevenDays = Array.from({ length: 7 }, (_, i) => {
                    const date = new Date(today);
                    date.setDate(today.getDate() + i);
                    return date;
                  });
                  
                  return nextSevenDays.map((date, index) => {
                    const isToday = index === 0;
                    const dayName = days[date.getDay()];
                    const dayNumber = date.getDate();
                    
                    return (
                      <div key={index} className={`flex flex-col items-center ${isToday ? 'p-2 rounded-full bg-primary/20 dark:bg-primary/30' : ''}`}>
                        <p className={`text-[10px] ${isToday ? 'text-primary font-bold' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
                          {isToday ? t('profile.today') : dayName}
                        </p>
                        <p className={`font-bold text-lg ${isToday ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                          {dayNumber}
                        </p>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {/* Verification Status */}
          {userProfile && userProfile.verified !== true && (
            <div
              onClick={() => navigate('/verify-identity')}
              className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-4 flex items-center gap-3 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400">shield</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-amber-800 dark:text-amber-300">
                  {t('verifyIdentity.pendingTitle', 'Identity verification pending')}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {t('verifyIdentity.pendingDescription', 'Verify to earn trust and get more bookings')}
                </p>
              </div>
              <span className="material-symbols-outlined text-amber-500 shrink-0">chevron_right</span>
            </div>
          )}

          {/* Account Management List */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
            <ul className="divide-y divide-border-light dark:divide-border-dark">
              <li 
                onClick={() => navigate('/bookings')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">event</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t('bookings.myBookings')}</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/profile/personal-info')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">person</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t('profile.personalInfo')}</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/payout-methods')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">payment</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t('profile.paymentMethods')}</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/notifications')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">notifications</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t('notifications.title')}</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
            </ul>
          </div>

          {/* Settings */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden">
            <ul className="divide-y divide-border-light dark:divide-border-dark">
              <li className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">
                    {theme === 'dark' ? 'dark_mode' : 'light_mode'}
                  </span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                    {t('settings.darkMode', 'Dark Mode')}
                  </span>
                </div>
                <button
                  onClick={toggleTheme}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    theme === 'dark' ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
                    theme === 'dark' ? 'translate-x-[22px]' : 'translate-x-0.5'
                  }`} />
                </button>
              </li>
              <li
                onClick={() => navigate('/verify-identity')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">verified_user</span>
                  <div>
                    <span className="font-medium text-text-primary-light dark:text-text-primary-dark">
                      {t('settings.verification', 'Identity Verification')}
                    </span>
                    {userProfile?.verified ? (
                      <p className="text-xs text-green-500 font-medium">{t('settings.verified', 'Verified')}</p>
                    ) : (
                      <p className="text-xs text-amber-500 font-medium">{t('settings.pending', 'Pending')}</p>
                    )}
                  </div>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
            </ul>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl bg-card-light dark:bg-card-dark shadow-sm overflow-hidden border border-red-200 dark:border-red-900/50">
            <div className="p-4">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-red-600 dark:text-red-400">delete</span>
                </div>
                <div>
                  <h3 className="font-bold text-red-600 dark:text-red-400">Delete Account</h3>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    Permanently remove your profile, photos, bookings, and account access.
                  </p>
                </div>
              </div>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <button
                    type="button"
                    className="w-full rounded-lg border border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 h-10 text-sm font-bold"
                  >
                    Delete my account
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="max-w-[92vw] rounded-2xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action is permanent and cannot be undone. To confirm, type{' '}
                      <strong>DELETE</strong> below.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <input
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type DELETE"
                    className="w-full rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-sm"
                  />
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
          </div>

          {/* Booking History */}
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-1 text-text-primary-light dark:text-text-primary-dark">
            {t('profile.bookingHistory')}
          </h2>
          <div className="flex flex-col gap-2">
            {loadingBookings ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : bookings.length > 0 ? (
              bookings.map((booking) => (
                <div key={booking.id} className="flex items-center gap-2 rounded-xl bg-card-light dark:bg-card-dark p-2 shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-primary">calendar_today</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark capitalize">
                      {booking.service_type === 'walk' ? `🚶 ${t('profile.walk')}` : `🏠 ${t('profile.care')}`} {booking.pet_name ? t('profile.withPet', { petName: booking.pet_name }) : ''}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      With {booking.sitter_name || booking.owner_name || 'User'}
                    </p>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {new Date(booking.start_time).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      booking.status === 'completed' ? 'text-medium-jungle bg-medium-jungle/10' :
                      booking.status === 'accepted' ? 'text-blue-500 bg-blue-500/10' :
                      booking.status === 'pending' ? 'text-yellow-500 bg-yellow-500/10' :
                      'text-gray-500 bg-gray-500/10'
                    }`}>
                      {t(`profile.status.${booking.status}`)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 bg-card-light dark:bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">calendar_month</span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {t('profile.noBookingsYet')}
                </p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-1 text-text-primary-light dark:text-text-primary-dark">
            {t('profile.reviewsReceived')}
          </h2>
          <div className="flex flex-col gap-3">
            {loadingReviews ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((review) => {
                // Parse reviewer image if it's a JSON array
                let reviewerImageUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (review.reviewer_name || 'User');
                try {
                  if (review.reviewer_image) {
                    const parsed = JSON.parse(review.reviewer_image);
                    reviewerImageUrl = Array.isArray(parsed) ? parsed[0] : review.reviewer_image;
                  }
                } catch {
                  reviewerImageUrl = review.reviewer_image || reviewerImageUrl;
                }

                return (
                  <div key={review.id} className="rounded-xl bg-card-light dark:bg-card-dark p-3 shadow-sm">
                    <div className="flex items-start gap-2">
                      <div 
                        className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0" 
                        style={{ backgroundImage: `url('${reviewerImageUrl}')` }} 
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <p className="font-bold text-text-primary-light dark:text-text-primary-dark">
                            {review.reviewer_name || 'Anonymous'}
                          </p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`material-symbols-outlined text-sm ${
                                  star <= review.rating ? 'text-secondary' : 'text-gray-300 dark:text-gray-600'
                                }`} 
                                style={{ fontVariationSettings: star <= review.rating ? '"FILL" 1' : '"FILL" 0' }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                        {review.comment && (
                          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                            "{review.comment}"
                          </p>
                        )}
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1 opacity-60">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-card-light dark:bg-card-dark rounded-xl">
                <span className="material-symbols-outlined text-5xl text-gray-400 mb-2">rate_review</span>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {t('profile.noReviewsYet')}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation unreadNotifications={unreadNotifications} />
    </div>
  );
};

export default NewProfilePage;
