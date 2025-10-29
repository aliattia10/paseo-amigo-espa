import React, { useState } from 'react';

interface TinderProfileViewProps {
  photos: string[];
  name: string;
  onEditClick?: () => void;
}

const TinderProfileView: React.FC<TinderProfileViewProps> = ({ 
  photos, 
  name,
  onEditClick 
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Parse photos if it's a JSON string
  let photoArray: string[] = [];
  try {
    if (typeof photos === 'string') {
      photoArray = JSON.parse(photos);
    } else if (Array.isArray(photos)) {
      photoArray = photos;
    }
  } catch {
    photoArray = photos ? [photos as any] : [];
  }

  // Filter out empty photos
  photoArray = photoArray.filter(p => p);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < photoArray.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handlePrevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  const handleNextImage = () => {
    if (currentImageIndex < photoArray.length - 1) {
      setCurrentImageIndex(currentImageIndex + 1);
    }
  };

  if (photoArray.length === 0) {
    return (
      <div className="relative w-full aspect-[3/4] bg-gradient-to-br from-primary/20 to-secondary/20 rounded-3xl overflow-hidden border-2 border-dashed border-primary/30">
        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-6xl text-white">
              person
            </span>
          </div>
          <p className="text-text-primary-light dark:text-text-primary-dark font-bold text-lg mb-2">{name}</p>
          <p className="text-text-secondary-light dark:text-text-secondary-dark text-sm mb-4">No photos yet</p>
          {onEditClick && (
            <button
              onClick={onEditClick}
              className="bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined">add_photo_alternate</span>
              Add Photos
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-black">
      {/* Image Progress Bars - Tinder Style */}
      {photoArray.length > 1 && (
        <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
          {photoArray.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  index === currentImageIndex ? 'w-full' : index < currentImageIndex ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>
      )}

      {/* Main Image */}
      <img
        src={photoArray[currentImageIndex]}
        alt={`${name} - Photo ${currentImageIndex + 1}`}
        className="w-full h-full object-cover"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      />

      {/* Tap zones for navigation (invisible) */}
      {photoArray.length > 1 && (
        <>
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={handlePrevImage}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
            onClick={handleNextImage}
          />
        </>
      )}

      {/* Navigation Arrows (desktop) */}
      {photoArray.length > 1 && (
        <>
          {currentImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
          )}
          {currentImageIndex < photoArray.length - 1 && (
            <button
              onClick={handleNextImage}
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 z-10 transition-colors"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          )}
        </>
      )}

      {/* Edit Button - Moved to top right */}
      {onEditClick && (
        <button
          onClick={onEditClick}
          className="absolute top-14 right-4 bg-white/90 dark:bg-gray-800/90 text-primary rounded-full p-2 shadow-lg hover:scale-110 transition-transform z-20 backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-lg">edit</span>
        </button>
      )}

      {/* Photo Counter */}
      {photoArray.length > 1 && (
        <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm z-20">
          {currentImageIndex + 1} / {photoArray.length}
        </div>
      )}

      {/* Favorite Badge (first photo) */}
      {currentImageIndex === 0 && (
        <div className="absolute top-14 left-4 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20 flex items-center gap-1">
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: '"FILL" 1' }}>
            favorite
          </span>
          Main Photo
        </div>
      )}
    </div>
  );
};

export default TinderProfileView;
