import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import TinderProfileView from '@/components/profile/TinderProfileView';

const PublicProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, userProfile } = useAuth();

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

      {/* Main Content: Tinder-Style Profile */}
      <main className="flex-1 flex flex-col items-center px-4 pt-4 pb-2 overflow-hidden max-w-md mx-auto w-full">
        <div className="w-full max-w-[400px] flex-1 flex items-center justify-center">
          <TinderProfileView 
            photos={photos}
            name={userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
            onEditClick={() => navigate('/profile/edit')}
          />
        </div>

        {/* Profile Info Below Image */}
        <div className="w-full max-w-[400px] bg-card-light dark:bg-card-dark rounded-3xl shadow-xl p-6 mt-4 -mb-2">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
                {userProfile?.name || currentUser?.email?.split('@')[0] || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-text-secondary-light dark:text-text-secondary-dark mb-2">
                <span className="material-symbols-outlined text-base">location_on</span>
                <span className="text-sm">{userProfile?.city || 'Location not set'}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                  star
                </span>
                <span className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">4.8</span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-sm">(32 reviews)</span>
              </div>
            </div>
          </div>

          {/* Bio */}
          {userProfile?.bio && (
            <div className="mb-4">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-2">About</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {userProfile.bio}
              </p>
            </div>
          )}

          {/* User Type Badge */}
          <div className="flex gap-2 flex-wrap">
            <div className="bg-primary/20 dark:bg-primary/30 text-primary px-3 py-1.5 rounded-full text-xs font-bold">
              {userProfile?.userType === 'owner' ? '🐾 Pet Owner' : 
               userProfile?.userType === 'walker' ? '🚶 Pet Sitter' : 
               userProfile?.userType === 'both' ? '🐾 Pet Owner & Sitter' : 
               '🐾 Pet Lover'}
            </div>
            <div className="bg-green-500/20 dark:bg-green-500/30 text-green-600 dark:text-green-400 px-3 py-1.5 rounded-full text-xs font-bold">
              ✓ Verified
            </div>
          </div>
        </div>
      </main>

      {/* Action Buttons at Bottom */}
      <div className="flex-shrink-0 bg-card-light dark:bg-card-dark p-4 max-w-md mx-auto w-full border-t border-border-light dark:border-border-dark">
        <div className="flex gap-3">
          <button 
            onClick={() => navigate('/profile')}
            className="flex-1 bg-background-light dark:bg-background-dark text-text-primary-light dark:text-text-primary-dark font-bold py-3 rounded-xl border-2 border-border-light dark:border-border-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            Back to Profile
          </button>
          <button 
            onClick={() => navigate('/profile/edit')}
            className="flex-1 bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicProfilePage;

