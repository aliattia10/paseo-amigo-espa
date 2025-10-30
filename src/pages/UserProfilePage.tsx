import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const UserProfilePage: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [user, setUser] = React.useState<any | null>(null);
  const [photos, setPhotos] = React.useState<string[]>([]);

  React.useEffect(() => {
    const loadUser = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const { supabase } = await import('@/integrations/supabase/client');
        const { data, error } = await supabase
          .from('users')
          .select('id, name, bio, profile_image, hourly_rate, availability, rating, reviews_count, pets_count, city')
          .eq('id', userId)
          .single();
        if (error) throw error;
        setUser(data);
        // parse photos
        let parsed: string[] = [];
        try {
          if (data?.profile_image) {
            const p = JSON.parse(data.profile_image);
            parsed = Array.isArray(p) ? p : [data.profile_image];
          }
        } catch {
          parsed = data?.profile_image ? [data.profile_image] : [];
        }
        setPhotos(parsed.filter(Boolean));
      } catch (e: any) {
        console.error('Failed to load user profile', e);
        toast({ title: 'Error', description: e.message || 'Failed to load profile', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, [userId, toast]);

  return (
    <div className="relative flex h-screen w-full flex-col bg-home-background-light dark:bg-home-background-dark overflow-hidden">
      <header className="flex items-center p-4 pb-2 justify-between max-w-md w-full mx-auto">
        <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold flex-1 text-center">Profile</h1>
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
              <img src={photos[0]} alt={user.name} className="w-full h-64 object-cover rounded-2xl shadow-lg" />
            )}

            {/* Name + chips */}
            <div>
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">{user.name}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                {typeof user.rating === 'number' && (
                  <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                    {user.rating.toFixed(1)}
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
                {typeof user.reviews_count === 'number' && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">reviews</span>
                    {user.reviews_count} reviews
                  </span>
                )}
                {Array.isArray(user.availability) && user.availability.length > 0 && (
                  <span className="inline-flex items-center gap-1 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs font-semibold px-3 py-1 rounded-full">
                    <span className="material-symbols-outlined text-sm">event_available</span>
                    {user.availability.slice(0, 3).join(', ')}
                  </span>
                )}
              </div>
            </div>

            {/* About */}
            {user.bio && (
              <div className="bg-card-light dark:bg-card-dark p-4 rounded-2xl shadow">
                <div className="flex items-center gap-2 font-semibold mb-2">
                  <span className="material-symbols-outlined text-base">format_quote</span>
                  About me
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
          </div>
        ) : (
          <div className="text-center text-gray-600 dark:text-gray-400">Profile not found</div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
