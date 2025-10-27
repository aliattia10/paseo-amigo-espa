import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';
import { Languages, Check } from 'lucide-react';

interface LanguageSwitcherProps {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'ghost', 
  size = 'icon',
  showLabel = false 
}) => {
  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  const [open, setOpen] = useState(false);

  const getCurrentLanguageData = () => {
    return availableLanguages.find(lang => lang.code === currentLanguage) || availableLanguages[1];
  };

  const currentLang = getCurrentLanguageData();

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className="relative"
          title="Change Language"
        >
          {showLabel ? (
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentLang.flag}</span>
              <span className="text-sm font-medium">{currentLang.name}</span>
            </div>
          ) : (
            <>
              <Languages className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 text-xs">{currentLang.flag}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {availableLanguages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => {
              changeLanguage(language.code);
              setOpen(false);
            }}
            className="cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{language.flag}</span>
              <span>{language.name}</span>
            </div>
            {currentLanguage === language.code && (
              <Check className="w-4 h-4 text-green-600" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

