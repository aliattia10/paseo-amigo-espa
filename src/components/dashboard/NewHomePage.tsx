import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useToast } from '@/hooks/use-toast';
import BottomNavigation from '@/components/ui/BottomNavigation';
import MatchModal from '@/components/ui/MatchModal';
import FiltersModal, { FilterOptions } from '@/components/ui/FiltersModal';
import { playMatchSound, playLikeSound } from '@/lib/sounds';

interface Profile {
  id: string;
  name: string;
  age?: number;
  distance: number;
  rating: number;
  imageUrl: string;
  bio?: string;
  hourlyRate?: number;
  type: 'dog' | 'walker';
}

const NewHomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { location, locationEnabled, isGlobalMode, requestLocation, toggleGlobalMode } = useLocation();
  const { toast } = useToast();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  
  // Dog profiles for sitters to browse
  const dogProfiles: Profile[] = [
    {
      id: '1',
      name: 'Max',
      age: 4,
      distance: 2,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
      type: 'dog',
    },
    {
      id: '2',
      name: 'Luna',
      age: 3,
      distance: 1.5,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
      type: 'dog',
    },
    {
      id: '3',
      name: 'Charlie',
      age: 5,
      distance: 3,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
      type: 'dog',
    },
  ];

  // Walker profiles for dog owners to browse
  const walkerProfiles: Profile[] = [
    {
      id: 'w1',
      name: 'Sarah',
      age: 28,
      distance: 1.2,
      rating: 4.9,
      hourlyRate: 15,
      imageUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800',
      bio: 'Experienced dog walker with 5+ years',
      type: 'walker',
    },
    {
      id: 'w2',
      name: 'Mike',
      age: 32,
      distance: 2.5,
      rating: 4.8,
      hourlyRate: 18,
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
      bio: 'Professional pet care specialist',
      type: 'walker',
    },
    {
      id: 'w3',
      name: 'Emma',
      age: 25,
      distance: 1.8,
      rating: 5.0,
      hourlyRate: 20,
      imageUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800',
      bio: 'Certified dog trainer and walker',
      type: 'walker',
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userRole, setUserRole] = useState<'owner' | 'sitter'>('owner');
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<{ id: string; name: string; imageUrl: string } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    petType: 'all',
    maxDistance: 50,
    minRating: 0,
    maxPrice: null,
    sortBy: 'distance',
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Load saved state from localStorage on mount
  React.useEffect(() => {
    const savedRole = localStorage.getItem('userRole') as 'owner' | 'sitter' | null;
    const savedPassed = localStorage.getItem('passedProfiles');
    const savedLiked = localStorage.getItem('likedProfiles');
    
    if (savedRole) setUserRole(savedRole);
    if (savedPassed) setPassedProfiles(new Set(JSON.parse(savedPassed)));
    if (savedLiked) setLikedProfiles(new Set(JSON.parse(savedLiked)));
    
    // Load saved filters
    const savedFilters = localStorage.getItem('userFilters');
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }
    
    // Show location prompt if not enabled and not in global mode
    if (!locationEnabled && !isGlobalMode) {
      setShowLocationPrompt(true);
    }
  }, []);
  
  // Request location on mount if not in global mode
  React.useEffect(() => {
    if (!locationEnabled && !isGlobalMode && !showLocationPrompt) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [locationEnabled, isGlobalMode]);

  // Count active filters
  React.useEffect(() => {
    let count = 0;
    if (filters.petType !== 'all') count++;
    if (filters.maxDistance !== 50) count++;
    if (filters.minRating > 0) count++;
    if (filters.maxPrice !== null) count++;
    if (filters.sortBy !== 'distance') count++;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleApplyFilters = (newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentIndex(0); // Reset to first profile
    toast({
      title: 'Filters applied',
      description: 'Profiles updated based on your preferences',
    });
  };

  // Apply filters to profiles
  const applyFilters = (profiles: Profile[]) => {
    let filtered = profiles.filter(p => !passedProfiles.has(p.id) && !likedProfiles.has(p.id));

    // Pet type filter (for owners looking at walkers)
    if (userRole === 'owner' && filters.petType !== 'all') {
      // In real implementation, this would check walker's pet preferences
      // For now, we'll keep all profiles
    }

    // Distance filter (only in local mode)
    if (!isGlobalMode && filters.maxDistance) {
      filtered = filtered.filter(p => p.distance <= filters.maxDistance);
    }

    // Rating filter
    if (filters.minRating > 0) {
      filtered = filtered.filter(p => p.rating >= filters.minRating);
    }

    // Price filter
    if (filters.maxPrice && userRole === 'owner') {
      filtered = filtered.filter(p => !p.hourlyRate || p.hourlyRate <= filters.maxPrice!);
    }

    // Sort profiles
    switch (filters.sortBy) {
      case 'distance':
        filtered.sort((a, b) => a.distance - b.distance);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price':
        if (userRole === 'owner') {
          filtered.sort((a, b) => (a.hourlyRate || 0) - (b.hourlyRate || 0));
        }
        break;
      case 'newest':
        // In real implementation, would sort by created_at
        break;
    }

    return filtered;
  };

  // Get profiles based on user role, filtering out passed/liked ones
  const allProfiles = userRole === 'owner' ? walkerProfiles : dogProfiles;
  const profiles = applyFilters(allProfiles);

  // Reset to first available profile when profiles change
  React.useEffect(() => {
    if (profiles.length > 0 && currentIndex >= profiles.length) {
      setCurrentIndex(0);
    }
  }, [profiles.length, currentIndex]);

  // Reset index when switching roles
  const handleRoleChange = (role: 'owner' | 'sitter') => {
    setUserRole(role);
    setCurrentIndex(0);
    localStorage.setItem('userRole', role);
  };

  const navigate = useNavigate();

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    
    if (!currentUser) {
      toast({
        title: 'Error',
        description: 'Please sign in to like profiles',
        variant: 'destructive',
      });
      return;
    }
    
    // Add to liked profiles
    const newLiked = new Set(likedProfiles);
    newLiked.add(profile.id);
    setLikedProfiles(newLiked);
    localStorage.setItem('likedProfiles', JSON.stringify(Array.from(newLiked)));
    
    // Check for match in database
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Call the match function
      const { data: isMatch, error } = await supabase.rpc('check_and_create_match', {
        p_liker_id: currentUser.id,
        p_liked_id: profile.id
      });
      
      if (error && !error.message.includes('does not exist')) {
        console.error('Match check error:', error);
      }
      
      // If it's a match, show the modal
      if (isMatch) {
        playMatchSound(); // Play celebration sound
        setMatchedUser({
          id: profile.id,
          name: profile.name,
          imageUrl: profile.imageUrl
        });
        setShowMatchModal(true);
      } else {
        // No match yet, just show success toast
        playLikeSound(); // Play like sound
        toast({
          title: '❤️ Liked!',
          description: `You liked ${profile.name}`,
        });
      }
    } catch (error) {
      console.error('Error checking match:', error);
      // Still show success even if match check fails
      toast({
        title: '❤️ Liked!',
        description: `You liked ${profile.name}`,
      });
    }
    
    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePass = () => {
    const profile = profiles[currentIndex];
    
    // Add to passed profiles
    const newPassed = new Set(passedProfiles);
    newPassed.add(profile.id);
    setPassedProfiles(newPassed);
    localStorage.setItem('passedProfiles', JSON.stringify(Array.from(newPassed)));
    
    // Move to next profile
    if (currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleInfo = () => {
    // Navigate to profile details
    const profile = profiles[currentIndex];
    console.log('Show info for:', profile);
    // TODO: Navigate to walker profile page
  };

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setDragStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragStart) return;
    const deltaX = e.touches[0].clientX - dragStart.x;
    const deltaY = e.touches[0].clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleTouchEnd = () => {
    if (!dragStart) return;
    
    // If swiped more than 100px, trigger action
    if (Math.abs(dragOffset.x) > 100) {
      if (dragOffset.x > 0) {
        // Swiped right - like
        setSwipeDirection('right');
        setTimeout(() => {
          handleLike();
          setSwipeDirection(null);
          setDragOffset({ x: 0, y: 0 });
        }, 300);
      } else {
        // Swiped left - pass
        setSwipeDirection('left');
        setTimeout(() => {
          handlePass();
          setSwipeDirection(null);
          setDragOffset({ x: 0, y: 0 });
        }, 300);
      }
    } else {
      // Reset if swipe wasn't far enough
      setDragOffset({ x: 0, y: 0 });
    }
    
    setDragStart(null);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden bg-home-background-light dark:bg-home-background-dark">
      {/* Top App Bar */}
      <header className="flex flex-col bg-home-background-light dark:bg-home-background-dark shrink-0 max-w-md mx-auto w-full">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-12 shrink-0 items-center justify-start">
            <span className="material-symbols-outlined text-3xl text-home-primary">pets</span>
          </div>
          <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Petflik
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilters(true)}
              className="relative flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[#0e1b13] dark:text-gray-100 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Filters"
            >
              <span className="material-symbols-outlined">tune</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
            <button 
              onClick={toggleGlobalMode}
              className={`flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 p-0 transition-all ${
                isGlobalMode 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'bg-transparent text-[#0e1b13] dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={isGlobalMode ? 'Global mode: See everyone' : 'Local mode: See nearby only'}
            >
              <span className="material-symbols-outlined">
                {isGlobalMode ? 'public' : 'location_on'}
              </span>
            </button>
          </div>
        </div>
        
        {/* Role Switcher */}
        <div className="flex px-4 pb-3">
          <div className="flex h-10 flex-1 items-center justify-center rounded-lg bg-gray-200 dark:bg-gray-800 p-1">
            <button
              onClick={() => handleRoleChange('owner')}
              className={`flex h-full grow items-center justify-center overflow-hidden rounded-md px-4 text-sm font-medium transition-all ${
                userRole === 'owner'
                  ? 'bg-white dark:bg-gray-700 text-home-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-base mr-1">pets</span>
              Find Sitters
            </button>
            <button
              onClick={() => handleRoleChange('sitter')}
              className={`flex h-full grow items-center justify-center overflow-hidden rounded-md px-4 text-sm font-medium transition-all ${
                userRole === 'sitter'
                  ? 'bg-white dark:bg-gray-700 text-home-primary shadow-sm'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              <span className="material-symbols-outlined text-base mr-1">school</span>
              Find Pets
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Card Stack */}
      <main className="flex-1 flex flex-col items-center px-4 pt-2 pb-2 overflow-hidden max-w-md mx-auto w-full">
        <div className="relative w-full max-w-[400px] flex-1 flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          {profiles.length === 0 ? (
            /* No more profiles message */
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-xl shadow-xl p-8 text-center">
              <span className="material-symbols-outlined text-6xl text-gray-400 mb-4">
                {userRole === 'owner' ? 'person_search' : 'pets'}
              </span>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">
                No more profiles
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You've seen all available {userRole === 'owner' ? 'sitters' : 'pets'} in your area.
              </p>
              <button
                onClick={() => {
                  // Clear passed profiles to see them again
                  setPassedProfiles(new Set());
                  localStorage.removeItem('passedProfiles');
                  setCurrentIndex(0);
                }}
                className="px-6 py-3 bg-home-primary text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Start Over
              </button>
            </div>
          ) : (
            <>
              {/* Background Card 2 */}
              <div className="absolute w-[90%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-md transform scale-95 -translate-y-4"></div>
              
              {/* Background Card 1 */}
              <div className="absolute w-[95%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-lg transform scale-95"></div>
              
              {/* Main Card */}
              {currentProfile && (
            <div 
              className="absolute bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl shadow-xl w-full h-full cursor-grab active:cursor-grabbing transition-transform"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0) 50%), url("${currentProfile.imageUrl}")`,
                transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y}px) rotate(${dragOffset.x * 0.05}deg)`,
                opacity: swipeDirection ? 0.5 : 1
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {/* Swipe indicators */}
              {dragOffset.x > 50 && (
                <div className="absolute top-8 right-8 bg-green-500 text-white px-6 py-3 rounded-lg font-bold text-xl transform rotate-12 shadow-lg">
                  LIKE
                </div>
              )}
              {dragOffset.x < -50 && (
                <div className="absolute top-8 left-8 bg-red-500 text-white px-6 py-3 rounded-lg font-bold text-xl transform -rotate-12 shadow-lg">
                  NOPE
                </div>
              )}
              
              <div className="flex w-full items-end justify-between gap-4 p-4 pb-6">
                <div className="flex max-w-[440px] flex-1 flex-col gap-2">
                  <p className="text-white text-base font-medium leading-normal bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full self-start">
                    📍 {currentProfile.distance} miles away
                  </p>
                  <p className="text-white tracking-tight text-3xl font-bold leading-tight max-w-[440px] drop-shadow-lg">
                    {currentProfile.name}{currentProfile.age ? `, ${currentProfile.age}` : ''}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span 
                        className="material-symbols-outlined text-yellow-400 text-lg" 
                        style={{ fontVariationSettings: '"FILL" 1' }}
                      >
                        star
                      </span>
                      <p className="text-white text-base font-bold leading-normal">
                        {currentProfile.rating}
                      </p>
                    </div>
                    {currentProfile.hourlyRate && (
                      <div className="bg-home-primary text-white px-3 py-1.5 rounded-full shadow-lg">
                        <p className="text-base font-bold">
                          ${currentProfile.hourlyRate}/hr
                        </p>
                      </div>
                    )}
                  </div>
                  {currentProfile.bio && (
                    <p className="text-white text-sm leading-relaxed bg-black/40 backdrop-blur-sm px-4 py-2 rounded-lg mt-1 line-clamp-2">
                      {currentProfile.bio}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
            </>
          )}
        </div>
      </main>

      {/* Action Buttons - Fixed at bottom, above nav */}
      <div className="flex flex-shrink-0 gap-6 px-4 py-4 justify-center items-center bg-home-background-light dark:bg-home-background-dark max-w-md mx-auto w-full" style={{ marginBottom: '64px' }}>
        <button 
          onClick={handlePass}
          disabled={profiles.length === 0}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-red-500 shadow-lg hover:bg-red-50 dark:hover:bg-red-900/50 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-4xl font-bold">close</span>
        </button>
        
        <button 
          onClick={handleLike}
          disabled={profiles.length === 0}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-20 w-20 bg-home-primary text-white shadow-xl shadow-home-primary/40 hover:opacity-90 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-5xl font-bold">favorite</span>
        </button>
        
        <button 
          onClick={handleInfo}
          disabled={profiles.length === 0}
          className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-blue-500 shadow-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-all hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined text-4xl font-bold">info</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation />
      
      {/* Filters Modal */}
      <FiltersModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        userRole={userRole}
      />
      
      {/* Match Modal */}
      {matchedUser && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          matchedUser={matchedUser}
        />
      )}
      
      {/* Location Permission Prompt */}
      {showLocationPrompt && !locationEnabled && !isGlobalMode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-4xl text-blue-600 dark:text-blue-400">
                  location_on
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Enable Location
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Allow location access to find nearby {userRole === 'owner' ? 'sitters' : 'pets'} in your area. 
                You can also browse globally without location.
              </p>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={async () => {
                  await requestLocation();
                  setShowLocationPrompt(false);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">location_on</span>
                Enable Location
              </button>
              
              <button
                onClick={() => {
                  toggleGlobalMode();
                  setShowLocationPrompt(false);
                }}
                className="w-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">public</span>
                Browse Globally
              </button>
              
              <button
                onClick={() => setShowLocationPrompt(false)}
                className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 font-medium py-2 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewHomePage;
