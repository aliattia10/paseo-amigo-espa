import React from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN', flag: '🇬🇧' },
    { code: 'es', label: 'ES', flag: '🇪🇸' },
    { code: 'fr', label: 'FR', flag: '🇫🇷' },
  ];

  const currentIndex = languages.findIndex(lang => lang.code === i18n.language);
  const currentLanguage = languages[currentIndex] || languages[0];
  const nextLanguage = languages[(currentIndex + 1) % languages.length];

  const toggleLanguage = () => {
    i18n.changeLanguage(nextLanguage.code);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-card-light dark:bg-card-dark hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Switch language"
      title={`Switch to ${nextLanguage.label}`}
    >
      <Globe className="w-5 h-5" />
      <span className="text-sm font-medium">
        {currentLanguage.label}
      </span>
    </button>
  );
};

export default LanguageSwitcher;
