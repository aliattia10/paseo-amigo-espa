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
    <div className="relative flex h-[100svh] w-full flex-col items-center justify-center bg-welcome-background-light dark:bg-welcome-background-dark font-display group/design-root overflow-hidden p-4">
      {/* Main Content Area */}
      <div className={`flex flex-col items-center justify-center flex-grow text-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span 
            className="material-symbols-outlined text-5xl text-welcome-accent-light dark:text-welcome-accent-dark" 
            style={{ fontVariationSettings: '"FILL" 1, "wght" 600, "GRAD" 0, "opsz" 48' }}
          >
            pets
          </span>
          <h1 className="text-welcome-text-light dark:text-welcome-text-dark tracking-tight text-6xl font-extrabold leading-tight">
            Paseo
          </h1>
        </div>
        {/* Tagline */}
        <p className={`text-welcome-text-light dark:text-welcome-text-dark text-lg font-normal leading-normal transition-all duration-1000 delay-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
          Trusted sitters, happy pups.
        </p>
      </div>

      {/* Optional Loading Indicator */}
      <div className="absolute bottom-16 flex items-center justify-center w-full">
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse [animation-delay:-0.3s]"></div>
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse [animation-delay:-0.1s] mx-2"></div>
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

