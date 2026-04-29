import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, getChatMessages, subscribeToChatMessages } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, MessageCircle, Image, Video, X, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, WalkRequest } from '@/types';
import { useTranslation } from 'react-i18next';
import { formatCurrencyChf } from '@/lib/currency';

interface ChatWindowProps {
  walkRequest: WalkRequest | null;
  onClose: () => void;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
    hourlyRate?: number;
  };
  matchId?: string;
}

type ChatBooking = {
  id: string;
  status: string;
  start_time?: string;
  total_price?: number;
  payment_status?: string | null;
  owner_id?: string;
  sitter_id?: string;
  completed_at?: string | null;
  completion_confirmed_at?: string | null;
};

const ChatWindow: React.FC<ChatWindowProps> = ({ walkRequest, onClose, otherUser, matchId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [resolvedMatchId, setResolvedMatchId] = useState<string | null>(matchId ?? null);
  const [chatBookings, setChatBookings] = useState<ChatBooking[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setResolvedMatchId(matchId ?? null);
  }, [matchId]);

  // Fallback resolution so chat stays usable if a conversation opens before matchId arrives.
  useEffect(() => {
    if (resolvedMatchId || walkRequest || !currentUser?.id || !otherUser?.id) return;
    let cancelled = false;
    const uid = String(currentUser.id).trim();
    const oid = String(otherUser.id).trim();

    (async () => {
      // Schema-agnostic fallback: fetch visible rows and resolve pair client-side.
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
        return (u1 && u2 && ((u1 === uid && u2 === oid) || (u1 === oid && u2 === uid)))
          || (u && mu && ((u === uid && mu === oid) || (u === oid && mu === uid)));
      });
      if (!cancelled && match?.id) setResolvedMatchId(match.id);
    })();

    return () => {
      cancelled = true;
    };
  }, [resolvedMatchId, walkRequest, currentUser?.id, otherUser?.id]);

  // Load initial messages (when matchId is missing briefly after optimistic open, show UI with empty messages)
  useEffect(() => {
    if (!resolvedMatchId && !walkRequest) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const LOAD_TIMEOUT_MS = 10000;
    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, LOAD_TIMEOUT_MS);

    const loadMessages = async () => {
      try {
        if (resolvedMatchId) {
          const { data, error } = await (supabase as any)
            .from('messages')
            .select('*')
            .eq('match_id', resolvedMatchId)
            .order('created_at', { ascending: true });
          
          if (error) throw error;
          setMessages(data || []);
        } else if (walkRequest) {
          const initialMessages = await getChatMessages(walkRequest.id);
          setMessages(initialMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: t('common.error', 'Error'),
          description: t('messages.loadFailed', 'Could not load messages.'),
          variant: "destructive",
        });
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    loadMessages();
    return () => clearTimeout(timeoutId);
  }, [resolvedMatchId, walkRequest, toast, t]);

  // Load bookings between current user and this conversation partner (so they appear in chat)
  useEffect(() => {
    if (!currentUser?.id || !otherUser?.id) {
      setChatBookings([]);
      return;
    }
    const uid = currentUser.id;
    const oid = otherUser.id;
    (async () => {
      const { data } = await supabase
        .from('bookings')
        .select('id, status, start_time, total_price, payment_status, owner_id, sitter_id, completed_at, completion_confirmed_at')
        .or(`and(owner_id.eq.${uid},sitter_id.eq.${oid}),and(owner_id.eq.${oid},sitter_id.eq.${uid})`)
        .order('created_at', { ascending: false })
        .limit(5);
      setChatBookings(data ?? []);
    })();
  }, [currentUser?.id, otherUser?.id]);

  const workflowStatus = (b: ChatBooking): 'pending' | 'accepted' | 'completed' | 'cancelled' => {
    const raw = String(b.status || '').toLowerCase();
    if (raw === 'requested' || raw === 'pending') return 'pending';
    if (raw === 'confirmed' || raw === 'accepted' || raw === 'in-progress') return 'accepted';
    if (raw === 'completed') return 'completed';
    return 'cancelled';
  };

  const refreshChatBookings = async () => {
    if (!currentUser?.id || !otherUser?.id) return;
    const uid = currentUser.id;
    const oid = otherUser.id;
    const { data } = await supabase
      .from('bookings')
      .select('id, status, start_time, total_price, payment_status, owner_id, sitter_id, completed_at, completion_confirmed_at')
      .or(`and(owner_id.eq.${uid},sitter_id.eq.${oid}),and(owner_id.eq.${oid},sitter_id.eq.${uid})`)
      .order('created_at', { ascending: false })
      .limit(5);
    setChatBookings(data ?? []);
  };

  const onAcceptBooking = async (bookingId: string) => {
    const { error } = await (supabase as any).rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: 'confirmed',
    });
    if (error) throw error;
    await refreshChatBookings();
  };

  const onDeclineBooking = async (bookingId: string) => {
    const { error } = await (supabase as any).rpc('update_booking_status', {
      p_booking_id: bookingId,
      p_new_status: 'cancelled',
      p_cancellation_reason: 'Declined from chat',
    });
    if (error) throw error;
    await refreshChatBookings();
  };

  const onMarkComplete = async (bookingId: string) => {
    const { data, error } = await (supabase as any).rpc('mark_service_completed', {
      p_booking_id: bookingId,
    });
    if (error || !data?.success) throw error || new Error(data?.error || 'Could not mark completed');
    await refreshChatBookings();
  };

  const onConfirmComplete = async (bookingId: string) => {
    const { data, error } = await (supabase as any).rpc('confirm_service_completion', {
      p_booking_id: bookingId,
    });
    if (error || !data?.success) throw error || new Error(data?.error || 'Could not confirm completion');
    await refreshChatBookings();
  };

  // Subscribe to real-time messages
  useEffect(() => {
    if (resolvedMatchId) {
      // Subscribe to match messages
      const channel = supabase
        .channel(`match-${resolvedMatchId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${resolvedMatchId}`
        }, (payload) => {
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new];
          });
        })
        .subscribe();

      return () => {
        channel.unsubscribe();
      };
    } else if (walkRequest) {
      // Subscribe to walk request messages (old system)
      const subscription = subscribeToChatMessages(walkRequest.id, (newMessages) => {
        setMessages(newMessages);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [resolvedMatchId, walkRequest]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: t('messages.invalidFile'),
        description: t('messages.invalidFileDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t('messages.fileTooLarge'),
        description: t('messages.fileTooLargeDesc'),
        variant: 'destructive',
      });
      return;
    }

    setSelectedMedia(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMediaPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const clearMedia = () => {
    setSelectedMedia(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const uploadMedia = async (file: File): Promise<{ url: string; type: string }> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${currentUser!.id}/${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    // Try message-media bucket first, fallback to avatars if it doesn't exist
    let bucketName = 'message-media';
    let { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file);

    // If message-media bucket doesn't exist, try avatars bucket
    if (uploadError && uploadError.message.includes('not found')) {
      // fallback to avatars bucket
      bucketName = 'avatars';
      const result = await supabase.storage
        .from(bucketName)
        .upload(filePath, file);
      uploadError = result.error;
    }

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload media: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    return { url: publicUrl, type: mediaType };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedMedia) || !currentUser || sending) return;
    if (!resolvedMatchId && !walkRequest) {
      return;
    }

    setSending(true);
    setUploading(true);
    try {
      let mediaUrl = null;
      let mediaType = null;

      // Upload media if selected
      if (selectedMedia) {
        const { url, type } = await uploadMedia(selectedMedia);
        mediaUrl = url;
        mediaType = type;
      }

      if (resolvedMatchId) {
        // Send message for match using the send_message function
        const messageText = newMessage.trim() || (mediaType === 'image' ? '?? Image' : '?? Video');
        
        const { data: messageId, error } = await (supabase as any).rpc('send_message', {
          p_match_id: resolvedMatchId,
          p_sender_id: currentUser.id,
          p_content: messageText
        });
        
        if (error) {
          console.error('Send message error:', error);
          throw error;
        }
        
        
        // Optimistically add message to UI immediately
        const newMsg = {
          id: messageId || Date.now().toString(),
          match_id: resolvedMatchId,
          sender_id: currentUser.id,
          content: messageText,
          created_at: new Date().toISOString(),
          read: false
        };
        
        setMessages(prev => [...prev, newMsg]);
      } else if (walkRequest) {
        // Send message for walk request (old system)
        await sendMessage(
          walkRequest.id,
          currentUser.id,
          newMessage.trim() || (mediaType === 'image' ? '?? Image' : '?? Video')
        );
      }

      setNewMessage('');
      clearMedia();
      
      toast({
        title: t('messages.sent'),
        description: mediaUrl ? t('messages.mediaSent') : t('messages.messageSent'),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: t('common.error'),
        description: t('messages.sendFailed'),
        variant: "destructive",
      });
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(timestamp);
  };

  if (loading) {
    return (
      <div className="flex min-h-[12rem] flex-1 items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-2"></div>
          <p className="text-muted-foreground">{t('messages.loadingMessages')}</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="flex min-h-0 flex-1 flex-col overflow-hidden bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark w-full">
      <CardHeader className="flex-shrink-0 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden text-text-primary-light dark:text-text-primary-dark"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={otherUser.profileImage} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{otherUser.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {walkRequest ? t('messages.walkFor', { dog: walkRequest.dogId }) : t('messages.match')}
            </p>
          </div>
          {resolvedMatchId && (
            <Button
              onClick={() => {
                navigate(`/booking/request?walkerId=${otherUser.id}&walkerName=${encodeURIComponent(otherUser.name)}&rate=${otherUser.hourlyRate || 15}`);
              }}
              className="bg-primary hover:bg-primary/90 text-white font-medium shrink-0"
            >
              {t('messages.bookNow')}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="min-h-0 flex-1 flex flex-col p-0 bg-background-light dark:bg-background-dark">
        {chatBookings.length > 0 && (
          <div className="flex-shrink-0 border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-3 py-2">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
                {t('messages.bookingsWith', 'Bookings with')} {otherUser.name}
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {chatBookings.map((b) => (
                <div
                  key={b.id}
                  className="flex-shrink-0 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark px-3 py-2 text-left min-w-[220px]"
                >
                  <p className="text-xs font-medium text-text-primary-light dark:text-text-primary-dark truncate">
                    {b.start_time ? new Date(b.start_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                  <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark capitalize">{workflowStatus(b)}</p>
                  {b.total_price != null && <p className="text-xs text-primary font-medium">{formatCurrencyChf(Number(b.total_price))}</p>}

                  <div className="mt-2 flex gap-1">
                    {workflowStatus(b) === 'pending' && currentUser?.id === b.sitter_id && (
                      <>
                        <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onAcceptBooking(b.id).catch(() => toast({ title: t('common.error'), description: 'Could not accept booking', variant: 'destructive' }))}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 px-2 text-xs" onClick={() => onDeclineBooking(b.id).catch(() => toast({ title: t('common.error'), description: 'Could not decline booking', variant: 'destructive' }))}>
                          Decline
                        </Button>
                      </>
                    )}
                    {workflowStatus(b) === 'accepted' && (!b.payment_status || b.payment_status === 'pending') && currentUser?.id === b.owner_id && (
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => navigate(`/payment?bookingId=${b.id}`)}>
                        Pay now
                      </Button>
                    )}
                    {workflowStatus(b) === 'accepted' && b.payment_status === 'held' && currentUser?.id === b.sitter_id && (
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onMarkComplete(b.id).catch(() => toast({ title: t('common.error'), description: 'Could not mark complete', variant: 'destructive' }))}>
                        Mark complete
                      </Button>
                    )}
                    {workflowStatus(b) === 'completed' && b.completed_at && !b.completion_confirmed_at && currentUser?.id === b.owner_id && (
                      <Button size="sm" className="h-7 px-2 text-xs" onClick={() => onConfirmComplete(b.id).catch(() => toast({ title: t('common.error'), description: 'Could not confirm completion', variant: 'destructive' }))}>
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => navigate('/bookings')}
              className="text-xs text-primary font-medium mt-1 hover:underline"
            >
              {t('bookings.myBookings')} →
            </button>
          </div>
        )}
        <div
          ref={scrollAreaRef}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide p-4 bg-background-light dark:bg-background-dark touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-12 h-12 text-gray-500 dark:text-gray-400 mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                {t('messages.noMessages')}
              </p>
            </div>
          ) : (
            <div className="space-y-1 px-2">
              {messages.map((message: any) => {
                const isOwnMessage = message.sender_id === currentUser?.id;
                const messageContent = message.content || message.message;
                const messageTime = message.created_at ? new Date(message.created_at) : new Date();
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-end gap-2 mb-2 ${
                      isOwnMessage ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar - only show for other user's messages */}
                    {!isOwnMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0 mb-1">
                        <AvatarImage 
                          src={otherUser.profileImage} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                          {otherUser.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    {/* Message Bubble - Tinder Style */}
                    <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[75%]`}>
                      <div
                        className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                          isOwnMessage
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-white rounded-br-sm'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        <p className={`text-sm leading-relaxed ${isOwnMessage ? 'text-white' : 'text-gray-900 dark:text-gray-100'}`}>
                          {messageContent}
                        </p>
                      </div>
                      
                      {/* Timestamp */}
                      <p
                        className={`text-xs mt-1 px-2 ${
                          isOwnMessage ? 'text-right' : 'text-left'
                        } text-gray-500 dark:text-gray-400`}
                      >
                        {formatTime(messageTime)}
                      </p>
                    </div>

                    {/* Avatar - only show for own messages */}
                    {isOwnMessage && (
                      <Avatar className="w-8 h-8 flex-shrink-0 mb-1">
                        <AvatarImage 
                          src={currentUser.user_metadata?.avatar_url} 
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-400 to-cyan-400 text-white">
                          {currentUser.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex-shrink-0 px-4 py-2 border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark space-y-2">
          {!resolvedMatchId && !walkRequest && (
            <p className="text-xs text-muted-foreground text-center">
              {t('messages.loadingConversation', 'Preparing conversation...')}
            </p>
          )}
          {/* Media preview */}
          {mediaPreview && (
            <div className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-primary flex-shrink-0">
                {selectedMedia?.type.startsWith('image/') ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" />
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedMedia?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedMedia && (selectedMedia.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={clearMedia}
                className="flex-shrink-0 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors"
                disabled={uploading}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {/* Input area */}
          <div className="flex gap-2 items-end">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleMediaSelect}
              className="hidden"
            />
            <Button
              type="button"
              size="icon"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploading}
              className="flex-shrink-0"
            >
              <Image className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={t('messages.writeMessage')}
              className="flex-1"
              disabled={sending || uploading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={(!newMessage.trim() && !selectedMedia) || sending || uploading}
              className="flex-shrink-0 bg-primary hover:bg-primary/90"
            >
              {uploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
