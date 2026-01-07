import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const WelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    setFadeIn(true);
    // Auto-redirect to role selection after 2 seconds
    const timer = setTimeout(() => {
      navigate('/select-role');
    }, 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="relative flex h-[100svh] w-full flex-col items-center justify-center bg-welcome-background-light dark:bg-welcome-background-dark font-display group/design-root overflow-hidden p-4">
      {/* Main Content Area */}
      <div className={`flex flex-col items-center justify-center flex-grow text-center transition-all duration-1000 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="/app-logo.png?v=2" 
            alt="Petflik Logo" 
            className="w-16 h-16 md:w-20 md:h-20"
          />
        </div>
        {/* Tagline */}
        <p className={`text-welcome-text-light dark:text-welcome-text-dark text-lg font-normal leading-normal transition-all duration-1000 delay-500 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2.5'}`}>
          Trusted Sitters for happy pets.
        </p>
      </div>

      {/* Loading Indicator */}
      <div className="absolute bottom-16 flex items-center justify-center w-full">
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse" style={{ animationDelay: '-0.3s' }}></div>
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse mx-2" style={{ animationDelay: '-0.1s' }}></div>
        <div className="h-2.5 w-2.5 bg-welcome-accent-light dark:bg-welcome-accent-dark rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default WelcomeScreen;

