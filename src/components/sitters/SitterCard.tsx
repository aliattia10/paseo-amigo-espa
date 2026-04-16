import React from 'react';
import { Star, Heart } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export interface SitterCardProps {
  name: string;
  profileImage?: string | null;
  rating?: number | null;
  petsCaredFor?: number | null;
  yearsExperience?: number | null;
  sitterAge?: number | null;
  bio?: string | null;
  hobbies?: string[] | null;
  hourlyRate?: number | null;
  verified?: boolean;
  className?: string;
}

const MAX_BIO_LINES = 2;
const MAX_HOBBIES = 3;

const SitterCard: React.FC<SitterCardProps> = ({
  name,
  profileImage,
  rating = null,
  petsCaredFor = null,
  yearsExperience = null,
  sitterAge = null,
  bio = '',
  hobbies = [],
  hourlyRate = null,
  verified = false,
  className = '',
}) => {
  const displayRating = rating != null ? Number(rating).toFixed(1) : '—';
  const displayPets = petsCaredFor != null && petsCaredFor > 0 ? `${petsCaredFor}+ Pets Cared For` : null;
  const topHobbies = (Array.isArray(hobbies) ? hobbies : []).slice(0, MAX_HOBBIES);
  const bioTruncated = bio
    ? bio.split('\n').slice(0, MAX_BIO_LINES).join(' ').slice(0, 120) + (bio.length > 120 ? '…' : '')
    : '';

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${className}`}
    >
      <div className="p-5 flex gap-4">
        <Avatar className="h-16 w-16 rounded-xl shrink-0 ring-2 ring-gray-100 dark:ring-gray-700">
          <AvatarImage src={profileImage || undefined} alt={name} />
          <AvatarFallback className="rounded-xl bg-sage-green/20 text-medium-jungle dark:bg-sage-green/30 dark:text-sage-green text-lg">
            {name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{name}</h3>
            {verified && (
              <span className="inline-flex items-center rounded-full bg-green-100 dark:bg-green-900/30 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                Verified
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Star className="h-4 w-4 fill-current" />
              <span className="font-semibold text-sm">{displayRating}</span>
            </span>
            {displayPets && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {displayPets}
              </span>
            )}
            {yearsExperience != null && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {yearsExperience}y exp
              </span>
            )}
            {sitterAge != null && (
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                Age {sitterAge}
              </span>
            )}
            {hourlyRate != null && (
              <span className="text-sm font-medium text-medium-jungle dark:text-sage-green">
                €{Number(hourlyRate).toFixed(0)}/hr
              </span>
            )}
          </div>
          {bioTruncated && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
              {bioTruncated}
            </p>
          )}
          {topHobbies.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {topHobbies.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center gap-1 rounded-full bg-sage-green/15 dark:bg-sage-green/25 px-2.5 py-0.5 text-xs font-medium text-medium-jungle dark:text-sage-green"
                >
                  <Heart className="h-3 w-3" />
                  {h}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SitterCard;
