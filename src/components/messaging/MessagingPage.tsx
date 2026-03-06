import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import ChatList from './ChatList';
import ChatWindow from './ChatWindow';
import type { WalkRequest } from '@/types';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';

const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  const [selectedChat, setSelectedChat] = useState<{
    walkRequest: WalkRequest | null;
    otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number };
    matchId?: string;
  } | null>(null);

  const handleSelectChat = (walkRequest: WalkRequest | null, otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number }, matchId?: string) => {
    setSelectedChat({ walkRequest, otherUser, matchId });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const markAllMessagesRead = async () => {
    if (!currentUser) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true, is_read: true })
        .eq('user_id', currentUser.id)
        .eq('type', 'message');
      toast({ title: t('common.success'), description: t('notifications.allRead', 'All marked as read') });
    } catch {
      toast({ title: t('common.error'), description: 'Failed', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-stitch-bg-light dark:bg-background-dark pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="bg-stitch-card-light dark:bg-card-dark shadow-md border-b border-stitch-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/dashboard')}
                className="rounded-xl"
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </Button>
              <h1 className="text-xl font-bold text-stitch-text-primary-light dark:text-text-primary-dark font-display">
                {t('dashboard.messages')}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllMessagesRead}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-xs font-medium"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
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
      <BottomNavigation unreadNotifications={unreadNotifications} />
    </div>
  );
};

export default MessagingPage;
