import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    // Auto-navigate after 2.5 seconds
    const timer = setTimeout(() => {
      navigate('/auth');
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-screen w-full flex-col items-center justify-center bg-stitch-bg-light dark:bg-stitch-bg-dark font-display overflow-hidden p-4">
      {/* Main Content Area */}
      <div className={`flex flex-col items-center justify-center flex-grow text-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}`}>
        {/* Animated Logo */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className={`transition-all duration-1000 ${fadeIn ? 'rotate-0 scale-100' : 'rotate-180 scale-0'}`}>
            <span 
              className="material-symbols-outlined text-7xl text-stitch-primary dark:text-stitch-secondary" 
              style={{ fontVariationSettings: '"FILL" 1, "wght" 600, "GRAD" 0, "opsz" 48' }}
            >
              pets
            </span>
          </div>
          <h1 className="text-stitch-text-primary-light dark:text-stitch-text-primary-dark tracking-tight text-6xl sm:text-7xl font-extrabold leading-tight">
            Paseo
          </h1>
        </div>
        
        {/* Tagline */}
        <p className={`text-stitch-text-secondary-light dark:text-stitch-text-secondary-dark text-xl font-medium leading-normal transition-all duration-1000 delay-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          Trusted sitters, happy pups.
        </p>
      </div>

      {/* Loading Indicator */}
      <div className={`absolute bottom-20 flex items-center justify-center w-full transition-all duration-1000 delay-500 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <div className="h-3 w-3 bg-stitch-primary dark:bg-stitch-secondary rounded-full animate-pulse [animation-delay:-0.3s] mx-1.5"></div>
        <div className="h-3 w-3 bg-stitch-primary dark:bg-stitch-secondary rounded-full animate-pulse [animation-delay:-0.15s] mx-1.5"></div>
        <div className="h-3 w-3 bg-stitch-primary dark:bg-stitch-secondary rounded-full animate-pulse mx-1.5"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

