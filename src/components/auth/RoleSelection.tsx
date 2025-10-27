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
    <div className="relative flex h-auto min-h-screen w-full flex-col bg-role-background-light dark:bg-role-background-dark group/design-root overflow-x-hidden font-display">
      {/* HeaderImage - Optimized for all screen sizes */}
      <div className="w-full max-w-screen-lg mx-auto">
        <div className="px-0 lg:px-4 py-0 lg:py-3">
          <div 
            className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden h-[280px] sm:h-[320px] md:h-[360px] lg:h-[400px] xl:h-[420px] md:rounded-xl"
            style={{
              backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD93viIT4Ghhf1VG1D8PYYwYimCdpsbpjM9NS7k6ZnaPGsxj6E-yWvM_UrLx8ujZUCh-u5R-e73W_azi9i7Ufn2NVv3a7Wfv4HOUAbE333PbSDN8ep0DlTkPbQzDVYPXfyYD8jSm021R29NvDACtGT_BfxzBosbmk66FNPzpFmXotU1RZ1gIVJp4B371n7Q_Gb7C4CdBm2pfIqnF-fB0gGhsGQ_nIilKq7o0J0PErXbxcQxtfeDeJk4ac4v59_7f4yapDiCSsFhaqU")',
              backgroundPosition: 'center 25%',
              backgroundSize: 'cover'
            }}
          ></div>
        </div>
      </div>

      {/* HeadlineText */}
      <h1 className="text-role-text-light dark:text-role-text-dark tracking-tight text-[32px] font-bold leading-tight px-4 text-center pb-3 pt-6">
        Join Paseo
      </h1>

      {/* ButtonGroup */}
      <div className="flex justify-center">
        <div className="flex flex-1 gap-4 max-w-[480px] flex-col items-stretch px-4 py-3">
          <button
            onClick={() => handleRoleSelect('owner')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-auto px-5 py-4 bg-role-primary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-1 text-center hover:opacity-90 transition-opacity"
          >
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">pets</span>
              <span className="truncate text-lg">Dog Owner</span>
            </div>
            <p className="text-sm font-normal text-role-background-dark/80">
              Find trusted sitters for your best friend.
            </p>
          </button>

          <button
            onClick={() => handleRoleSelect('walker')}
            className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-auto px-5 py-4 bg-role-button-secondary dark:bg-role-button-secondary text-role-background-dark text-base font-bold leading-normal tracking-[0.015em] w-full flex-col gap-1 text-center hover:opacity-90 transition-opacity"
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
        Already have an account? <button onClick={handleSignIn} className="font-bold underline text-role-primary">Sign In</button>
      </p>

      {/* Footer with Logo */}
      <footer className="mt-auto px-4 py-6 flex justify-center items-center">
        <div className="flex items-center gap-2 text-role-text-light dark:text-role-text-dark">
          <span className="material-symbols-outlined text-role-primary">footprint</span>
          <span className="font-bold text-lg">Pawsitively</span>
        </div>
      </footer>
    </div>
  );
};

export default RoleSelection;

