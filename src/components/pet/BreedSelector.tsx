import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Popular dog breeds
export const DOG_BREEDS = [
  'Labrador Retriever', 'German Shepherd', 'Golden Retriever',
  'French Bulldog', 'Bulldog', 'Poodle', 'Beagle', 'Rottweiler',
  'German Shorthaired Pointer', 'Yorkshire Terrier', 'Boxer',
  'Dachshund', 'Siberian Husky', 'Great Dane', 'Doberman Pinscher',
  'Border Collie', 'Australian Shepherd', 'Shih Tzu', 'Chihuahua',
  'Mixed Breed', 'Other'
];

// Popular cat breeds
export const CAT_BREEDS = [
  'Domestic Shorthair', 'Domestic Longhair', 'Siamese', 'Maine Coon',
  'Persian', 'Ragdoll', 'Bengal', 'British Shorthair', 'Abyssinian',
  'Scottish Fold', 'Sphynx', 'Russian Blue', 'American Shorthair',
  'Oriental', 'Birman', 'Norwegian Forest Cat', 'Turkish Angora',
  'Mixed Breed', 'Other'
];

interface BreedSelectorProps {
  petType: 'dog' | 'cat';
  value: string;
  onChange: (breed: string) => void;
  required?: boolean;
}

const BreedSelector: React.FC<BreedSelectorProps> = ({ petType, value, onChange, required }) => {
  const breeds = petType === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        Breed {required && <span className="text-red-500">*</span>}
      </label>
      <Select value={value} onValueChange={onChange} required={required}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={`Select ${petType} breed`} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          {breeds.map((breed) => (
            <SelectItem key={breed} value={breed}>
              {breed}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default BreedSelector;

