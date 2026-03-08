import React from 'react';
import { useTranslation } from 'react-i18next';

interface PetTypeSelectorProps {
  value: 'dog' | 'cat';
  onChange: (type: 'dog' | 'cat') => void;
  disabled?: boolean;
}

const PetTypeSelector: React.FC<PetTypeSelectorProps> = ({ value, onChange, disabled }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => onChange('dog')}
        disabled={disabled}
        className={`p-6 rounded-xl border-2 transition-all text-center ${
          value === 'dog'
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="text-4xl mb-2 block">🐕</span>
        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{t('pet.dog')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('pet.dogDesc')}</p>
      </button>
      
      <button
        type="button"
        onClick={() => onChange('cat')}
        disabled={disabled}
        className={`p-6 rounded-xl border-2 transition-all text-center ${
          value === 'cat'
            ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <span className="text-4xl mb-2 block">🐱</span>
        <h3 className="font-bold text-text-primary-light dark:text-text-primary-dark">{t('pet.cat')}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('pet.catDesc')}</p>
      </button>
    </div>
  );
};

export default PetTypeSelector;

