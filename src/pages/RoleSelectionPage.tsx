import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const RoleSelectionPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'owner' | 'walker') => {
    // Navigate to signup with role pre-selected
    navigate(`/auth?mode=signup&role=${role}`);
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark group/design-root overflow-x-hidden font-display">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* HeaderImage */}
      <div className="w-full">
        <div className="px-0 md:px-4 py-0 md:py-3">
          <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-[320px] sm:min-h-[400px] md:rounded-xl"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=1200&q=80")',
              backgroundPosition: 'center 40%'
            }}
          />
        </div>
      </div>

      {/* HeadlineText */}
      <h1 className="text-role-text-light dark:text-role-text-dark tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
        Join Petflik. Are you a...
      </h1>

      {/* ButtonGroup */}
      <div className="flex justify-center">
        <div className="flex flex-1 gap-4 max-w-[480px] flex-col items-stretch px-4 py-3">
          <button
            onClick={() => handleRoleSelect('owner')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-auto px-5 py-4 bg-role-primary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-1 text-center hover:opacity-90 transition-opacity shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              <span className="truncate text-lg">Pet Owner</span>
            </div>
            <p className="text-sm font-normal text-role-background-dark/80">
              Find trusted sitters for your furry friends.
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect('walker')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-auto px-5 py-4 bg-role-button-secondary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-1 text-center hover:opacity-90 transition-opacity shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">school</span>
              <span className="truncate text-lg">Sitter</span>
            </div>
            <p className="text-sm font-normal text-role-background-dark/80">
              Earn money doing what you love.
            </p>
          </button>
        </div>
      </div>

      {/* MetaText */}
      <p className="text-role-text-light/70 dark:text-role-text-dark/70 text-sm font-normal leading-normal pb-6 pt-3 px-4 text-center">
        Already have an account?{' '}
        <button 
          onClick={() => navigate('/auth?mode=login')} 
          className="font-bold underline text-role-primary hover:opacity-80 transition-opacity"
        >
          Sign In
        </button>
      </p>

      {/* Footer with Logo */}
      <footer className="mt-auto px-4 py-6 flex justify-center items-center">
        <div className="flex items-center gap-2 text-role-text-light dark:text-role-text-dark">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl">pets</span>
          </div>
          <span className="font-bold text-lg">Petflik</span>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelectionPage;
