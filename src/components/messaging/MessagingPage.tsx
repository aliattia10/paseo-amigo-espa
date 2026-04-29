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
  const { currentUser, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();
  const stateConsumedRef = useRef(false);
  const [listRefreshKey, setListRefreshKey] = useState(0);
  const [selectedChat, setSelectedChat] = useState<{
    walkRequest: WalkRequest | null;
    otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number };
    matchId?: string;
  } | null>(null);

  const findMatchBetweenUsers = async (uid: string, otherId: string) => {
    // Schema-agnostic path to avoid 400s from missing column filters.
    const { data: raw } = await supabase
      .from('matches')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    const match = (raw || []).find((m: any) => {
      const u1 = String(m.user1_id || '').trim();
      const u2 = String(m.user2_id || '').trim();
      const u = String(m.user_id || '').trim();
      const mu = String(m.matched_user_id || '').trim();
      return (u1 && u2 && ((u1 === uid && u2 === otherId) || (u1 === otherId && u2 === uid)))
        || (u && mu && ((u === uid && mu === otherId) || (u === otherId && mu === uid)));
    });
    return (match?.id as string) || null;
  };

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
        const matchId = await findMatchBetweenUsers(uid, otherId);
        if (cancelled || !matchId) return;
        setSelectedChat((prev) =>
          prev && prev.otherUser.id === otherId ? { ...prev, matchId } : prev
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
        const matchId = await findMatchBetweenUsers(uid, userId);
        if (!matchId) return;

        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, profile_image, user_type, hourly_rate, is_demo, is_bot, is_active')
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

  // 4) Open directly from notification deep-link by matchId.
  useEffect(() => {
    const qMatchId = searchParams.get('matchId');
    if (!currentUser?.id || !qMatchId) return;
    if (selectedChat?.matchId === qMatchId) return;

    const openByMatchId = async () => {
      try {
        const uid = String(currentUser.id).trim();
        const mid = String(qMatchId).trim();

        // Read full row to avoid schema-specific select failures.
        let matchRow: any = null;
        const { data: m } = await supabase
          .from('matches')
          .select('*')
          .eq('id', mid)
          .maybeSingle();
        if (m) {
          const u1 = String(m.user1_id || '').trim();
          const u2 = String(m.user2_id || '').trim();
          const u = String(m.user_id || '').trim();
          const mu = String(m.matched_user_id || '').trim();
          const otherId = (u1 || u2) ? (u1 === uid ? u2 : u1) : (u === uid ? mu : u);
          if (otherId) matchRow = { id: m.id, otherId };
        }

        if (!matchRow?.otherId) return;

        const { data: userData } = await supabase
          .from('users')
          .select('id, name, email, profile_image, user_type, hourly_rate, is_demo, is_bot, is_active')
          .eq('id', matchRow.otherId)
          .single();
        if (!userData) return;

        let profileImage: string | undefined;
        try {
          if (userData?.profile_image) {
            const parsed = JSON.parse(userData.profile_image);
            profileImage = Array.isArray(parsed) ? parsed[0] : userData.profile_image;
          }
        } catch {
          profileImage = userData?.profile_image;
        }

        setSelectedChat({
          walkRequest: null,
          otherUser: {
            id: userData?.id || matchRow.otherId,
            name: userData?.name || (t('messages.match') || 'Match'),
            profileImage,
            role: userData?.user_type,
            hourlyRate: userData?.hourly_rate,
          },
          matchId: matchRow.id,
        });
        setSearchParams({}, { replace: true });
      } catch (e) {
        if (import.meta.env.DEV) console.error('Open chat from matchId:', e);
      }
    };

    openByMatchId();
  }, [currentUser?.id, searchParams, setSearchParams, selectedChat?.matchId, t]);

  const handleSelectChat = (walkRequest: WalkRequest | null, otherUser: { id: string; name: string; profileImage?: string; role?: string; hourlyRate?: number }, matchId?: string) => {
    setSelectedChat({ walkRequest, otherUser, matchId });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
    setListRefreshKey((k) => k + 1);
  };

  if (authLoading || !currentUser?.id) {
    return (
      <div className="relative mx-auto flex h-screen w-full max-w-md flex-col items-center justify-center bg-background-light dark:bg-background-dark p-6">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">{t('common.loading', 'Loading...')}</p>
      </div>
    );
  }

  const markAllMessagesRead = async () => {
    if (!currentUser?.id) return;
    try {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', currentUser.id)
        .eq('type', 'message');
      toast({ title: t('common.success'), description: t('notifications.allRead', 'All marked as read') });
    } catch {
      toast({ title: t('common.error'), description: t('messages.markAllFailed'), variant: 'destructive' });
    }
  };

  return (
    <div className="relative mx-auto flex h-screen w-full max-w-md flex-col bg-background-light dark:bg-background-dark">
      <header className="sticky top-0 z-20 shrink-0 border-b border-border-light dark:border-border-dark bg-card-light/95 dark:bg-card-dark/95 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 px-4 py-3">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
              className="shrink-0 rounded-xl"
              aria-label={t('common.back', 'Back')}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Button>
            <h1 className="truncate text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {t('dashboard.messages')}
            </h1>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={markAllMessagesRead}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-2.5 rounded-lg bg-primary/10 dark:bg-primary/20 text-primary hover:bg-primary/20 dark:hover:bg-primary/30 transition-colors text-xs font-medium"
            >
              <span className="material-symbols-outlined text-sm">done_all</span>
              <span className="hidden sm:inline">{t('notifications.markAllRead', 'Mark all read')}</span>
            </button>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <div className={`flex min-h-0 flex-1 flex-col px-4 pt-4 ${selectedChat ? 'pb-4' : 'pb-24'}`}>
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

      {!selectedChat && <BottomNavigation unreadNotifications={unreadNotifications} />}
    </div>
  );
};

export default MessagingPage;
