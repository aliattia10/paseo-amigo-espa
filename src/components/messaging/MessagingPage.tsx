import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { WalkRequest } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import BottomNavigation from '@/components/ui/BottomNavigation';

const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedChat, setSelectedChat] = useState<{
    walkRequest: WalkRequest | null;
    otherUser: { id: string; name: string; profileImage?: string; role?: string };
    matchId?: string;
  } | null>(null);

  const handleSelectChat = (walkRequest: WalkRequest | null, otherUser: { id: string; name: string; profileImage?: string; role?: string }, matchId?: string) => {
    setSelectedChat({ walkRequest, otherUser, matchId });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="min-h-screen bg-stitch-bg-light pb-20 max-w-md mx-auto">
      {/* Enhanced Header */}
      <div className="bg-stitch-card-light shadow-md border-b border-stitch-border-light sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="hover:bg-stitch-bg-light rounded-xl"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-stitch-primary to-stitch-secondary rounded-2xl flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-white text-xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>chat_bubble</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-stitch-text-primary-light font-display">
                    {t('dashboard.messages')}
                  </h1>
                  <p className="text-sm text-stitch-text-secondary-light">{t('dashboard.connectCommunity')}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-xl text-sm font-medium shadow-sm">
                Active
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {/* Chat List or Chat Window - Mobile Style */}
        {selectedChat ? (
          <ChatWindow
            walkRequest={selectedChat.walkRequest}
            otherUser={selectedChat.otherUser}
            matchId={selectedChat.matchId}
            onClose={handleCloseChat}
          />
        ) : (
          <ChatList onSelectChat={handleSelectChat} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default MessagingPage;
