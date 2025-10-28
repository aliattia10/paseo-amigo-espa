import React from 'react';
import { useNavigate } from 'react-router-dom';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchedUser: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

const MatchModal: React.FC<MatchModalProps> = ({ isOpen, onClose, matchedUser }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSendMessage = () => {
    navigate(`/messages?userId=${matchedUser.id}`);
    onClose();
  };

  const handleKeepSwiping = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md mx-4 animate-in zoom-in duration-500">
        {/* Woof Woof! Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold text-white mb-2 animate-bounce">
            Woof Woof! 🐾
          </h1>
          <p className="text-white text-xl font-medium">
            It's a Match!
          </p>
        </div>

        {/* Profile Images */}
        <div className="relative h-64 mb-8">
          {/* Left Profile */}
          <div className="absolute left-0 top-0 w-48 h-64 transform -rotate-6 transition-transform hover:rotate-0">
            <div 
              className="w-full h-full rounded-2xl bg-cover bg-center shadow-2xl border-4 border-white"
              style={{
                backgroundImage: `url("https://api.dicebear.com/7.x/avataaars/svg?seed=user")`
              }}
            />
          </div>

          {/* Right Profile */}
          <div className="absolute right-0 top-0 w-48 h-64 transform rotate-6 transition-transform hover:rotate-0">
            <div 
              className="w-full h-full rounded-2xl bg-cover bg-center shadow-2xl border-4 border-white"
              style={{
                backgroundImage: `url("${matchedUser.imageUrl}")`
              }}
            />
          </div>

          {/* Heart Icon in Center */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-gradient-to-br from-pink-500 to-red-500 rounded-full p-4 shadow-2xl animate-pulse">
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>
                favorite
              </span>
            </div>
          </div>
        </div>

        {/* Match Message */}
        <div className="bg-white rounded-2xl p-6 shadow-2xl mb-6">
          <p className="text-center text-gray-800 text-lg font-medium mb-2">
            You and <span className="font-bold text-primary">{matchedUser.name}</span> liked each other!
          </p>
          <p className="text-center text-gray-600 text-sm">
            Start a conversation and plan your first walk together.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSendMessage}
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="material-symbols-outlined">chat_bubble</span>
              Send Message
            </span>
          </button>
          
          <button
            onClick={handleKeepSwiping}
            className="w-full bg-white/20 text-white font-medium py-4 px-6 rounded-xl backdrop-blur-sm hover:bg-white/30 transition-all duration-200"
          >
            Keep Swiping
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchModal;
