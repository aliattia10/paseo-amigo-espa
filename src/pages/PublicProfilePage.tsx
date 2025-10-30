import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TinderProfileView from '@/components/profile/TinderProfileView';

const PublicProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [petsCount, setPetsCount] = useState(0);
  const [completedBookings, setCompletedBookings] = useState(0);

  // Parse photos from profile
  let photos: string[] = [];
  try {
    if (typeof userProfile?.profileImage === 'string') {
      photos = JSON.parse(userProfile.profileImage);
    } else if (Array.isArray(userProfile?.profileImage)) {
      photos = userProfile.profileImage;
    }
  } catch {
    photos = userProfile?.profileImage ? [userProfile.profileImage] : [];
  }

  // Filter out empty photos
  photos = photos.filter(p => p);

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
          .order('created_at', { ascending: false });
        
        if (!error && data) {
          setReviews(data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [currentUser]);

  // Load pets count
  useEffect(() => {
    const fetchPetsCount = async () => {
      if (!currentUser) return;
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { count, error } = await supabase
          .from('pets')
          .select('*', { count: 'exact', head: true })
          .eq('owner_id', currentUser.id);
        
        if (!error && count !== null) {
          setPetsCount(count);
        }
      } catch (error) {
        console.error('Error fetching pets count:', error);
      }
    };

    fetchPetsCount();
  }, [currentUser]);

  // Load completed bookings count
  useEffect(() => {
    const fetchCompletedBookings = async () => {
      if (!currentUser) return;
      
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { count, error } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('sitter_id', currentUser.id)
          .eq('status', 'completed');
        
        if (!error && count !== null) {
          setCompletedBookings(count);
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      }
    };

    fetchCompletedBookings();
  }, [currentUser]);

  // Calculate average rating
  const averageRating = reviews.length > 0 
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
    : (userProfile?.rating || 0);

  return (
    <div className="relative flex h-screen w-full flex-col bg-home-background-light dark:bg-home-background-dark overflow-hidden">
      {/* Top App Bar */}
      <header className="flex flex-col bg-home-background-light dark:bg-home-background-dark shrink-0 max-w-md mx-auto w-full">
        <div className="flex items-center p-4 pb-2 justify-between">
          <div className="flex size-12 shrink-0 items-center justify-start">
            <button onClick={() => navigate('/profile')}>
              <span className="material-symbols-outlined text-text-primary-light dark:text-text-primary-dark text-2xl">
                arrow_back
              </span>
            </button>
          </div>
          <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            Your Public Profile
          </h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/profile/edit')}
              className="flex cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[#0e1b13] dark:text-gray-100 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Edit Profile"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Scrollable Profile */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 pb-24 max-w-md mx-auto w-full">
        {/* Tinder-Style Photo Gallery - Smaller */}
        <div className="w-full max-w-[350px] mx-auto mb-4" style={{ height: '350px' }}>
          <TinderProfileView 
            photos={photos}
            name={userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
            onEditClick={() => navigate('/profile/edit')}
          />
        </div>

        {/* Profile Info Below Image - Dashboard Style */}
        <div className="w-full max-w-[400px] mx-auto bg-card-light dark:bg-card-dark rounded-3xl shadow-xl p-6 mb-4">
          {/* Name and Basic Info */}
          <div className="mb-4">
            <h2 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
              {userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
            </h2>
            
            {/* Location */}
            <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark mb-3">
              <span className="material-symbols-outlined text-lg">location_on</span>
              <span className="text-sm font-medium">
                📍 {userProfile?.city || 'Location not set'}
              </span>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {/* Rating */}
              <div className="bg-background-light dark:bg-background-dark rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-secondary text-lg" style={{ fontVariationSettings: '"FILL" 1' }}>
                    star
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {averageRating > 0 ? averageRating.toFixed(1) : '5.0'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {reviews.length} reviews
                </p>
              </div>

              {/* Pets Settered / Owned */}
              <div className="bg-background-light dark:bg-background-dark rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="text-2xl">🐾</span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {completedBookings || petsCount || 0}
                  </span>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {userProfile?.userType === 'owner' ? 'pets' : 'pets settered'}
                </p>
              </div>

              {/* Experience / Member Since */}
              <div className="bg-background-light dark:bg-background-dark rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <span className="material-symbols-outlined text-primary text-lg">
                    schedule
                  </span>
                  <span className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark">
                    {userProfile?.experience || '1'}
                  </span>
                </div>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  {userProfile?.experience ? 'years exp' : 'year'}
                </p>
              </div>
            </div>

            {/* Hourly Rate - for sitters */}
            {userProfile?.hourlyRate && (userProfile?.userType === 'walker' || (userProfile?.userType as any) === 'sitter' || (userProfile?.userType as any) === 'both') && (
              <div className="bg-primary/10 dark:bg-primary/20 border-2 border-primary/30 rounded-xl p-3 mb-3 text-center">
                <p className="text-2xl font-bold text-primary mb-1">
                  ${userProfile.hourlyRate}/hr
                </p>
                <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  Base hourly rate
                </p>
              </div>
            )}
          </div>

          {/* Bio */}
          {userProfile?.bio && (
            <div className="mb-4 p-4 bg-background-light dark:bg-background-dark rounded-xl">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">info</span>
                About Me
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {userProfile.bio}
              </p>
            </div>
          )}

          {/* User Type Badges */}
          <div className="flex gap-2 flex-wrap mb-4">
            <div className="bg-primary/20 dark:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
              {userProfile?.userType === 'owner' ? '🐾 Pet Owner' : 
               userProfile?.userType === 'walker' ? '🚶 Pet Sitter' : 
               userProfile?.userType === 'sitter' ? '🏠 Pet Sitter' : 
               userProfile?.userType === 'both' ? '🐾 Owner & Sitter' : 
               '🐾 Pet Lover'}
            </div>
            <div className="bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
                verified
              </span>
              Verified
            </div>
          </div>

          {/* Recent Reviews */}
          {reviews.length > 0 && (
            <div className="border-t border-border-light dark:border-border-dark pt-4">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-base">rate_review</span>
                Recent Reviews
              </h3>
              <div className="space-y-3">
                {reviews.slice(0, 3).map((review) => {
                  // Parse reviewer image
                  let reviewerImageUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + (review.reviewer?.name || 'User');
                  try {
                    if (review.reviewer?.profile_image) {
                      const parsed = JSON.parse(review.reviewer.profile_image);
                      reviewerImageUrl = Array.isArray(parsed) ? parsed[0] : review.reviewer.profile_image;
                    }
                  } catch {
                    reviewerImageUrl = review.reviewer?.profile_image || reviewerImageUrl;
                  }

                  return (
                    <div key={review.id} className="bg-background-light dark:bg-background-dark rounded-lg p-3">
                      <div className="flex items-start gap-2 mb-2">
                        <div 
                          className="w-8 h-8 rounded-full bg-cover bg-center flex-shrink-0" 
                          style={{ backgroundImage: `url('${reviewerImageUrl}')` }} 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark">
                            {review.reviewer?.name || 'Anonymous'}
                          </p>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span 
                                key={star} 
                                className={`material-symbols-outlined text-xs ${
                                  star <= review.rating ? 'text-secondary' : 'text-gray-300 dark:text-gray-600'
                                }`}
                                style={{ fontVariationSettings: '"FILL" 1' }}
                              >
                                star
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      {review.comment && (
                        <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              {reviews.length > 3 && (
                <p className="text-xs text-center text-text-secondary-light dark:text-text-secondary-dark mt-3">
                  + {reviews.length - 3} more reviews
                </p>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons at Bottom */}
      <div className="flex-shrink-0 bg-card-light dark:bg-card-dark p-4 max-w-md mx-auto w-full border-t border-border-light dark:border-border-dark mb-16">
        <button 
          onClick={() => navigate('/profile/edit')}
          className="w-full bg-gradient-to-r from-[#FD5564] to-[#FF6B7A] hover:from-[#FD4458] hover:to-[#FF5A6E] text-white font-bold py-3 rounded-full transition-colors shadow-lg"
        >
          Edit Profile
        </button>
      </div>
    </div>
  );
};

export default PublicProfilePage;

