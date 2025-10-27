import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BottomNavigation from '@/components/ui/BottomNavigation';

interface Profile {
  id: string;
  name: string;
  age: number;
  distance: number;
  rating: number;
  imageUrl: string;
  bio?: string;
}

const NewHomePage: React.FC = () => {
  const { t } = useTranslation();
  const [profiles] = useState<Profile[]>([
    {
      id: '1',
      name: 'Max',
      age: 4,
      distance: 2,
      rating: 4.9,
      imageUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800',
    },
    {
      id: '2',
      name: 'Luna',
      age: 3,
      distance: 1.5,
      rating: 4.8,
      imageUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=800',
    },
    {
      id: '3',
      name: 'Charlie',
      age: 5,
      distance: 3,
      rating: 4.7,
      imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=800',
    },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);

  const navigate = useNavigate();

  const handleLike = () => {
    const profile = profiles[currentIndex];
    // Navigate to booking request page
    navigate(`/booking/request?walkerId=${profile.id}&walkerName=${profile.name}&rate=15`);
  };

  const handlePass = () => {
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

  const currentProfile = profiles[currentIndex];

  return (
    <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden bg-home-background-light dark:bg-home-background-dark">
      {/* Top App Bar */}
      <header className="flex items-center bg-home-background-light dark:bg-home-background-dark p-4 pb-2 justify-between shrink-0 max-w-md mx-auto w-full">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-home-primary">pets</span>
        </div>
        <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          Paseo
        </h1>
        <div className="flex w-12 items-center justify-end">
          <button className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[#0e1b13] dark:text-gray-100 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      {/* Main Content: Card Stack */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-2 overflow-hidden max-w-md mx-auto w-full">
        <div className="relative w-full max-w-[400px] h-[600px] flex items-center justify-center">
          {/* Background Card 2 */}
          <div className="absolute w-[90%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-md transform scale-95 -translate-y-4"></div>
          
          {/* Background Card 1 */}
          <div className="absolute w-[95%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-lg transform scale-95"></div>
          
          {/* Main Card */}
          {currentProfile && (
            <div 
              className="absolute bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl shadow-xl w-full h-full"
              style={{
                backgroundImage: `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url("${currentProfile.imageUrl}")`
              }}
            >
              <div className="flex w-full items-end justify-between gap-4 p-4">
                <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                  <p className="text-white text-base font-medium leading-normal bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full self-start">
                    {currentProfile.distance} miles away
                  </p>
                  <p className="text-white tracking-tight text-3xl font-bold leading-tight max-w-[440px]">
                    {currentProfile.name}, {currentProfile.age}
                  </p>
                  <div className="flex items-center gap-1">
                    <span 
                      className="material-symbols-outlined text-yellow-400" 
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      star
                    </span>
                    <p className="text-white text-lg font-medium leading-normal">
                      {currentProfile.rating}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Action Buttons */}
      <div className="flex flex-shrink-0 gap-4 flex-wrap px-4 py-4 justify-center items-center bg-home-background-light dark:bg-home-background-dark max-w-md mx-auto w-full">
        <button 
          onClick={handlePass}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-red-500 shadow-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        
        <button 
          onClick={handleLike}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-20 w-20 bg-home-primary text-[#0e1b13] dark:text-black shadow-lg shadow-home-primary/30 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-5xl">favorite</span>
        </button>
        
        <button 
          onClick={handleInfo}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-blue-500 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl">info</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  );
};

export default NewHomePage;
