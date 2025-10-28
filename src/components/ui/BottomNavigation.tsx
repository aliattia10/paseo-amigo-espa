import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface BottomNavigationProps {
  unreadCount?: number;
  unreadNotifications?: number;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ unreadCount = 0, unreadNotifications = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-10 bg-card-light/90 dark:bg-card-dark/90 border-t border-border-light dark:border-border-dark backdrop-blur-sm">
      <div className="flex justify-around items-center h-16 px-2 max-w-md mx-auto">
        <button 
          onClick={() => navigate('/dashboard')} 
          className={`flex flex-col items-center justify-center p-2 ${
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
          className={`flex flex-col items-center justify-center relative p-2 ${
            isActive('/messages') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
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
          onClick={() => navigate('/bookings')} 
          className={`flex flex-col items-center justify-center p-2 ${
            isActive('/bookings') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          <span 
            className="material-symbols-outlined text-2xl"
            style={isActive('/bookings') ? { fontVariationSettings: '"FILL" 1' } : {}}
          >
            event
          </span>
          <span className={`text-xs ${isActive('/bookings') ? 'font-bold' : 'font-medium'}`}>
            Bookings
          </span>
        </button>

        <button 
          onClick={() => navigate('/notifications')} 
          className={`flex flex-col items-center justify-center relative p-2 ${
            isActive('/notifications') 
              ? 'text-home-primary' 
              : 'text-text-secondary-light dark:text-text-secondary-dark'
          }`}
        >
          {unreadNotifications > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold text-[10px]">
              {unreadNotifications > 9 ? '9+' : unreadNotifications}
            </span>
          )}
          <span 
            className="material-symbols-outlined text-2xl"
            style={isActive('/notifications') ? { fontVariationSettings: '"FILL" 1' } : {}}
          >
            notifications
          </span>
          <span className={`text-xs ${isActive('/notifications') ? 'font-bold' : 'font-medium'}`}>
            Notifications
          </span>
        </button>

        <button 
          onClick={() => navigate('/profile')} 
          className={`flex flex-col items-center justify-center p-2 ${
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
