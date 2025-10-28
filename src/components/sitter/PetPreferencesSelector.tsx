import React from 'react';

interface PetPreferencesSelectorProps {
  dogs: boolean;
  cats: boolean;
  onDogsChange: (dogs: boolean) => void;
  onCatsChange: (cats: boolean) => void;
}

const PetPreferencesSelector: React.FC<PetPreferencesSelectorProps> = ({
  dogs,
  cats,
  onDogsChange,
  onCatsChange,
}) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        Pet Preferences <span className="text-red-500">*</span>
      </label>
      <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark mb-3">
        Select which types of pets you're comfortable caring for
      </p>
      
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onDogsChange(!dogs)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            dogs
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700'
          } hover:border-blue-400 cursor-pointer`}
        >
          <span className="text-3xl mb-2 block">🐕</span>
          <h3 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">Dogs</h3>
          {dogs && (
            <div className="mt-2">
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Selected</span>
            </div>
          )}
        </button>
        
        <button
          type="button"
          onClick={() => onCatsChange(!cats)}
          className={`p-4 rounded-xl border-2 transition-all text-center ${
            cats
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-700'
          } hover:border-blue-400 cursor-pointer`}
        >
          <span className="text-3xl mb-2 block">🐱</span>
          <h3 className="font-semibold text-sm text-text-primary-light dark:text-text-primary-dark">Cats</h3>
          {cats && (
            <div className="mt-2">
              <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded-full">Selected</span>
            </div>
          )}
        </button>
      </div>
      
      {!dogs && !cats && (
        <p className="text-xs text-red-500 mt-2">Please select at least one pet type</p>
      )}
    </div>
  );
};

export default PetPreferencesSelector;

