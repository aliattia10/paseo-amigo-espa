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

        {/* Profile Info Below Image - Dashboard Style */}
        <div className="w-full max-w-[400px] bg-card-light dark:bg-card-dark rounded-3xl shadow-xl p-6 mt-4 -mb-2">
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

            {/* Rating, Experience & Price */}
            <div className="flex items-center gap-3 flex-wrap mb-3">
              {/* Rating */}
              <div className="flex items-center gap-1 bg-secondary/20 dark:bg-secondary/30 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-secondary text-base" style={{ fontVariationSettings: '"FILL" 1' }}>
                  star
                </span>
                <span className="font-bold text-base text-text-primary-light dark:text-text-primary-dark">
                  {userProfile?.rating ? userProfile.rating.toFixed(1) : '5.0'}
                </span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark text-xs">
                  ({userProfile?.totalWalks || '0'} reviews)
                </span>
              </div>

              {/* Hourly Rate - for sitters */}
              {userProfile?.hourlyRate && (userProfile?.userType === 'walker' || userProfile?.userType === 'sitter' || userProfile?.userType === 'both') && (
                <div className="bg-primary text-white px-3 py-1.5 rounded-full shadow-lg">
                  <p className="text-base font-bold">
                    ${userProfile.hourlyRate}/hr
                  </p>
                </div>
              )}
            </div>

            {/* Experience - for sitters */}
            {userProfile?.experience && (userProfile?.userType === 'walker' || userProfile?.userType === 'sitter' || userProfile?.userType === 'both') && (
              <div className="flex items-center gap-2 mb-3">
                <span className="material-symbols-outlined text-primary">work</span>
                <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                  {userProfile.experience} {userProfile.experience === 1 ? 'year' : 'years'} of experience
                </span>
              </div>
            )}
          </div>

          {/* Bio */}
          {userProfile?.bio && (
            <div className="mb-4 p-4 bg-background-light dark:bg-background-dark rounded-xl">
              <h3 className="text-sm font-bold text-text-primary-light dark:text-text-primary-dark mb-2">About</h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark leading-relaxed">
                {userProfile.bio}
              </p>
            </div>
          )}

          {/* User Type Badges */}
          <div className="flex gap-2 flex-wrap">
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

