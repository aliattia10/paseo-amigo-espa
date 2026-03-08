import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    id: string;
    name: string;
    imageUrl: string;
  };
  petType?: 'dog' | 'cat';
  /** Pass from parent so avatar is correct even before userProfile is loaded */
  currentUserName?: string;
  currentUserImageUrl?: string;
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, matchedUser, petType = 'dog', currentUserName, currentUserImageUrl }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { userProfile, loading: authLoading } = useAuth();

  if (!isOpen) return null;

  const handleSendMessage = () => {
    // Pass matched user in state so Messages page can show the conversation immediately
    // without waiting for a matches list re-fetch (avoids race / empty list).
    navigate(`/messages?userId=${matchedUser.id}`, {
      state: {
        openMatch: {
          id: matchedUser.id,
          name: matchedUser.name,
          imageUrl: matchedUser.imageUrl,
        },
      },
    });
    onClose();
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  const matchTitle = petType === 'cat' ? 'Meow! 🐱' : 'Woof! 🐾';

  // Current user's display name and image: prefer props from parent, then userProfile
  const displayName = currentUserName ?? userProfile?.name ?? '';
  let currentUserImage = currentUserImageUrl ?? '';
  if (!currentUserImage && userProfile?.profileImage) {
    try {
      const parsed = typeof userProfile.profileImage === 'string' ? JSON.parse(userProfile.profileImage) : userProfile.profileImage;
      currentUserImage = Array.isArray(parsed) ? parsed[0] : (userProfile.profileImage as string);
    } catch {
      currentUserImage = userProfile.profileImage as string;
    }
  }

  const showCurrentUserSkeleton = authLoading || (!currentUserImage && !displayName && !currentUserImageUrl && !currentUserName);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md"
      onClick={handleKeepSwiping}
    >
      <div
        className="relative w-full max-w-sm mx-4 flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        <h1 className="text-5xl font-extrabold text-white mb-1 animate-bounce drop-shadow-lg">
          {matchTitle}
        </h1>
        <p className="text-white/90 text-lg font-semibold mb-6">
          {t('match.itsAMatch', "It's a Match!")}
        </p>

        {/* Two round profile images side by side */}
        <div className="relative flex items-center justify-center gap-0 mb-8 w-full">
          {/* Current user */}
          <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200 flex-shrink-0 translate-x-3">
            {showCurrentUserSkeleton ? (
              <div className="w-full h-full animate-pulse bg-gray-300 dark:bg-gray-600" aria-hidden />
            ) : currentUserImage ? (
              <img src={currentUserImage} alt={t('common.you', 'You')} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-400 to-teal-500 text-white text-4xl font-bold">
                {(displayName || t('common.you', 'You')).charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          {/* Heart between */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-full w-12 h-12 flex items-center justify-center shadow-xl animate-pulse">
              <span className="material-symbols-outlined text-white text-2xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                favorite
              </span>
            </div>
          </div>

          {/* Matched user */}
          <div className="relative z-10 w-32 h-32 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gray-200 flex-shrink-0 -translate-x-3">
            <img
              src={matchedUser.imageUrl}
              alt={matchedUser.name}
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400'; }}
            />
          </div>
        </div>

        {/* Message card */}
        <div className="bg-white rounded-2xl p-5 shadow-2xl mb-5 w-full">
          <p className="text-center text-gray-800 text-base font-medium mb-1">
            {t('match.youAnd', 'You and')} <span className="font-bold text-medium-jungle">{matchedUser.name}</span> {t('match.likedEachOther', 'liked each other!')}
          </p>
          <p className="text-center text-gray-500 text-sm">
            {t('match.startConversation', 'Start a conversation and plan your first walk together.')}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-medium-jungle to-sage-green text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-xl">chat_bubble</span>
              {t('match.sendMessage', 'Send Message')}
            </span>
          </button>

          <button
            onClick={handleKeepSwiping}
            className="w-full bg-white/15 text-white font-medium py-3 px-6 rounded-xl backdrop-blur-sm hover:bg-white/25 transition-all"
          >
            {t('match.keepSwiping', 'Keep Swiping')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
