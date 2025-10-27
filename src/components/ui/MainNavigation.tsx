import React from 'react';
import { Home, MessageCircle, Activity, User, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface MainNavigationProps {
  activeTab: 'home' | 'messages' | 'feed' | 'nearby' | 'profile';
  onTabChange: (tab: 'home' | 'messages' | 'feed' | 'nearby' | 'profile') => void;
  unreadMessagesCount?: number;
  newMatchesCount?: number;
}

const MainNavigation: React.FC<MainNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  unreadMessagesCount = 0,
  newMatchesCount = 0
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'home' as const,
      icon: Home,
      label: t('nav.discover'),
      badge: null,
    },
    {
      id: 'nearby' as const,
      icon: MapPin,
      label: t('nav.nearby'),
      badge: null,
    },
    {
      id: 'messages' as const,
      icon: MessageCircle,
      label: t('nav.messages'),
      badge: unreadMessagesCount + newMatchesCount,
    },
    {
      id: 'feed' as const,
      icon: Activity,
      label: t('nav.feed'),
      badge: null,
    },
    {
      id: 'profile' as const,
      icon: User,
      label: t('nav.profile'),
      badge: null,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center flex-1 h-full relative transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
                  {tab.badge !== null && tab.badge > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs mt-1 font-medium ${isActive ? 'text-blue-600' : ''}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default MainNavigation;

