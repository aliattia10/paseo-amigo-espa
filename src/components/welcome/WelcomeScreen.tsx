import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
  }, []);

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
        <p className={`text-welcome-text-light dark:text-welcome-text-dark text-lg font-normal leading-normal mb-12 transition-all duration-1000 delay-300 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
          Trusted sitters, happy pups.
        </p>

        {/* Action Buttons */}
        <div className={`flex flex-col gap-4 w-full max-w-[400px] transition-all duration-1000 delay-700 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={() => navigate('/auth?mode=signup')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-welcome-accent-light dark:bg-welcome-accent-dark text-white text-base font-bold leading-normal tracking-[0.015em] w-full shadow-lg hover:opacity-90 transition-opacity"
          >
            Get Started
          </button>
          <button
            onClick={() => navigate('/auth?mode=login')}
            className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-6 bg-white/10 backdrop-blur-sm border-2 border-welcome-accent-light dark:border-welcome-accent-dark text-welcome-accent-light dark:text-welcome-accent-dark text-base font-bold leading-normal tracking-[0.015em] w-full hover:bg-white/20 transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="absolute bottom-8 text-center px-4">
        <p className="text-welcome-text-light/60 dark:text-welcome-text-dark/60 text-sm">
          Join thousands of happy dogs and their owners
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;

