import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import SitterCard from '@/components/sitters/SitterCard';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any | null>(null);
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = React.useState(true);

  React.useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const res = await supabase
          .from('users')
          .select('id, name, bio, profile_image, hourly_rate, rating, review_count, city, user_type, verified, years_experience, pets_cared_for, sitter_age, experience_description, has_pet_experience, hobbies')
          .eq('id', userId)
          .maybeSingle() as { data: Record<string, unknown> | null; error: Error | null };
        if (res.error) throw res.error;
        const data = res.data;
        if (!data) {
          setUser(null);
          setPhotos([]);
          return;
        }
        setUser(data);
        // parse photos
        let parsed: string[] = [];
        try {
          if (data?.profile_image) {
            const p = JSON.parse(data.profile_image as string);
            parsed = Array.isArray(p) ? p : [data.profile_image as string];
          }
        } catch {
          parsed = data?.profile_image ? [data.profile_image as string] : [];
        }
        setPhotos(parsed.filter(Boolean));
      } catch (e: any) {
        console.error('Failed to load user profile', e);
        const isNoRows = e?.code === 'PGRST116' || String(e?.message || '').includes('0 rows');
        if (!isNoRows) {
          toast({ title: 'Error', description: e.message || 'Failed to load profile', variant: 'destructive' });
        }
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId]);

  // Load reviews for this user (handles both reviewee_id and reviewed_id column names)
  React.useEffect(() => {
    const loadReviews = async () => {
      if (!userId) return;
      setLoadingReviews(true);
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        let { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            reviewer:users!reviews_reviewer_id_fkey(name, profile_image)
          `)
          .eq('reviewee_id', userId)
          .order('created_at', { ascending: false })
          .limit(10);
        
        if (error && error.message?.includes('reviewee_id')) {
          const fallback = await supabase
            .from('reviews')
            .select(`
              *,
              reviewer:users!reviews_reviewer_id_fkey(name, profile_image)
            `)
            .eq('reviewed_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);
          data = fallback.data;
          error = fallback.error;
        }
        
        if (error) throw error;
        setReviews(data || []);
      } catch (e: any) {
        console.error('Failed to load reviews', e);
      } finally {
        setLoadingReviews(false);
      }
    };
    loadReviews();
  }, [userId]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-home-background-light dark:bg-home-background-dark overflow-hidden">
      <header className="flex items-center p-4 pb-2 justify-between max-w-md w-full mx-auto">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold flex-1 text-center">{t('profile.title')}</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto px-4 pt-2 pb-4 max-w-md mx-auto w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-home-primary" />
          </div>
        ) : user ? (
          <div className="space-y-4">
            {/* Top image */}
            {photos[0] && (
              <img
                src={photos[0]}
                alt={user.name}
                className="w-full h-64 object-cover rounded-2xl shadow-lg"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'; }}
              />
            )}

            {/* Sitter summary card for walkers/sitters */}
            {(user.user_type === 'walker' || user.user_type === 'sitter' || user.user_type === 'both') && (
              <SitterCard
                name={user.name}
                profileImage={photos[0] || undefined}
                rating={user.rating != null ? Number(user.rating) : null}
                petsCaredFor={user.pets_cared_for != null ? Number(user.pets_cared_for) : null}
                yearsExperience={user.years_experience != null ? Number(user.years_experience) : null}
                experienceDescription={typeof user.experience_description === 'string' ? user.experience_description : null}
                sitterAge={user.sitter_age != null ? Number(user.sitter_age) : null}
                bio={user.bio || undefined}
                hobbies={Array.isArray(user.hobbies) ? user.hobbies : (user.hobbies ? [user.hobbies] : null)}
                hourlyRate={user.hourly_rate != null ? Number(user.hourly_rate) : null}
                verified={user.verified === true}
              />
            )}

            {/* Name + chips (for non-sitter or extra details) */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">{user.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {typeof user.rating === 'number' && user.rating > 0 && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    {Number(user.rating).toFixed(1)}
                    {typeof user.review_count === 'number' && user.review_count > 0 && (
                      <span className="opacity-70 ml-1">({user.review_count})</span>
                    )}
                  </span>
                )}
                {user.verified && (
                  <span className="inline-flex items-center gap-1 bg-medium-jungle/10 text-medium-jungle dark:bg-medium-jungle/30 dark:text-sage-green text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>verified</span>
                    {t('home.verified', 'Verified')}
                  </span>
                )}
                {typeof user.hourly_rate === 'number' && (
                  <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    €{user.hourly_rate}/hr
                  </span>
                )}
                {user.city && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">location_on</span>
                    {user.city}
                  </span>
                )}
              </div>
            </div>

            {/* About */}
            {user.bio && (
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <span className="material-symbols-outlined text-base">format_quote</span>
                  {t('profile.aboutMe')}
                </div>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">{user.bio}</p>
              </div>
            )}

            {/* Photo strip */}
            {photos.length > 1 && (
              <div className="grid grid-cols-3 gap-2">
                {photos.slice(1).map((p, i) => (
                  <img key={i} src={p} className="w-full h-24 object-cover rounded-xl" />
                ))}
              </div>
            )}

            {/* Book Now Button — only for sitters/walkers, and not for own profile */}
            {(user.user_type === 'walker' || user.user_type === 'sitter' || user.user_type === 'both') && userId !== currentUser?.id && (
              <button
                onClick={() => navigate(`/booking/request?walkerId=${user.id}&walkerName=${encodeURIComponent(user.name)}&rate=${user.hourly_rate || 15}`)}
                className="w-full bg-primary text-white font-bold py-3 rounded-2xl shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined">calendar_today</span>
                {t('messages.bookNow', 'Book Now')} {typeof user.hourly_rate === 'number' ? `— €${user.hourly_rate}/hr` : ''}
              </button>
            )}

            {/* Reviews Section */}
            <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow">
              <div className="flex items-center gap-2 font-semibold mb-4">
                <span className="material-symbols-outlined text-base">rate_review</span>
                <h3 className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                  Reviews ({reviews.length})
                </h3>
              </div>

              {loadingReviews ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => {
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
                      <div key={review.id} className="border-b border-border-light dark:border-border-dark pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start gap-3 mb-2">
                          <div 
                            className="w-10 h-10 rounded-full bg-cover bg-center flex-shrink-0" 
                            style={{ backgroundImage: `url('${reviewerImageUrl}')` }} 
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-text-primary-light dark:text-text-primary-dark mb-1">
                              {review.reviewer?.name || 'Anonymous'}
                            </p>
                            <div className="flex gap-0.5 mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <span 
                                  key={star} 
                                  className={`material-symbols-outlined text-sm ${
                                    star <= review.rating 
                                      ? 'text-yellow-400' 
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                  style={{ fontVariationSettings: '"FILL" 1' }}
                                >
                                  star
                                </span>
                              ))}
                            </div>
                            {review.comment && (
                              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                                "{review.comment}"
                              </p>
                            )}
                            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-2 opacity-60">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-4">
                  {t('profile.noReviews', 'No reviews yet')}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">{t('profile.notFound')}</div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
