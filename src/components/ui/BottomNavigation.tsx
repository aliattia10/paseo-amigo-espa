import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  unreadCount?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ unreadCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card-light/90 dark:bg-card-dark/90 border-t border-border-light dark:border-border-dark backdrop-blur-sm">
      <div className="flex justify-around items-center h-16 px-4 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className={`flex flex-col items-center justify-center ${
            isActive('/dashboard') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          <span 
            className="material-symbols-outlined text-2xl" 
            style={isActive('/dashboard') ? { fontVariationSettings: '"FILL" 1' } : {}}
          >
            home
          </span>
          <span className={`text-xs ${isActive('/dashboard') ? 'font-bold' : 'font-medium'}`}>
            {t('nav.home')}
          </span>
        </button>

        <button 
          onClick={() => navigate('/messages')} 
          className={`flex flex-col items-center justify-center relative ${
            isActive('/messages') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          {unreadCount > 0 && (
            <span className="absolute top-0 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <span 
            className="material-symbols-outlined text-2xl"
            style={isActive('/messages') ? { fontVariationSettings: '"FILL" 1' } : {}}
          >
            chat_bubble
          </span>
          <span className={`text-xs ${isActive('/messages') ? 'font-bold' : 'font-medium'}`}>
            {t('nav.messages')}
          </span>
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          className={`flex flex-col items-center justify-center ${
            isActive('/profile') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          <span 
            className="material-symbols-outlined text-2xl"
            style={isActive('/profile') ? { fontVariationSettings: '"FILL" 1' } : {}}
          >
            person
          </span>
          <span className={`text-xs ${isActive('/profile') ? 'font-bold' : 'font-medium'}`}>
            {t('nav.profile')}
          </span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
