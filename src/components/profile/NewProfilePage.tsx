import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import i18n from '@/lib/i18n';

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
  const { currentUser, userProfile, refreshUserProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
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
  const [pets, setPets] = useState<Array<{ id: string; name: string; breed: string; age: string; image_url: string; pet_type: 'dog' | 'cat' }>>([]);
  const [loadingPets, setLoadingPets] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  // Refresh profile data when component mounts or when returning from edit
  useEffect(() => {
    if (currentUser) {
      refreshUserProfile();
    }
  }, [currentUser]);

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
    navigate('/auth?mode=login');
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

  // Load user's pets
  React.useEffect(() => {
    const fetchPets = async () => {
      if (!currentUser || activeRole !== 'owner') {
        setLoadingPets(false);
        return;
      }
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('pets')
          .select('id, name, breed, age, image_url, pet_type')
          .eq('owner_id', currentUser.id);

        if (error) {
          // If table doesn't exist, try dogs table
          if (error.message.includes('does not exist')) {
            const { data: dogsData, error: dogsError } = await supabase
              .from('dogs')
              .select('id, name, breed, age, image_url')
              .eq('owner_id', currentUser.id);
            
            if (!dogsError && dogsData) {
              setPets(dogsData.map(dog => ({ ...dog, pet_type: 'dog' as const })));
            }
          }
        } else {
          setPets((data || []).map(pet => ({
            ...pet,
            pet_type: (pet.pet_type as 'cat' | 'dog') || 'dog'
          })));
        }
      } catch (error) {
        console.error('Error fetching pets:', error);
      } finally {
        setLoadingPets(false);
      }
    };

    fetchPets();
  }, [currentUser, activeRole]);

  // Load booking history
  useEffect(() => {
    const fetchBookings = async () => {
      if (!currentUser) {
        setLoadingBookings(false);
        return;
      }
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            sitter:users!bookings_sitter_id_fkey(name),
            owner:users!bookings_owner_id_fkey(name),
            pet:pets(name)
          `)
          .or(`owner_id.eq.${currentUser.id},sitter_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          // Table doesn't exist or other error - show empty state
          if (error.message.includes('does not exist') || error.message.includes('not find')) {
            setBookings([]);
            setLoadingBookings(false);
            return;
          }
          throw error;
        }
        
        const formattedBookings = data?.map((booking: any) => ({
          id: booking.id,
          sitter_name: booking.sitter?.name,
          owner_name: booking.owner?.name,
          pet_name: booking.pet?.name,
          start_time: booking.start_time,
          end_time: booking.end_time,
          status: booking.status,
          service_type: booking.service_type
        })) || [];

        setBookings(formattedBookings);
      } catch (error) {
        console.error('Error fetching bookings:', error);
        setBookings([]);
      } finally {
        setLoadingBookings(false);
      }
    };

    fetchBookings();
  }, [currentUser]);

  // Load reviews
  useEffect(() => {
    const fetchReviews = async () => {
      if (!currentUser) {
        setLoadingReviews(false);
        return;
      }
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:users!reviews_reviewer_id_fkey(name, profile_image)
          `)
          .eq('reviewed_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          // Table doesn't exist or other error - show empty state
          if (error.message.includes('does not exist') || error.message.includes('not find')) {
            setReviews([]);
            setLoadingReviews(false);
            return;
          }
          throw error;
        }
        
        const formattedReviews = data?.map((review: any) => ({
          id: review.id,
          reviewer_name: review.reviewer?.name,
          reviewer_image: review.reviewer?.profile_image,
          rating: review.rating,
          comment: review.comment,
          created_at: review.created_at
        })) || [];

        setReviews(formattedReviews);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        setReviews([]);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

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
        <div className="flex gap-2 items-center justify-end">
          <button
            onClick={() => {
              const languages = ['en', 'es', 'fr'];
              const currentIndex = languages.indexOf(i18n.language);
              const nextIndex = (currentIndex + 1) % languages.length;
              i18n.changeLanguage(languages[nextIndex]);
            }}
            className="px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-xs font-medium text-gray-700 dark:text-gray-300"
            title="Change language"
          >
            {i18n.language === 'en' ? 'ES' : i18n.language === 'es' ? 'FR' : 'EN'}
          </button>
          <button onClick={() => navigate('/notifications')} className="relative">
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
              notifications
            </span>
            {/* Notification badge - only show if there are unread notifications */}
            {/* <span className="absolute top-0 right-0 h-2 w-2 bg-primary rounded-full"></span> */}
          </button>
          <button onClick={handleLogout}>
            <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
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
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center border-4 border-primary/20 dark:border-primary/30 shadow-xl">
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
                    // Navigate to first pet's edit page (which shows full profile)
                    navigate(`/pet/${pets[0].id}/edit`);
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
                    // Parse image URL - support both JSON array and single URL
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
                      <div key={pet.id} className="flex items-center gap-2 p-2 rounded-lg bg-background-light dark:bg-background-dark">
                        <div 
                          className="w-12 h-12 rounded-full bg-cover bg-center border border-primary/20 flex-shrink-0"
                          style={{ 
                            backgroundImage: imageUrl 
                              ? `url('${imageUrl}')` 
                              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark truncate">
                            {pet.pet_type === 'cat' ? '🐱' : '🐶'} {pet.name}
                          </p>
                          <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark truncate">
                            {pet.breed || t('profile.mixed')} • {pet.age}
                          </p>
                        </div>
                        <button 
                          onClick={() => navigate(`/pet/${pet.id}/edit`)}
                          className="text-text-secondary-light dark:text-text-secondary-dark hover:text-primary transition-colors flex-shrink-0"
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
                        <p className={`text-xs ${isToday ? 'text-primary font-bold' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>
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
                onClick={() => navigate('/profile/edit')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">person</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">{t('profile.personalInfo')}</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/payout-setup')}
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
                      booking.status === 'completed' ? 'text-green-500 bg-green-500/10' :
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

      {/* Bottom Navigation - Mobile Style */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-10 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 w-full max-w-md">
        <div className="flex justify-around items-center h-16 px-2">
          <button 
            onClick={() => navigate('/dashboard')} 
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-xs font-medium mt-0.5">Home</span>
          </button>
          
          <button 
            onClick={() => navigate('/messages')} 
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            <span className="text-xs font-medium mt-0.5">Messages</span>
          </button>
          
          <button 
            onClick={() => navigate('/bookings')} 
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">event</span>
            <span className="text-xs font-medium mt-0.5">Bookings</span>
          </button>
          
          <button 
            onClick={() => navigate('/notifications')} 
            className="flex flex-col items-center justify-center flex-1 py-2 text-gray-500 dark:text-gray-400 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">notifications</span>
            <span className="text-xs font-medium mt-0.5">Notifications</span>
          </button>
          
          <button 
            className="flex flex-col items-center justify-center flex-1 py-2 text-primary"
          >
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
            <span className="text-xs font-bold mt-0.5">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default NewProfilePage;
