import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { WalkRequest } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';

const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<{
    walkRequest: WalkRequest;
    otherUser: { id: string; name: string; profileImage?: string };
  } | null>(null);

  const handleSelectChat = (walkRequest: WalkRequest, otherUser: { id: string; name: string; profileImage?: string }) => {
    setSelectedChat({ walkRequest, otherUser });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  return (
    <div className="min-h-screen bg-stitch-bg-light">
      {/* Enhanced Header */}
      <div className="bg-stitch-card-light shadow-md border-b border-stitch-border-light sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
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
                    Mensajes
                  </h1>
                  <p className="text-sm text-stitch-text-secondary-light">Conecta con tu comunidad</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 bg-green-100 text-green-800 rounded-xl text-sm font-medium shadow-sm">
                Activo
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chat List */}
          <div className={`${selectedChat ? 'hidden lg:block' : ''}`}>
            <ChatList onSelectChat={handleSelectChat} />
          </div>

          {/* Chat Window */}
          <div className={`${selectedChat ? 'block' : 'hidden lg:block'}`}>
            {selectedChat ? (
              <ChatWindow
                walkRequest={selectedChat.walkRequest}
                otherUser={selectedChat.otherUser}
                onClose={handleCloseChat}
              />
            ) : (
              <Card className="h-[600px] flex items-center justify-center rounded-3xl shadow-lg border-0">
                <CardContent className="text-center">
                  <span className="material-symbols-outlined text-7xl text-stitch-text-secondary-light mx-auto mb-6 block">chat_bubble_outline</span>
                  <h3 className="text-lg font-bold mb-2 font-display text-stitch-text-primary-light">Selecciona una conversación</h3>
                  <p className="text-stitch-text-secondary-light">
                    Elige una conversación de la lista para comenzar a chatear
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
