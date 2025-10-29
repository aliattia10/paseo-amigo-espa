import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const NewProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeRole, setActiveRole] = useState<'sitter' | 'owner'>('sitter');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [pets, setPets] = useState<Array<{ id: string; name: string; breed: string; age: string; image_url: string; pet_type: 'dog' | 'cat' }>>([]);
  const [loadingPets, setLoadingPets] = useState(true);

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
          throw new Error('Storage bucket not configured. Please run: database/fix_profile_storage.sql');
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
        description: 'Profile picture updated successfully',
      });

      // Reload page to show new image
      window.location.reload();
    } catch (error: any) {
      console.error('Image upload error:', error);
      toast({
        title: t('common.error'),
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

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root overflow-x-hidden bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/80 dark:bg-background-dark/80 p-4 pb-2 justify-between backdrop-blur-sm">
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
      <main className="flex-1 pb-24">
        {/* Profile Header */}
        <div className="px-4 pt-4">
          {/* Name and Info */}
          <div className="flex flex-col items-center justify-center text-center mb-3">
            <p className="text-[22px] font-bold leading-tight tracking-[-0.015em] text-text-primary-light dark:text-text-primary-dark">
              {userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
            </p>
            <p className="text-text-secondary-light dark:text-text-secondary-dark text-base font-normal leading-normal">
              {userProfile?.city || 'Location not set'}
            </p>
            <div className="mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                star
              </span>
              <p className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">4.8</p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark text-base">(32 reviews)</p>
            </div>
          </div>

          {/* Photo Gallery - Super Compact */}
          <div className="mb-1.5">
            <h3 className="text-[8px] font-medium text-text-secondary-light dark:text-text-secondary-dark mb-0.5 uppercase tracking-wider opacity-70">
              Photos
            </h3>
            <div className="grid grid-cols-6 gap-0.5">
              {(() => {
                try {
                  let photoArray = [];
                  if (typeof userProfile?.profileImage === 'string') {
                    photoArray = JSON.parse(userProfile.profileImage);
                  } else if (Array.isArray(userProfile?.profileImage)) {
                    photoArray = userProfile.profileImage;
                  }
                  photoArray = photoArray.filter(p => p).slice(0, 6);
                  
                  return Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="relative aspect-square">
                      {photoArray[index] ? (
                        <div className="relative w-full h-full rounded-sm overflow-hidden bg-gray-200 dark:bg-gray-800">
                          <img
                            src={photoArray[index]}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {index === 0 && (
                            <div className="absolute bottom-0 left-0 bg-primary text-white text-[6px] font-bold px-0.5 py-0.5 rounded-br">
                              1
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="w-full h-full rounded-sm border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-30"></div>
                      )}
                    </div>
                  ));
                } catch {
                  return Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="relative aspect-square">
                      <div className="w-full h-full rounded-sm border border-dashed border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-30"></div>
                    </div>
                  ));
                }
              })()}
            </div>
          </div>

          <div className="flex w-full max-w-[480px] gap-3">
            <button 
              onClick={() => navigate('/profile/edit')}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary/20 dark:bg-primary/30 text-primary text-sm font-bold leading-normal tracking-[0.015em] flex-1"
            >
              <span className="truncate">{t('dashboard.editProfile')}</span>
            </button>
            <button 
              onClick={() => {
                // TODO: Navigate to public profile view
                toast({
                  title: 'Coming Soon',
                  description: 'Public profile view will be available soon!',
                });
              }}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] flex-1"
            >
              <span className="truncate">View Public Profile</span>
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
              <span className="truncate">Sitter</span>
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
              <span className="truncate">Owner</span>
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
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">My Pets</h3>
                <button 
                  onClick={() => navigate('/pet-profile-setup')}
                  className="text-primary font-bold text-sm flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add Pet
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
                            {pet.breed || 'Mixed'} • {pet.age}
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
                    Add your pet's profile to find the perfect sitter
                  </p>
                )}
              </div>
            </div>
          )}

          {/* My Availability Card */}
          {activeRole === 'sitter' && (
            <div className="rounded-xl bg-card-light dark:bg-card-dark p-4 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">My Availability</h3>
                <button 
                  onClick={() => navigate('/availability')}
                  className="text-primary font-bold text-sm"
                >
                  Manage
                </button>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((day, index) => (
                  <div key={day} className={`flex flex-col items-center ${index === 2 ? 'p-2 rounded-full bg-primary/20 dark:bg-primary/30' : ''}`}>
                    <p className={`text-xs ${index === 2 ? 'text-primary' : 'text-text-secondary-light dark:text-text-secondary-dark'}`}>{day}</p>
                    <p className={`font-bold text-lg ${index === 2 ? 'text-primary' : 'text-text-primary-light dark:text-text-primary-dark'}`}>
                      {18 + index}
                    </p>
                  </div>
                ))}
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
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">My Bookings</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/profile/edit')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">person</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Personal Info</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">payment</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Payment Methods</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
              <li 
                onClick={() => navigate('/notifications')}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-background-light dark:hover:bg-background-dark"
              >
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">notifications</span>
                  <span className="font-medium text-text-primary-light dark:text-text-primary-dark">Notifications</span>
                </div>
                <span className="material-symbols-outlined text-text-secondary-light dark:text-text-secondary-dark">chevron_right</span>
              </li>
            </ul>
          </div>

          {/* Booking History */}
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-1 text-text-primary-light dark:text-text-primary-dark">
            Booking History
          </h2>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 rounded-xl bg-card-light dark:bg-card-dark p-2 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=200')" }} />
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">Walk with Max</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">With Jane Smith</p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">June 15 - June 16, 2024</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-[10px] font-bold text-green-500 bg-green-500/10 px-1.5 py-0.5 rounded-full">Completed</span>
              </div>
            </div>
          </div>

          {/* Reviews */}
          <h2 className="text-[22px] font-bold leading-tight tracking-[-0.015em] pt-5 pb-1 text-text-primary-light dark:text-text-primary-dark">
            Reviews Received
          </h2>
          <div className="rounded-xl bg-card-light dark:bg-card-dark p-3 shadow-sm">
            <div className="flex items-start gap-2">
              <div className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0" style={{ backgroundImage: "url('https://api.dicebear.com/7.x/avataaars/svg?seed=Jane')" }} />
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-text-primary-light dark:text-text-primary-dark">Jane Smith</p>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} className="material-symbols-outlined text-secondary text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                        star
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark mt-1">
                  "Alex was absolutely amazing with Max! He came back happy and tired. Highly recommend!"
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card-light/90 dark:bg-card-dark/90 border-t border-border-light dark:border-border-dark backdrop-blur-sm">
        <div className="flex justify-around items-center h-16 px-4">
          <button onClick={() => navigate('/dashboard')} className="flex flex-col items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
            <span className="material-symbols-outlined text-2xl">home</span>
            <span className="text-xs font-medium">Home</span>
          </button>
          <button onClick={() => navigate('/messages')} className="flex flex-col items-center justify-center text-text-secondary-light dark:text-text-secondary-dark">
            <span className="material-symbols-outlined text-2xl">chat_bubble</span>
            <span className="text-xs font-medium">Messages</span>
          </button>
          <button className="flex flex-col items-center justify-center text-primary">
            <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>person</span>
            <span className="text-xs font-bold">Profile</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default NewProfilePage;
