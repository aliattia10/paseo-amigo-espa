import React from 'react';

const MOOD_STYLES: Record<string, { bg: string; emoji: string }> = {
  Happy: { bg: 'bg-green-500/90', emoji: '🟢' },
  Sleepy: { bg: 'bg-amber-500/90', emoji: '🟡' },
  Energetic: { bg: 'bg-blue-500/90', emoji: '🔵' },
  Calm: { bg: 'bg-violet-500/90', emoji: '🟣' },
  Playful: { bg: 'bg-rose-500/90', emoji: '🔴' },
  Anxious: { bg: 'bg-orange-500/90', emoji: '🟠' },
};

export interface PetCardProps {
  name: string;
  breed?: string | null;
  imageUrl?: string | null;
  mood?: string | null;
  personalityTags?: string[] | null;
  onMoodClick?: () => void;
  className?: string;
}

const PetCard: React.FC<PetCardProps> = ({
  name,
  breed,
  imageUrl,
  mood = null,
  personalityTags = [],
  onMoodClick,
  className = '',
}) => {
  const moodStyle = mood && MOOD_STYLES[mood] ? MOOD_STYLES[mood] : { bg: 'bg-gray-500/90', emoji: '⚪' };
  const tags = Array.isArray(personalityTags) ? personalityTags.slice(0, 4) : [];

  return (
    <div
      className={`rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden transition-shadow hover:shadow-xl ${className}`}
    >
      {/* Cover image */}
      <div className="relative aspect-[4/3] bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-40">
            🐕
          </div>
        )}
        {/* Gradient overlay at bottom for text */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        {/* Name + Breed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-bold text-xl text-white drop-shadow-md">{name}</h3>
          {breed && (
            <p className="text-sm text-white/90 drop-shadow">{breed}</p>
          )}
        </div>
        {/* Mood pill: top-right */}
        <div className="absolute top-3 right-3">
          <button
            type="button"
            onClick={onMoodClick}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-lg ${moodStyle.bg} hover:opacity-90 transition-opacity`}
          >
            <span>{moodStyle.emoji}</span>
            <span>{mood || 'Set mood'}</span>
          </button>
        </div>
      </div>
      {/* Personality tags */}
      {tags.length > 0 && (
        <div className="p-3 flex flex-wrap gap-2 border-t border-gray-100 dark:border-gray-700">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default PetCard;
