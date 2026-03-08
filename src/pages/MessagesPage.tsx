import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import BottomNavigation from '@/components/ui/BottomNavigation';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';

type Conversation = {
  matchId: string;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
  lastMessageAt?: string;
};

type OpenMatchState = { openMatch: { id: string; name: string; imageUrl: string } };

function parseProfileImage(profileImage: unknown): string | undefined {
  if (profileImage == null) return undefined;
  try {
    const parsed = typeof profileImage === 'string' ? JSON.parse(profileImage) : profileImage;
    return Array.isArray(parsed) ? parsed[0] : (parsed as string);
  } catch {
    return typeof profileImage === 'string' ? profileImage : undefined;
  }
}

export default function MessagesPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const unreadNotifications = useUnreadNotificationCount();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<{ id: string; sender_id: string; content: string; created_at: string }[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const stateConsumedRef = useRef(false);

  const uid = currentUser?.id ? String(currentUser.id).trim() : '';

  // Fetch matches (supports user1_id/user2_id or user_id/matched_user_id)
  const fetchMatches = async (): Promise<{ id: string; otherUserId: string }[]> => {
    if (!uid) return [];

    const tryUser12 = async () => {
      const { data, error: e } = await supabase
        .from('matches')
        .select('id, user1_id, user2_id')
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`)
        .order('created_at', { ascending: false });
      if (e) throw e;
      return (data || []).map((m: any) => ({
        id: m.id,
        otherUserId: m.user1_id === uid ? m.user2_id : m.user1_id,
      }));
    };

    const tryUserMatched = async () => {
      const { data, error: e } = await supabase
        .from('matches')
        .select('id, user_id, matched_user_id')
        .or(`user_id.eq.${uid},matched_user_id.eq.${uid}`)
        .order('created_at', { ascending: false });
      if (e) throw e;
      return (data || []).map((m: any) => ({
        id: m.id,
        otherUserId: m.user_id === uid ? m.matched_user_id : m.user_id,
      }));
    };

    try {
      return await tryUser12();
    } catch (err: any) {
      const code = err?.code;
      const msg = String(err?.message || '');
      if (code === '42703' || msg.includes('user1_id') || msg.includes('user2_id') || err?.status === 400) {
        return await tryUserMatched();
      }
      throw err;
    }
  };

  // Load conversation list
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      setError(null);
      setConversations([]);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const rows = await fetchMatches();
        if (cancelled) return;
        const otherIds = [...new Set(rows.map((r) => r.otherUserId))];
        if (otherIds.length === 0) {
          setConversations([]);
          return;
        }

        const { data: usersData } = await supabase
          .from('users')
          .select('id, name, profile_image')
          .in('id', otherIds);
        const usersMap = new Map<string, { name: string; profileImage?: string }>();
        (usersData || []).forEach((u: any) => {
          usersMap.set(u.id, {
            name: u.name || 'User',
            profileImage: parseProfileImage(u.profile_image),
          });
        });

        const { data: lastMessages } = await supabase
          .from('messages')
          .select('match_id, created_at')
          .in('match_id', rows.map((r) => r.id))
          .order('created_at', { ascending: false });
        const lastByMatch = new Map<string, string>();
        (lastMessages || []).forEach((m: any) => {
          if (!lastByMatch.has(m.match_id)) lastByMatch.set(m.match_id, m.created_at);
        });

        const list: Conversation[] = rows.map((r) => {
          const u = usersMap.get(r.otherUserId);
          return {
            matchId: r.id,
            otherUser: {
              id: r.otherUserId,
              name: u?.name ?? 'User',
              profileImage: u?.profileImage,
            },
            lastMessageAt: lastByMatch.get(r.id),
          };
        });
        setConversations(list);
      } catch (e) {
        if (!cancelled) {
          setError(t('messages.loadFailed') || 'Could not load messages.');
          setConversations([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [uid, t]);

  // Open from Match modal state
  useEffect(() => {
    const state = location.state as OpenMatchState | null;
    const openMatch = state?.openMatch;
    if (!uid || !openMatch || openMatch.id === uid || stateConsumedRef.current) return;
    stateConsumedRef.current = true;
    const existing = conversations.find((c) => c.otherUser.id === openMatch.id);
    if (existing) {
      setSelected(existing);
    } else {
      setSelected({
        matchId: '',
        otherUser: { id: openMatch.id, name: openMatch.name, profileImage: openMatch.imageUrl },
      });
    }
    setSearchParams({}, { replace: true });
    navigate(location.pathname, { replace: true, state: {} });
  }, [uid, location.state, location.pathname, navigate, setSearchParams, conversations]);

  // Open from ?userId=
  useEffect(() => {
    const userId = searchParams.get('userId');
    if (!uid || !userId || userId === uid) return;
    const existing = conversations.find((c) => c.otherUser.id === userId);
    if (existing) {
      setSelected(existing);
      setSearchParams({}, { replace: true });
    } else {
      (async () => {
        const rows = await fetchMatches().catch(() => []);
        const match = rows.find((r) => r.otherUserId === userId);
        if (!match) return;
        const { data: userData } = await supabase
          .from('users')
          .select('id, name, profile_image')
          .eq('id', userId)
          .single();
        setSelected({
          matchId: match.id,
          otherUser: {
            id: userId,
            name: (userData as any)?.name || 'User',
            profileImage: parseProfileImage((userData as any)?.profile_image),
          },
        });
        setSearchParams({}, { replace: true });
      })();
    }
  }, [uid, searchParams, conversations]);

  // Resolve matchId when selected has no matchId (opened from modal)
  useEffect(() => {
    if (!selected || selected.matchId || !uid) return;
    const otherId = selected.otherUser.id;
    let cancelled = false;
    fetchMatches().then((rows) => {
      if (cancelled) return;
      const m = rows.find((r) => r.otherUserId === otherId);
      if (m) setSelected((prev) => (prev ? { ...prev, matchId: m.id } : prev));
    });
    return () => { cancelled = true; };
  }, [selected?.otherUser?.id, selected?.matchId, uid]);

  // Load messages when a conversation is selected and matchId is known
  const selectedMatchId = selected?.matchId;
  useEffect(() => {
    if (!selectedMatchId || !selected) {
      setMessages([]);
      return;
    }
    let cancelled = false;
    setMessagesLoading(true);
    supabase
      .from('messages')
      .select('id, sender_id, content, created_at')
      .eq('match_id', selectedMatchId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast({ title: t('common.error'), description: t('messages.loadFailed'), variant: 'destructive' });
          setMessages([]);
        } else {
          setMessages(data || []);
        }
        setMessagesLoading(false);
      });
    return () => { cancelled = true; };
  }, [selectedMatchId, selected?.otherUser?.id]);

  // Realtime for current chat
  useEffect(() => {
    if (!selectedMatchId) return;
    const channel = supabase
      .channel(`messages-${selectedMatchId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${selectedMatchId}`,
      }, (payload) => {
        setMessages((prev) => {
          const newRow = payload.new as any;
          if (prev.some((m) => m.id === newRow.id)) return prev;
          return [...prev, { id: newRow.id, sender_id: newRow.sender_id, content: newRow.content, created_at: newRow.created_at }];
        });
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, [selectedMatchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || !currentUser || !selectedMatchId || sending) return;
    setSending(true);
    try {
      const { data: messageId, error: err } = await (supabase as any).rpc('send_message', {
        p_match_id: selectedMatchId,
        p_sender_id: currentUser.id,
        p_content: text,
      });
      if (err) throw err;
      setInput('');
      setMessages((prev) => [
        ...prev,
        {
          id: messageId || crypto.randomUUID(),
          sender_id: currentUser.id,
          content: text,
          created_at: new Date().toISOString(),
        },
      ]);
      toast({ title: t('messages.sent'), description: t('messages.messageSent') });
    } catch {
      toast({ title: t('common.error'), description: t('messages.sendFailed'), variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  const markAllRead = async () => {
    if (!currentUser) return;
    try {
      await supabase.from('notifications').update({ read: true, is_read: true }).eq('user_id', currentUser.id).eq('type', 'message');
      toast({ title: t('common.success'), description: t('notifications.allRead', 'All marked as read') });
    } catch {
      toast({ title: t('common.error'), description: t('messages.markAllFailed'), variant: 'destructive' });
    }
  };

  const formatTime = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  // Chat view
  if (selected) {
    const canSend = Boolean(selectedMatchId && currentUser);
    return (
      <div className="min-h-screen bg-stitch-bg-light dark:bg-background-dark pb-20 max-w-md mx-auto flex flex-col">
        <div className="bg-stitch-card-light dark:bg-card-dark shadow-md border-b border-stitch-border-light dark:border-border-dark sticky top-0 z-50">
          <div className="max-w-md mx-auto px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setSelected(null)} className="rounded-xl">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-9 h-9">
                <AvatarImage src={selected.otherUser.profileImage} />
                <AvatarFallback>{selected.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h1 className="text-lg font-bold truncate">{selected.otherUser.name}</h1>
                <p className="text-sm text-muted-foreground">{t('messages.match')}</p>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 px-4 py-2">
          {messagesLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-3" />
              <p className="text-muted-foreground">{t('messages.noMessages')}</p>
            </div>
          ) : (
            <div className="space-y-2 pb-4">
              {messages.map((msg) => {
                const isOwn = msg.sender_id === currentUser?.id;
                return (
                  <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        isOwn ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                      }`}
                    >
                      <p className="text-sm">{msg.content}</p>
                      <p className={`text-xs mt-0.5 ${isOwn ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {selectedMatchId && (
          <form onSubmit={sendMessage} className="flex-shrink-0 p-4 border-t bg-stitch-card-light dark:bg-card-dark">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('messages.writeMessage')}
                disabled={!canSend || sending}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={!input.trim() || !canSend || sending}>
                {sending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        )}

        <BottomNavigation unreadNotifications={unreadNotifications} />
      </div>
    );
  }

  // List view
  return (
    <div className="min-h-screen bg-stitch-bg-light dark:bg-background-dark pb-20 max-w-md mx-auto">
      <div className="bg-stitch-card-light dark:bg-card-dark shadow-md border-b border-stitch-border-light dark:border-border-dark sticky top-0 z-50">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
                <span className="material-symbols-outlined">arrow_back</span>
              </Button>
              <h1 className="text-xl font-bold font-display">{t('nav.messages')}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium"
              >
                <span className="material-symbols-outlined text-sm">done_all</span>
                {t('notifications.markAllRead', 'Mark all read')}
              </button>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="font-medium text-destructive">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('messages.matchDescription')}</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageCircle className="w-14 h-14 mx-auto text-muted-foreground mb-4" />
            <p className="font-medium">{t('messages.noConversations')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('messages.matchDescription')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map((conv) => (
              <button
                key={conv.matchId}
                onClick={() => setSelected(conv)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-muted/80 transition-colors text-left"
              >
                <Avatar className="w-12 h-12 flex-shrink-0">
                  <AvatarImage src={conv.otherUser.profileImage} />
                  <AvatarFallback>{conv.otherUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{conv.otherUser.name}</p>
                  {conv.lastMessageAt && (
                    <p className="text-xs text-muted-foreground">{formatDate(conv.lastMessageAt)}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNavigation unreadNotifications={unreadNotifications} />
    </div>
  );
}
