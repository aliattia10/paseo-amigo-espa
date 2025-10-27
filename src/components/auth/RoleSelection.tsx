import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { UserType } from '@/types';

interface RoleSelectionProps {
  onSelectRole: (role: 'owner' | 'walker' | 'both') => void;
}

const RoleSelection: React.FC<RoleSelectionProps> = ({ onSelectRole }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleRoleSelect = (role: 'owner' | 'walker' | 'both') => {
    onSelectRole(role);
  };

  const handleSignIn = () => {
    navigate('/auth');
  };

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-stitch-bg-light dark:bg-stitch-bg-dark overflow-x-hidden font-display">
      {/* Header Image */}
      <div className="@container">
        <div className="@[480px]:px-4 @[480px]:py-3 p-0">
          <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden min-h-[320px] sm:min-h-[400px] @[480px]:rounded-3xl relative"
            style={{
              backgroundImage: 'url("https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&h=400&fit=crop")'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent @[480px]:rounded-3xl"></div>
          </div>
        </div>
      </div>

      {/* Headline Text */}
      <h1 className="text-stitch-text-primary-light dark:text-stitch-text-primary-dark tracking-tight text-[32px] sm:text-4xl font-bold leading-tight px-4 text-center pb-3 pt-6">
        {t('auth.joinOurPack')}
      </h1>

      {/* Button Group */}
      <div className="flex justify-center">
        <div className="flex flex-1 gap-4 max-w-[480px] flex-col items-stretch px-4 py-3">
          <button
            onClick={() => handleRoleSelect('owner')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-auto px-6 py-5 bg-stitch-primary text-white text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-2 text-center hover:bg-stitch-primary/90 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <div className="flex items-center gap-3">
              <span 
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
              >
                pets
              </span>
              <span className="truncate text-xl">{t('auth.dogOwner')}</span>
            </div>
            <p className="text-sm font-normal text-white/90">
              {t('auth.findTrustedSitters')}
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect('walker')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-2xl h-auto px-6 py-5 bg-stitch-secondary text-white text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-2 text-center hover:bg-stitch-secondary/90 hover:shadow-lg transition-all duration-300 shadow-md"
          >
            <div className="flex items-center gap-3">
              <span 
                className="material-symbols-outlined text-3xl"
                style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
              >
                hiking
              </span>
              <span className="truncate text-xl">{t('auth.sitter')}</span>
            </div>
            <p className="text-sm font-normal text-white/90">
              {t('auth.earnMoneyLoving')}
            </p>
          </button>
        </div>
      </div>

      {/* Meta Text */}
      <p className="text-stitch-text-secondary-light dark:text-stitch-text-secondary-dark text-sm font-normal leading-normal pb-6 pt-5 px-4 text-center">
        {t('auth.alreadyHaveAccount')} <button onClick={handleSignIn} className="font-bold underline text-stitch-primary dark:text-stitch-secondary hover:opacity-80 transition-opacity">{t('auth.signIn')}</button>
      </p>

      {/* Footer with Logo */}
      <footer className="mt-auto px-4 py-8 flex justify-center items-center">
        <div className="flex items-center gap-2 text-stitch-text-primary-light dark:text-stitch-text-primary-dark">
          <span 
            className="material-symbols-outlined text-stitch-primary dark:text-stitch-secondary text-2xl"
            style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}
          >
            pets
          </span>
          <span className="font-bold text-xl">Paseo Amigo</span>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;

