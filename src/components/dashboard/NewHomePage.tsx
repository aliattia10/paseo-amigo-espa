import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useLocation } from '@/contexts/LocationContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import BottomNavigation from '@/components/ui/BottomNavigation';
import MatchModal from '@/components/ui/MatchModal';
import FiltersModal, { FilterOptions } from '@/components/ui/FiltersModal';
import { playMatchSound, playLikeSound } from '@/lib/sounds';
import { supabase } from '@/integrations/supabase/client';
import i18n from '@/lib/i18n';
import { Button } from '@/components/ui/button';
import { calculateDistance } from '@/lib/distance';
import { parseLegacyAge } from '@/lib/pet-age';

/** Seed/demo users from SQL migrations (a1000000-* sitters, b2000000-* owners) — exclude from discovery */
function isDemoUserId(id: string | undefined | null): boolean {
  if (!id) return false;
  return /^a1000000-/i.test(id) || /^b2000000-/i.test(id);
}

function isDemoUserEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return /@demo\.petflik\.com$/i.test(email) || /@example\.com$/i.test(email);
}

function isEligibleUserRecord(user: { id?: string; email?: string | null; is_demo?: boolean | null; is_bot?: boolean | null; is_active?: boolean | null } | null | undefined): boolean {
  if (!user?.id) return false;
  if (isDemoUserId(user.id)) return false;
  if (isDemoUserEmail(user.email)) return false;
  if (user.is_demo === true || user.is_bot === true) return false;
  if (user.is_active === false) return false;
  return true;
}

interface Profile {
  id: string;
  name: string;
  age?: number;
  distance: number;
  rating: number;
  reviewCount: number;
  imageUrls: string[];
  bio?: string;
  hourlyRate?: number;
  type: 'dog' | 'walker';
  petType?: 'dog' | 'cat';
  verified?: boolean;
  petsCaredFor?: number | null;
  hobbies?: string[] | null;
  breed?: string | null;
  mood?: string | null;
  personalityTags?: string[] | null;
  profilePaused?: boolean;
}

const NewHomePage: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser, userProfile } = useAuth();
  const currentUserId = currentUser?.id;
  const { location, locationEnabled, requestLocation } = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [realPetProfiles, setRealPetProfiles] = useState<any[]>([]);
  const [realSitterProfiles, setRealSitterProfiles] = useState<any[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [profileLoadError, setProfileLoadError] = useState(false);
  const [profileRetryKey, setProfileRetryKey] = useState(0);
  const loadingProfilesRef = useRef(false);
  const [likedProfileIds, setLikedProfileIds] = useState<Set<string>>(new Set());
  const [passedProfileIds, setPassedProfileIds] = useState<Set<string>>(new Set());
  const [userRole, setUserRole] = useState<'owner' | 'sitter'>('owner');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [passedProfiles, setPassedProfiles] = useState<Set<string>>(new Set());
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUser, setMatchedUser] = useState<{
    id: string;
    name: string;
    imageUrl: string;
    petType?: 'dog' | 'cat';
    /** Sitter flow: card is a pet; keep this id visible until match modal closes */
    petCardId?: string;
  } | null>(null);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    petType: 'all',
    maxDistance: 50,
    minRating: 0,
    maxPrice: null,
    sortBy: 'distance',
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const resolveMatchId = async (userA: string, userB: string): Promise<string | null> => {
    const a = String(userA).trim();
    const b = String(userB).trim();
    // Schema-agnostic lookup: avoid column-specific filters that can 400 in mixed environments.
    const { data: raw } = await (supabase as any)
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    const match = (raw || []).find((m: any) => {
      const u1 = String(m.user1_id || '').trim();
      const u2 = String(m.user2_id || '').trim();
      const u = String(m.user_id || '').trim();
      const mu = String(m.matched_user_id || '').trim();
      return (u1 && u2 && ((u1 === a && u2 === b) || (u1 === b && u2 === a)))
        || (u && mu && ((u === a && mu === b) || (u === b && mu === a)));
    });
    return (match?.id as string) || null;
  };

  const ensureMatchNotifications = async (userA: string, userB: string, otherName: string) => {
    const a = String(userA).trim();
    const b = String(userB).trim();
    let matchId = await resolveMatchId(a, b);
    if (!matchId) {
      // Retry once by asking DB to ensure match row exists for mutual likes.
      await supabase.rpc('check_and_create_match', { liker_user_id: a, liked_user_id: b });
      matchId = await resolveMatchId(a, b);
    }
    if (!matchId) {
      if (import.meta.env.DEV) console.debug('Skipping match notification because match row is missing');
      return;
    }

    const makeNotif = async (targetUserId: string, counterpartName: string) => {
      const { data: existing } = await (supabase as any)
        .from('notifications')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('type', 'match')
        .eq('related_id', matchId)
        .limit(1)
        .maybeSingle();
      if (existing?.id) return;

      const payload = {
        user_id: targetUserId,
        type: 'match',
        title: t('match.itsAMatch', "It's a Match!"),
        message: t('home.youLiked', { name: counterpartName }),
        read: false,
        related_id: matchId,
      };
      await (supabase as any).from('notifications').insert(payload);
    };

    // Best-effort insert for both users; ignore errors to avoid blocking like/match UX.
    try {
      await makeNotif(a, otherName);
    } catch (error) {
      if (import.meta.env.DEV) console.debug('Match notification skipped for user A');
    }
    try {
      const { data: me } = await supabase.from('users').select('name').eq('id', a).single();
      await makeNotif(b, me?.name || 'New match');
    } catch (error) {
      if (import.meta.env.DEV) console.debug('Match notification skipped for user B');
    }
  };

  // Load user's likes and passes from Supabase
  React.useEffect(() => {
    const loadUserInteractions = async () => {
      if (!currentUser?.id) return;
      
      try {
        if (userRole === 'owner') {
          // Load owner's likes/passes for sitters
          const { data: likes } = await supabase
            .from('likes')
            .select('liked_id')
            .eq('liker_id', currentUser.id);
          
          if (likes) {
            setLikedProfileIds(new Set(likes.map((l: any) => l.liked_id)));
          }
          
          const { data: passes } = await (supabase as any)
            .from('passes')
            .select('passed_id')
            .eq('passer_id', currentUser.id);
          
          if (passes) {
            setPassedProfileIds(new Set(passes.map((p: any) => p.passed_id)));
          }
        } else {
          // Load sitter's likes/passes for pets
          const { data: petLikes } = await (supabase as any)
            .from('pet_likes')
            .select('pet_id')
            .eq('sitter_id', currentUser.id);
          
          if (petLikes) {
            setLikedProfileIds(new Set(petLikes.map((l: any) => l.pet_id)));
          }
          
          const { data: petPasses } = await (supabase as any)
            .from('pet_passes')
            .select('pet_id')
            .eq('sitter_id', currentUser.id);
          
          if (petPasses) {
            setPassedProfileIds(new Set(petPasses.map((p: any) => p.pet_id)));
          }
        }
      } catch (error) {
        console.error('Error loading user interactions:', error);
      }
    };
    
    loadUserInteractions();
  }, [currentUserId, userRole]);

  // Load real profiles from Supabase
  React.useEffect(() => {
    // Per-query timeout — keep above typical mobile latency to avoid false failures
    const REQUEST_TIMEOUT_MS = 15000;

    const loadProfiles = async () => {
      if (!currentUser?.id) {
        setLoadingProfiles(false);
        setProfileLoadError(false);
        loadingProfilesRef.current = false;
        return;
      }
      setProfileLoadError(false);
      loadingProfilesRef.current = true;
      try {
        // Fetch user location AND both profile sets in parallel so total wait = max(each)
        let userLat: number | null = null;
        let userLon: number | null = null;

        const locPromise: Promise<{ data: any; error: any } | null> = (location && locationEnabled)
          ? Promise.resolve(null) // already have coords from browser
          : Promise.race([
              supabase.from('users').select('latitude, longitude').eq('id', currentUser.id).single(),
              new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('User location timed out')), 2000)
              ),
            ]).catch(() => null); // never throw — location is optional

        const petsPromise = Promise.race([
          (supabase as any)
            .from('pets')
            .select(`id, name, age, age_years, age_months, image_url, owner_id, pet_type, breed, mood, personality_tags, users!pets_owner_id_fkey (id, email, latitude, longitude, preferences, is_demo, is_bot, is_active)`)
            .neq('owner_id', currentUser?.id || '')
            .order('created_at', { ascending: false }),
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'Pets timed out' } }), REQUEST_TIMEOUT_MS)
          ),
        ]);

        const sittersPromise = Promise.race([
          (supabase as any)
            .from('users')
            .select('id, name, bio, profile_image, hourly_rate, user_type, email, latitude, longitude, rating, review_count, verified, years_experience, pets_cared_for, hobbies, preferences, is_demo, is_bot, is_active')
            .or('user_type.eq.walker,user_type.eq.sitter,user_type.eq.both')
            .neq('id', currentUser?.id || '')
            .order('created_at', { ascending: false }),
          new Promise<{ data: null; error: { message: string } }>((resolve) =>
            setTimeout(() => resolve({ data: null, error: { message: 'Sitters timed out' } }), REQUEST_TIMEOUT_MS)
          ),
        ]);

        // All three run simultaneously — total wait = slowest single fetch, not sum of all
        const [locRes, petsRes, sittersRes] = await Promise.all([locPromise, petsPromise, sittersPromise]);

        // Resolve user location
        if (location && locationEnabled) {
          userLat = location.latitude;
          userLon = location.longitude;
        } else if (locRes?.data?.latitude != null) {
          userLat = Number(locRes.data.latitude);
          userLon = Number(locRes.data.longitude);
        }

        const pets = petsRes?.data ?? null;
        const petsError = petsRes?.error ?? null;
        const sitters = sittersRes?.data ?? null;
        const sittersError = sittersRes?.error ?? null;

        if (petsError) {
          if (import.meta.env.DEV) console.warn('[NewHomePage] Pets fetch failed:', petsError.message);
        }

        const needPetsList = userRole === 'sitter';
        const needSittersList = userRole === 'owner';
        const failedForCurrentRole =
          (needPetsList && !!petsError) || (needSittersList && !!sittersError);
        if (failedForCurrentRole) {
          setProfileLoadError(true);
          if (needSittersList) setRealSitterProfiles([]);
          if (needPetsList) setRealPetProfiles([]);
        }
        if (!petsError && pets) {
          const petsNoDemo = pets.filter((pet: { owner_id?: string; users?: any }) => {
            const owner = Array.isArray(pet.users) ? pet.users[0] : pet.users;
            return isEligibleUserRecord(owner) && owner?.preferences?.profilePaused !== true;
          });
          const petProfiles: Profile[] = petsNoDemo.map((pet: any) => {
            let imageUrls: string[] = [];
            try {
              imageUrls = JSON.parse(pet.image_url || '[]');
              if (!Array.isArray(imageUrls)) imageUrls = [pet.image_url];
            } catch {
              imageUrls = pet.image_url ? [pet.image_url] : [];
            }
            let distance = Infinity;
            if (userLat && userLon && pet.users) {
              const owner = Array.isArray(pet.users) ? pet.users[0] : pet.users;
              if (owner?.latitude && owner?.longitude) {
                distance = calculateDistance(userLat, userLon, Number(owner.latitude), Number(owner.longitude));
              }
            }
            return {
              id: pet.id,
              name: pet.name,
              age: (() => {
                if (pet.age_years != null && Number.isFinite(Number(pet.age_years))) return Number(pet.age_years);
                if (pet.age_months != null && Number.isFinite(Number(pet.age_months)) && Number(pet.age_months) > 0) return 0;
                const legacy = parseLegacyAge(pet.age);
                return legacy.ageYears ?? undefined;
              })(),
              distance,
              rating: 0,
              reviewCount: 0,
              imageUrls: imageUrls.length > 0 ? imageUrls : ['https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800'],
              type: 'dog' as const,
              petType: (pet.pet_type as 'dog' | 'cat') || 'dog',
              breed: pet.breed || null,
              mood: pet.mood || null,
              personalityTags: Array.isArray(pet.personality_tags) ? pet.personality_tags : (pet.personality_tags ? [pet.personality_tags] : null),
              profilePaused: false,
            };
          });
          setRealPetProfiles(petProfiles);
        }

        if (sittersError) {
          if (import.meta.env.DEV) console.warn('[NewHomePage] Sitters fetch failed:', sittersError.message);
        }
        if (!sittersError && sitters && sitters.length > 0) {
          const realSitters = sitters.filter(
            (sitter: { id: string; email?: string | null; preferences?: Record<string, unknown> | null; is_demo?: boolean | null; is_bot?: boolean | null; is_active?: boolean | null }) =>
              isEligibleUserRecord(sitter) &&
              sitter.preferences?.profilePaused !== true
          );
          const sitterProfiles: Profile[] = realSitters.map((sitter: any) => {
            let imageUrls: string[] = [];
            try {
              if (sitter.profile_image) {
                const parsed = JSON.parse(sitter.profile_image);
                imageUrls = Array.isArray(parsed) ? parsed : [sitter.profile_image];
              }
            } catch {
              imageUrls = sitter.profile_image ? [sitter.profile_image] : [];
            }
            if (imageUrls.length === 0) imageUrls = ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800'];
            let distance = Infinity;
            if (userLat && userLon && sitter.latitude && sitter.longitude) {
              distance = calculateDistance(userLat, userLon, Number(sitter.latitude), Number(sitter.longitude));
            }
            return {
              id: sitter.id,
              name: sitter.name || t('home.petSitter'),
              distance,
              rating: sitter.rating ? Number(sitter.rating) : 0,
              reviewCount: sitter.review_count ? Number(sitter.review_count) : 0,
              imageUrls,
              bio: sitter.bio || undefined,
              hourlyRate: sitter.hourly_rate || 15,
              type: 'walker' as const,
              verified: sitter.verified === true,
              petsCaredFor: sitter.pets_cared_for != null ? Number(sitter.pets_cared_for) : null,
              hobbies: Array.isArray(sitter.hobbies) ? sitter.hobbies : (sitter.hobbies ? [sitter.hobbies] : null),
              profilePaused: sitter.preferences?.profilePaused === true,
            };
          });
          setRealSitterProfiles(sitterProfiles);
        }

      } catch (error) {
        if (import.meta.env.DEV) console.error('[NewHomePage] Error loading profiles:', error);
        setProfileLoadError(true);
        setRealPetProfiles([]);
        setRealSitterProfiles([]);
      } finally {
        loadingProfilesRef.current = false;
        setLoadingProfiles(false);
      }
    };

    const timeoutId = setTimeout(() => {
      setLoadingProfiles(false);
      if (loadingProfilesRef.current) {
        setProfileLoadError(true);
        setRealPetProfiles([]);
        setRealSitterProfiles([]);
      }
    }, 20000);

    loadProfiles();

    // Subscribe to real-time updates for new profiles
    const petsSubscription = supabase
      .channel('pets-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pets' }, (payload) => {
        loadProfiles(); // Reload profiles when new pet is added
      })
      .subscribe();

    const usersSubscription = supabase
      .channel('users-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'users' }, (payload) => {
        loadProfiles(); // Reload profiles when new user is added
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        loadProfiles(); // Reload profiles when user is updated
      })
      .subscribe();

    // Cleanup subscriptions and timeout on unmount
    return () => {
      clearTimeout(timeoutId);
      petsSubscription.unsubscribe();
      usersSubscription.unsubscribe();
    };
    // Use stable location key to avoid re-running on every location object reference change
  }, [currentUserId, userRole, locationEnabled, profileRetryKey, location?.latitude, location?.longitude]);

  const handleRetryProfiles = () => {
    setProfileLoadError(false);
    setLoadingProfiles(true);
    setRealPetProfiles([]);
    setRealSitterProfiles([]);
    setCurrentIndex(0);
    setProfileRetryKey((k) => k + 1);
  };

  // No mock data - only show real profiles from database

  // Load saved preferences from localStorage on mount (only UI preferences, not swipe data)
  React.useEffect(() => {
    if (!currentUser?.id) return;
    
    // Use user-specific keys for UI preferences only
    const userKey = `user_${currentUser.id}`;
    const savedRole = localStorage.getItem(`${userKey}_userRole`) as 'owner' | 'sitter' | null;
    
    if (savedRole) setUserRole(savedRole);
    
    // Load saved filters
    const savedFilters = localStorage.getItem(`${userKey}_userFilters`);
    if (savedFilters) {
      try {
        setFilters(JSON.parse(savedFilters));
      } catch (e) {
        console.error('Error loading filters:', e);
      }
    }
    
    if (!locationEnabled) {
      setShowLocationPrompt(true);
    }
  }, [currentUserId]);
  
  // Show location prompt after a delay if not enabled
  React.useEffect(() => {
    if (!locationEnabled) {
      const timer = setTimeout(() => {
        setShowLocationPrompt(true);
      }, 1000); // Show prompt after 1 second
      return () => clearTimeout(timer);
    }
  }, [locationEnabled]);
  
  // Close location prompt when location is enabled
  React.useEffect(() => {
    if (locationEnabled) {
      setShowLocationPrompt(false);
    }
  }, [locationEnabled]);

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
      title: t('filters.applied', 'Filters applied'),
      description: t('filters.updated', 'Profiles updated based on your preferences'),
    });
  };

  // Apply filters to profiles
  const applyFilters = (profiles: Profile[]) => {
    if (import.meta.env.DEV) {
      if (import.meta.env.DEV) console.log('=== APPLYING FILTERS ===', 'Total profiles:', profiles.length);
    }
    
    // Filter out profiles user has already interacted with — keep the matched card visible until the match modal closes (Tinder-style)
    let filtered = profiles.filter((p) => {
      const keepForMatchModal =
        showMatchModal &&
        matchedUser &&
        (userRole === 'owner'
          ? p.id === matchedUser.id
          : matchedUser.petCardId != null && p.id === matchedUser.petCardId);
      if (keepForMatchModal) return true;
      return !passedProfileIds.has(p.id) && !likedProfileIds.has(p.id);
    });
    
    if (import.meta.env.DEV) console.log('Profiles after filter:', filtered.length);

    // Pet type filter (for owners looking at walkers)
    if (userRole === 'owner' && filters.petType !== 'all') {
      // In real implementation, this would check walker's pet preferences
      // For now, we'll keep all profiles
    }

    // Distance filter when location is on
    if (filters.maxDistance && locationEnabled) {
      filtered = filtered.filter(p => {
        // Only filter if distance is valid (not Infinity)
        if (p.distance === Infinity || p.distance === undefined) {
          return false; // Hide profiles without valid distance when location is enabled
        }
        return p.distance <= filters.maxDistance;
      });
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

  // Get profiles based on user role - only real profiles from database
  const dogProfiles = realPetProfiles;
  const walkerProfiles = realSitterProfiles;
  
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
    setCurrentImageIndex(0);
    if (currentUser?.id) {
      localStorage.setItem(`user_${currentUser.id}_userRole`, role);
    }
  };

  // Reset image index when profile changes
  React.useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentIndex]);

  const navigate = useNavigate();

  const handleLike = async () => {
    const profile = profiles[currentIndex];
    let showedMatchModal = false;

    if (!currentUser?.id) {
      toast({
        title: t('common.error'),
        description: t('auth.pleaseLogInAgain', t('home.errorSignIn', 'Please log in again')),
        variant: 'destructive',
      });
      return;
    }
    
    // Add to liked profiles locally (optimistic update)
    const newLiked = new Set(likedProfileIds);
    newLiked.add(profile.id);
    setLikedProfileIds(newLiked);
    
    // Save to Supabase and check for match (works for all users: mutual like creates match; demos get instant match)
    try {
      if (userRole === 'owner' && profile.type === 'walker') {
        const likerId = currentUser.id;
        const likedId = profile.id;
        let isMatch = false;
        const { data: rpcMatch, error: rpcError } = await (supabase as any).rpc('save_like_and_check_match', {
          p_liker_id: likerId,
          p_liked_id: likedId
        });
        if (rpcError) {
          console.warn('RPC save_like_and_check_match failed, trying direct insert:', rpcError.message);
          const { error: insertErr } = await supabase.from('likes').insert({
            liker_id: likerId,
            liked_id: likedId
          });
          if (insertErr) {
            if (insertErr.code === '23505') {
              // Unique violation = already liked, treat as success and check match
              const { data: mutual } = await supabase.from('likes').select('id').eq('liker_id', likedId).eq('liked_id', likerId).maybeSingle();
              isMatch = !!mutual?.id;
              if (isMatch) {
                await supabase.rpc('check_and_create_match', { liker_user_id: likerId, liked_user_id: likedId });
              }
            } else {
              console.error('Error saving like:', insertErr);
              throw insertErr;
            }
          } else {
            const { data: mutual } = await supabase.from('likes').select('id').eq('liker_id', likedId).eq('liked_id', likerId).maybeSingle();
            isMatch = !!mutual?.id;
            if (isMatch) {
              await supabase.rpc('check_and_create_match', { liker_user_id: likerId, liked_user_id: likedId });
            }
          }
        } else {
          isMatch = !!rpcMatch;
        }
        
        // If it's a match, show the modal
        if (isMatch) {
          await ensureMatchNotifications(likerId, likedId, profile.name);
          // For owner-sitter matches, try to get pet type from owner's pets
          let petTypeForSound: 'dog' | 'cat' | undefined = undefined;
          try {
            const { data: ownerPets } = await supabase
              .from('pets')
              .select('pet_type')
              .eq('owner_id', currentUser.id)
              .limit(1)
              .single();
            if (ownerPets?.pet_type) {
              petTypeForSound = ownerPets.pet_type as 'dog' | 'cat';
            }
          } catch (e) {
            // If no pets found or error, default to dog sound
            petTypeForSound = 'dog';
          }
          playMatchSound(petTypeForSound); // Play celebration sound based on pet type
          setMatchedUser({
            id: profile.id,
            name: profile.name,
            imageUrl: profile.imageUrls[0],
            petType: petTypeForSound,
          });
          setShowMatchModal(true);
          showedMatchModal = true;
        } else {
          // No match yet, just show success toast
          playLikeSound(); // Play like sound
          toast({
            title: t('home.liked'),
            description: t('home.youLiked', { name: profile.name }),
          });
        }
      } else {
        // Sitter liking a pet - save to pet_likes table
        const { error } = await (supabase as any).rpc('record_pet_like', {
          p_sitter_id: currentUser.id,
          p_pet_id: profile.id
        });
        
        if (error) {
          console.error('Error saving pet like:', error);
          throw error;
        }
        
        // Get pet owner ID and check for mutual match
        const { data: petData } = await supabase
          .from('pets')
          .select('owner_id')
          .eq('id', profile.id)
          .single();
        
        let isMatch = false;
        if (petData?.owner_id) {
          // Check if owner has also liked this sitter
          const { data: mutualLike } = await supabase
            .from('likes')
            .select('id')
            .eq('liker_id', petData.owner_id)
            .eq('liked_id', currentUser.id)
            .maybeSingle();
          
          if (mutualLike) {
            // Create match record between owner and sitter
            const { error: createMatchError } = await supabase.rpc('check_and_create_match', {
              liker_user_id: petData.owner_id,
              liked_user_id: currentUser.id
            });
            if (createMatchError && import.meta.env.DEV) {
              console.warn('check_and_create_match failed:', createMatchError.message);
            }
            const matchId = await resolveMatchId(petData.owner_id, currentUser.id);
            isMatch = !!matchId;
            if (!isMatch) {
              if (import.meta.env.DEV) console.warn('Mutual like detected but no match row created');
            } else {
              await ensureMatchNotifications(petData.owner_id, currentUser.id, profile.name);
            }
            
            // Get owner's name for match modal
            const { data: ownerData } = await supabase
              .from('users')
              .select('name, profile_image')
              .eq('id', petData.owner_id)
              .single();
            
            if (isMatch) {
              // Play match sound based on pet type
              const petType = profile.petType || 'dog';
              playMatchSound(petType);
              
              let ownerImageUrl = profile.imageUrls[0];
              if (ownerData?.profile_image) {
                try {
                  const parsed = JSON.parse(ownerData.profile_image);
                  ownerImageUrl = Array.isArray(parsed) ? parsed[0] : ownerData.profile_image;
                } catch {
                  ownerImageUrl = ownerData.profile_image;
                }
              }
              
              setMatchedUser({
                id: petData.owner_id,
                name: ownerData?.name || t('home.petOwner'),
                imageUrl: ownerImageUrl,
                petType: petType,
                petCardId: profile.id,
              });
              setShowMatchModal(true);
              showedMatchModal = true;
            }
          }
        }
        
        if (!isMatch) {
          playLikeSound();
          toast({
            title: t('home.liked'),
            description: t('home.youLiked', { name: profile.name }),
          });
        }
      }
    } catch (error: any) {
      console.error('Error saving like:', error);
      // Revert optimistic update on error
      const revertedLiked = new Set(likedProfileIds);
      revertedLiked.delete(profile.id);
      setLikedProfileIds(revertedLiked);
      const isAuthError = error?.message?.includes('session') || error?.message?.includes('JWT') || error?.status === 401 || error?.code === 'PGRST301';
      toast({
        title: t('common.error'),
        description: isAuthError ? t('auth.pleaseLogInAgain', 'Please log in again') : t('home.likeFailed'),
        variant: 'destructive',
      });
      return;
    }

    // Tinder-style: on match, stay on this card until the match modal is dismissed (no advance under the modal)
    if (!showedMatchModal) {
      setCurrentIndex(0);
    }
  };

  const handlePass = async () => {
    const profile = profiles[currentIndex];
    
    if (!currentUser) return;
    
    // Add to passed profiles locally (optimistic update)
    const newPassed = new Set(passedProfileIds);
    newPassed.add(profile.id);
    setPassedProfileIds(newPassed);
    
    // Save to Supabase
    try {
      if (userRole === 'owner' && profile.type === 'walker') {
        // Owner passing on a sitter - save to passes table
        const { error } = await (supabase as any).rpc('record_pass', {
          passer_user_id: currentUser.id,
          passed_user_id: profile.id
        });
        
        if (error) {
          console.error('Error saving pass:', error);
          // Revert optimistic update on error
          const revertedPassed = new Set(passedProfileIds);
          revertedPassed.delete(profile.id);
          setPassedProfileIds(revertedPassed);
        }
      } else {
        // Sitter passing on a pet - save to pet_passes table
        const { error } = await (supabase as any).rpc('record_pet_pass', {
          p_sitter_id: currentUser.id,
          p_pet_id: profile.id
        });
        
        if (error) {
          console.error('Error saving pet pass:', error);
          // Revert optimistic update on error
          const revertedPassed = new Set(passedProfileIds);
          revertedPassed.delete(profile.id);
          setPassedProfileIds(revertedPassed);
        }
      }
    } catch (error) {
      console.error('Error recording pass:', error);
    }

    setCurrentIndex(0);
  };

  const handleInfo = () => {
    const profile = profiles[currentIndex];
    if (profile.type === 'dog') {
      navigate(`/pet/${profile.id}`);
      return;
    }
    navigate(`/u/${profile.id}`);
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-[#f0f0f0] dark:bg-[#121212]">
      {/* Verification pending banner */}
      {userProfile && userProfile.verified !== true && (
        <div className="shrink-0 bg-gradient-to-r from-amber-500 to-orange-500 dark:from-amber-600 dark:to-orange-600 text-white px-4 py-2.5 flex items-center justify-between gap-3 max-w-md mx-auto w-full">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-lg shrink-0">shield</span>
            <span className="text-sm font-medium truncate">
              {t('verifyIdentity.banner', 'Verify your identity to build trust')}
            </span>
          </div>
          <button
            onClick={() => navigate('/verify-identity')}
            className="shrink-0 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full transition-colors"
          >
            {t('verifyIdentity.verify', 'Verify')}
          </button>
        </div>
      )}

      {/* Minimal Top Bar */}
      <header className="shrink-0 max-w-md mx-auto w-full">
        <div className="flex items-center px-4 py-3 justify-between">
          <img src="/app-logo.png?v=3" alt="Petflik" className="w-16 h-16" />
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              title={theme === 'dark' ? t('home.lightMode', 'Light mode') : t('home.darkMode', 'Dark mode')}
              aria-label={theme === 'dark' ? t('home.lightMode', 'Light mode') : t('home.darkMode', 'Dark mode')}
            >
              <span className="material-symbols-outlined text-xl">
                {theme === 'dark' ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button
              onClick={() => {
                const languages = ['en', 'es', 'fr'];
                const ci = languages.indexOf(i18n.language);
                i18n.changeLanguage(languages[(ci + 1) % languages.length]);
              }}
              className="flex items-center justify-center rounded-full h-9 px-2.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {i18n.language.toUpperCase()}
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="relative flex items-center justify-center rounded-full h-9 w-9 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="material-symbols-outlined text-xl">tune</span>
              {activeFiltersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-home-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Role Switcher - Pill style */}
        <div className="px-4 pb-2">
          <div className="flex h-9 items-center rounded-full bg-gray-200/80 dark:bg-gray-800 p-0.5">
            <button
              onClick={() => handleRoleChange('owner')}
              className={`flex h-full flex-1 items-center justify-center rounded-full px-3 text-sm font-semibold transition-all ${
                userRole === 'owner'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('home.findSitters')}
            </button>
            <button
              onClick={() => handleRoleChange('sitter')}
              className={`flex h-full flex-1 items-center justify-center rounded-full px-3 text-sm font-semibold transition-all ${
                userRole === 'sitter'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {t('home.findPets')}
            </button>
          </div>
        </div>
      </header>

      {/* Card Stack */}
      <main className="flex-1 flex flex-col items-center px-3 overflow-hidden max-w-md mx-auto w-full">
        <div className="relative w-full flex-1 flex items-center justify-center" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {loadingProfiles ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-home-primary border-t-transparent mb-3"></div>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{t('home.loadingProfiles')}</p>
            </div>
          ) : profileLoadError && profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center max-w-sm w-full">
              <span className="material-symbols-outlined text-5xl text-amber-500/90 mb-3">wifi_off</span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-2">
                {t('home.profilesLoadTitle')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">{t('home.profilesLoadHint')}</p>
              <Button
                size="sm"
                className="bg-home-primary hover:opacity-90 text-white"
                onClick={handleRetryProfiles}
              >
                {t('common.retry')}
              </Button>
            </div>
          ) : profiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full w-full">
              <div className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-2xl shadow-lg px-6 py-8 text-center">
              <span className="material-symbols-outlined text-5xl text-gray-300 dark:text-gray-600 mb-3">
                {userRole === 'owner' ? 'person_search' : 'pets'}
              </span>
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-1">
                {t('home.noMoreProfiles')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                {t('home.seenAllProfiles', { type: userRole === 'owner' ? t('home.sitters') : t('home.pets') })}
              </p>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPassedProfileIds(new Set());
                  setLikedProfileIds(new Set());
                  setPassedProfiles(new Set());
                  setLikedProfiles(new Set());
                  setCurrentIndex(0);
                  setCurrentImageIndex(0);
                  toast({
                    title: t('home.resetComplete') || 'Reset!',
                    description: t('home.allProfilesAvailable') || 'All profiles are available again.',
                  });
                  if (currentUser?.id) {
                    const uid = currentUser.id;
                    if (userRole === 'owner') {
                      (supabase as any).from('passes').delete().eq('passer_id', uid).then(() => {});
                    } else {
                      (supabase as any).from('pet_passes').delete().eq('sitter_id', uid).then(() => {});
                    }
                  }
                }}
                className="px-6 py-2.5 bg-home-primary text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
              >
                {t('home.startOver')}
              </button>
              </div>
            </div>
          ) : (
            <>
              {/* Background cards for depth */}
              <div className="absolute w-[92%] h-[96%] bg-white dark:bg-gray-800 rounded-2xl shadow-sm transform scale-[0.94] translate-y-2 opacity-60" />
              <div className="absolute w-[96%] h-[96%] bg-white dark:bg-gray-800 rounded-2xl shadow-md transform scale-[0.97] translate-y-1 opacity-80" />

              {/* Main Card - Tinder style */}
              {currentProfile && (
                <div
                  className="absolute w-full h-full rounded-2xl overflow-hidden shadow-xl cursor-grab active:cursor-grabbing"
                  style={{
                    transform: `translateX(${dragOffset.x}px) translateY(${dragOffset.y * 0.3}px) rotate(${dragOffset.x * 0.04}deg)`,
                    opacity: swipeDirection ? 0.5 : 1,
                    transition: dragStart ? 'none' : 'transform 0.3s ease'
                  }}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  {/* Full-bleed photo */}
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url("${currentProfile.imageUrls[currentImageIndex] || currentProfile.imageUrls[0]}")` }}
                  />

                  {/* Gradient overlay - only bottom */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

                  {/* Image progress indicators */}
                  {currentProfile.imageUrls.length > 1 && (
                    <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
                      {currentProfile.imageUrls.map((_, index) => (
                        <div key={index} className="flex-1 h-[3px] rounded-full overflow-hidden bg-white/30">
                          <div className={`h-full bg-white rounded-full transition-all duration-300 ${
                            index <= currentImageIndex ? 'w-full' : 'w-0'
                          }`} />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tap zones for photo nav */}
                  {currentProfile.imageUrls.length > 1 && (
                    <>
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1/3 z-10"
                        onClick={(e) => { e.stopPropagation(); if (currentImageIndex > 0) setCurrentImageIndex(currentImageIndex - 1); }}
                      />
                      <div
                        className="absolute right-0 top-0 bottom-0 w-1/3 z-10"
                        onClick={(e) => { e.stopPropagation(); if (currentImageIndex < currentProfile.imageUrls.length - 1) setCurrentImageIndex(currentImageIndex + 1); }}
                      />
                    </>
                  )}

                  {/* Swipe labels */}
                  {dragOffset.x > 50 && (
                    <div className="absolute top-16 left-6 border-[3px] border-green-400 text-green-400 px-4 py-2 rounded-lg font-black text-2xl transform -rotate-12 z-20">
                      {t('home.like', 'LIKE')}
                    </div>
                  )}
                  {dragOffset.x < -50 && (
                    <div className="absolute top-16 right-6 border-[3px] border-red-400 text-red-400 px-4 py-2 rounded-lg font-black text-2xl transform rotate-12 z-20">
                      {t('home.nope', 'NOPE')}
                    </div>
                  )}

                  {/* Bottom info overlay - minimal Tinder style */}
                  <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                    {/* Name + Age + Verified */}
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-white text-[28px] font-bold drop-shadow-lg truncate">
                        {currentProfile.name}
                      </h2>
                      {currentProfile.age && (
                        <span className="text-white/90 text-2xl font-light">{currentProfile.age}</span>
                      )}
                      {currentProfile.verified && (
                        <span
                          className="material-symbols-outlined text-blue-400 text-xl drop-shadow-lg"
                          style={{ fontVariationSettings: '"FILL" 1' }}
                        >
                          verified
                        </span>
                      )}
                    </div>

                    {/* Compact info row */}
                    <div className="flex items-center gap-3 text-white/80 text-sm mb-2">
                      {/* Distance */}
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-base">near_me</span>
                        {currentProfile.distance === Infinity
                          ? '--'
                          : `${currentProfile.distance.toFixed(0)} km`}
                      </span>

                      {/* Rating */}
                      {currentProfile.rating > 0 && (
                        <span className="flex items-center gap-0.5">
                          <span className="material-symbols-outlined text-yellow-400 text-base" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                          {currentProfile.rating.toFixed(1)}
                          {currentProfile.reviewCount > 0 && (
                            <span className="text-white/60">({currentProfile.reviewCount})</span>
                          )}
                        </span>
                      )}

                      {/* Price */}
                      {currentProfile.hourlyRate && (
                        <span className="font-semibold text-white/90">
                          €{currentProfile.hourlyRate}/hr
                        </span>
                      )}
                      {/* Experience badge for sitters */}
                      {currentProfile.type === 'walker' && currentProfile.petsCaredFor != null && currentProfile.petsCaredFor > 0 && (
                        <span className="text-white/90 text-xs font-medium">
                          {currentProfile.petsCaredFor}+ pets cared for
                        </span>
                      )}
                    </div>

                    {/* Breed + mood for pets */}
                    {currentProfile.type === 'dog' && (currentProfile.breed || currentProfile.mood) && (
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        {currentProfile.breed && (
                          <span className="text-white/90 text-sm font-medium">{currentProfile.breed}</span>
                        )}
                        {currentProfile.mood && (
                          <span className="rounded-full bg-white/25 text-white text-xs px-2.5 py-0.5 font-medium">
                            {currentProfile.mood}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Bio - 2 lines for walker, 1 for pet */}
                    {currentProfile.bio && (
                      <p className={`text-white/70 text-sm ${currentProfile.type === 'walker' ? 'line-clamp-2' : 'line-clamp-1'}`}>{currentProfile.bio}</p>
                    )}

                    {/* Hobbies pills for sitters */}
                    {currentProfile.type === 'walker' && Array.isArray(currentProfile.hobbies) && currentProfile.hobbies.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {currentProfile.hobbies.slice(0, 3).map((h: string) => (
                          <span key={h} className="rounded-full bg-white/20 text-white text-xs px-2.5 py-0.5 font-medium">
                            {h}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* New badge */}
                    {currentProfile.rating === 0 && currentProfile.reviewCount === 0 && (
                      <span className="inline-block mt-1.5 bg-blue-500/80 text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                        {t('home.new', 'New')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      <div className="flex shrink-0 gap-4 px-4 py-3 justify-center items-center max-w-md mx-auto w-full" style={{ marginBottom: '64px' }}>
        <button
          onClick={handlePass}
          disabled={profiles.length === 0}
          className="flex items-center justify-center rounded-full h-14 w-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-red-500 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"wght" 600' }}>close</span>
        </button>

        <button
          onClick={handleLike}
          disabled={profiles.length === 0}
          className="flex items-center justify-center rounded-full h-[68px] w-[68px] bg-home-primary text-white shadow-lg shadow-home-primary/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 500' }}>favorite</span>
        </button>

        <button
          onClick={handleInfo}
          disabled={profiles.length === 0}
          className="flex items-center justify-center rounded-full h-14 w-14 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-blue-500 shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-40"
        >
          <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: '"wght" 500' }}>info</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation unreadNotifications={unreadNotifications} />

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
          onClose={() => {
            setShowMatchModal(false);
            setMatchedUser(null);
            setCurrentIndex(0);
          }}
          matchedUser={matchedUser}
          petType={matchedUser.petType}
          currentUserName={userProfile?.name}
          currentUserImageUrl={(() => {
            const p = userProfile?.profileImage;
            if (!p) return undefined;
            try {
              const parsed = typeof p === 'string' ? JSON.parse(p) : p;
              return Array.isArray(parsed) ? parsed[0] : (parsed as string);
            } catch {
              return typeof p === 'string' ? p : undefined;
            }
          })()}
        />
      )}

      {/* Location Permission Prompt */}
      {showLocationPrompt && !locationEnabled && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="text-center mb-4">
              <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-3xl text-blue-600 dark:text-blue-400">near_me</span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1">{t('home.enableLocation')}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {t('home.findNearby', { type: userRole === 'owner' ? t('home.sitters') : t('home.pets') })}
              </p>
            </div>
            <div className="space-y-2.5 mt-4">
              <button
                onClick={async () => {
                  if (import.meta.env.DEV) console.log('Enable Location button clicked');
                  await requestLocation();
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <span className="material-symbols-outlined text-lg">location_on</span>
                {t('home.enableLocation')}
              </button>
              <button
                onClick={() => setShowLocationPrompt(false)}
                className="w-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 font-medium py-1.5 transition-colors text-sm"
              >
                {t('home.maybeLater')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewHomePage;
