import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
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

type OpenMatchState = {
  openMatch: { id: string; name: string; imageUrl: string };
};

const MessagingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  const stateConsumedRef = useRef(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [selectedChat, setSelectedChat] = useState<{
    walkRequest: WalkRequest | null;
    otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number };
    matchId?: string;
  } | null>(null);

  // 1) Optimistic open from match modal: use navigation state so the conversation shows immediately
  useEffect(() => {
    const state = location.state as OpenMatchState | null;
    const openMatch = state?.openMatch;
    if (!currentUser?.id || !openMatch || openMatch.id === currentUser.id || stateConsumedRef.current) return;

    stateConsumedRef.current = true;
    setSelectedChat({
      walkRequest: null,
      otherUser: {
        id: openMatch.id,
        name: openMatch.name,
        profileImage: openMatch.imageUrl,
        role: undefined,
        hourlyRate: undefined,
      },
      matchId: undefined,
    });
    setSearchParams({}, { replace: true });
    navigate(location.pathname, { replace: true, state: {} });
  }, [currentUser?.id, location.state, location.pathname, navigate, setSearchParams]);

  // 2) Resolve matchId when we have selectedChat from state but no matchId yet (so ChatWindow can load/send messages)
  useEffect(() => {
    if (!currentUser?.id || !selectedChat?.otherUser || selectedChat.matchId != null) return;

    const uid = String(currentUser.id).trim();
    const otherId = selectedChat.otherUser.id;
    if (!uid || !otherId) return;
    let cancelled = false;

    const resolve = async () => {
      try {
        let matchesList: any[] | null = null;
        const { data: dataB, error: errB } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id')
          .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);
        if (errB?.code === '42703' || errB?.status === 400 || (errB?.message && String(errB.message).includes('user1_id'))) {
          const { data: dataA } = await supabase
            .from('matches')
            .select('id, user_id, matched_user_id')
            .or(`user_id.eq.${uid},matched_user_id.eq.${uid}`);
          matchesList = dataA ?? null;
          const match = matchesList?.find(
            (m: any) =>
              (m.user_id === uid && m.matched_user_id === otherId) || (m.matched_user_id === uid && m.user_id === otherId)
          );
          if (cancelled || !match?.id) return;
          setSelectedChat((prev) =>
            prev && prev.otherUser.id === otherId ? { ...prev, matchId: match.id } : prev
          );
          return;
        }
        matchesList = dataB ?? null;
        const match = matchesList?.find(
          (m: any) =>
            (m.user1_id === uid && m.user2_id === otherId) || (m.user1_id === otherId && m.user2_id === uid)
        );
        if (cancelled || !match?.id) return;
        setSelectedChat((prev) =>
          prev && prev.otherUser.id === otherId ? { ...prev, matchId: match.id } : prev
        );
      } catch (e) {
        if (import.meta.env.DEV) console.error('Resolve matchId:', e);
      }
    };

    resolve();
    return () => { cancelled = true; };
  }, [currentUser?.id, selectedChat?.otherUser?.id, selectedChat?.matchId]);

  // 3) Fallback: open by userId only when no state was passed (e.g. direct link)
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!currentUser?.id || !userId || userId === currentUser.id) return;
    if ((location.state as OpenMatchState)?.openMatch?.id === userId) return; // already opened from modal state
    if (selectedChat?.otherUser?.id === userId) return;

    const openChatForUser = async () => {
      try {
        const uid = String(currentUser.id).trim();
        let matchesList: any[] | null = null;
        const { data: dataB, error: errB } = await supabase
          .from('matches')
          .select('id, user1_id, user2_id')
          .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);
        if (errB?.code === '42703' || errB?.status === 400 || (errB?.message && String(errB.message).includes('user1_id'))) {
          const { data: dataA } = await supabase
            .from('matches')
            .select('id, user_id, matched_user_id')
            .or(`user_id.eq.${uid},matched_user_id.eq.${uid}`);
          matchesList = dataA ?? null;
        } else {
          matchesList = dataB ?? null;
        }
        const match = matchesList?.find((m: any) => {
          if (m.user_id != null) {
            return (m.user_id === uid && m.matched_user_id === userId) || (m.matched_user_id === uid && m.user_id === userId);
          }
          return (m.user1_id === uid && m.user2_id === userId) || (m.user1_id === userId && m.user2_id === uid);
        });
        const matchId = match?.id;
        if (!matchId) return;

        const { data: userData } = await supabase
          .from('users')
          .select('id, name, profile_image, user_type, hourly_rate')
          .eq('id', userId)
          .single();
        if (!userData) return;

        let profileImage: string | undefined;
        try {
          if (userData.profile_image) {
            const parsed = JSON.parse(userData.profile_image);
            profileImage = Array.isArray(parsed) ? parsed[0] : userData.profile_image;
          }
        } catch {
          profileImage = userData.profile_image;
        }

        setSelectedChat({
          walkRequest: null,
          otherUser: {
            id: userData.id,
            name: userData.name || 'User',
            profileImage,
            role: userData.user_type,
            hourlyRate: userData.hourly_rate,
          },
          matchId,
        });
        setSearchParams({}, { replace: true });
      } catch (e) {
        if (import.meta.env.DEV) console.error('Open chat from userId:', e);
      }
    };

    openChatForUser();
  }, [currentUser?.id, searchParams, setSearchParams, selectedChat?.otherUser?.id, location.state]);

  const handleSelectChat = (walkRequest: WalkRequest | null, otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number }, matchId?: string) => {
    setSelectedChat({ walkRequest, otherUser, matchId });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setListRefreshKey((k) => k + 1);
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
      toast({ title: t('common.error'), description: t('messages.markAllFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stitch-bg-light dark:bg-background-dark pb-20 w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto">
      {/* Header */}
      <div className="bg-stitch-card-light dark:bg-card-dark shadow-md border-b border-stitch-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="w-full max-w-md md:max-w-2xl lg:max-w-3xl mx-auto px-4 py-3">
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

      <div className="flex-1 flex flex-col min-h-0 w-full px-4 pt-4 pb-1">
        {/* Chat List or Chat Window */}
        {selectedChat ? (
          <ChatWindow
            walkRequest={selectedChat.walkRequest}
            otherUser={selectedChat.otherUser}
            matchId={selectedChat.matchId}
            onClose={handleCloseChat}
          />
        ) : (
          <ChatList onSelectChat={handleSelectChat} refreshTrigger={listRefreshKey} />
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation unreadNotifications={unreadNotifications} />
    </div>
  );
};

export default MessagingPage;
