import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { WalkRequest } from '@/types';

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
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-terracotta" />
              <h1 className="text-xl font-semibold">Mensajes</h1>
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
              <Card className="h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Selecciona una conversación</h3>
                  <p className="text-muted-foreground">
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
