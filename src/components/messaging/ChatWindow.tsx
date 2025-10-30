import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, getChatMessages, subscribeToChatMessages } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, MessageCircle, Image, Video, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { ChatMessage, WalkRequest } from '@/types';

interface ChatWindowProps {
  walkRequest: WalkRequest | null;
  onClose: () => void;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
  matchId?: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ walkRequest, onClose, otherUser, matchId }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
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

  // Load initial messages
  useEffect(() => {
    const loadMessages = async () => {
      try {
        if (matchId) {
          // Load messages for match
          const { data, error } = await (supabase as any)
            .from('messages')
            .select('*')
            .eq('match_id', matchId)
            .order('created_at', { ascending: true });
          
          console.log('=== LOADED MESSAGES ===');
          console.log('Match ID:', matchId);
          console.log('Messages data:', data);
          console.log('Error:', error);
          
          if (error) throw error;
          setMessages(data || []);
        } else if (walkRequest) {
          // Load messages for walk request (old system)
          const initialMessages = await getChatMessages(walkRequest.id);
          setMessages(initialMessages);
        }
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "Could not load messages.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [matchId, walkRequest, toast]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (matchId) {
      console.log('Setting up real-time subscription for match:', matchId);
      
      // Subscribe to match messages
      const channel = supabase
        .channel(`match-${matchId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`
        }, (payload) => {
          console.log('Real-time message received:', payload.new);
          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === payload.new.id)) {
              return prev;
            }
            return [...prev, payload.new];
          });
        })
        .subscribe((status) => {
          console.log('Subscription status:', status);
        });

      return () => {
        console.log('Unsubscribing from match:', matchId);
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
  }, [matchId, walkRequest]);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image or video file',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select a file smaller than 10MB',
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

    const { error: uploadError } = await supabase.storage
      .from('message-media')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('message-media')
      .getPublicUrl(filePath);

    const mediaType = file.type.startsWith('image/') ? 'image' : 'video';
    return { url: publicUrl, type: mediaType };
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedMedia) || !currentUser || sending) return;

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

      if (matchId) {
        // Send message for match using the send_message function
        const messageText = newMessage.trim() || (mediaType === 'image' ? '📷 Image' : '🎥 Video');
        
        const { data: messageId, error } = await (supabase as any).rpc('send_message', {
          p_match_id: matchId,
          p_sender_id: currentUser.id,
          p_content: messageText
        });
        
        if (error) {
          console.error('Send message error:', error);
          throw error;
        }
        
        console.log('Message sent successfully, ID:', messageId);
        
        // Optimistically add message to UI immediately
        const newMsg = {
          id: messageId || Date.now().toString(),
          match_id: matchId,
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
          newMessage.trim() || (mediaType === 'image' ? '📷 Image' : '🎥 Video')
        );
      }

      setNewMessage('');
      clearMedia();
      
      toast({
        title: '✓ Sent',
        description: mediaUrl ? 'Media sent successfully' : 'Message sent',
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Could not send message.",
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
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando mensajes...</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="md:hidden"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <Avatar className="w-8 h-8">
            <AvatarImage src={otherUser.profileImage} />
            <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">
              {walkRequest ? `Paseo para ${walkRequest.dogId}` : 'Match'}
            </p>
          </div>
          {matchId && (
            <Button
              onClick={() => {
                // Navigate to booking page with sitter ID
                window.location.href = `/booking/request?sitter_id=${otherUser.id}`;
              }}
              className="bg-primary hover:bg-primary/90"
            >
              📅 Book Now
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageCircle className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                No hay mensajes aún. ¡Inicia la conversación!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message: any) => {
                const isOwnMessage = message.sender_id === currentUser?.id;
                const messageContent = message.content || message.message;
                const messageTime = message.created_at ? new Date(message.created_at) : new Date();
                
                console.log('Rendering message:', {
                  id: message.id,
                  sender_id: message.sender_id,
                  content: message.content,
                  messageContent,
                  isOwnMessage
                });
                
                return (
                  <div
                    key={message.id}
                    className={`flex items-start gap-3 ${
                      isOwnMessage ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage 
                        src={isOwnMessage ? currentUser.user_metadata?.avatar_url : otherUser.profileImage} 
                      />
                      <AvatarFallback>
                        {isOwnMessage 
                          ? currentUser.email?.charAt(0).toUpperCase()
                          : otherUser.name.charAt(0)
                        }
                      </AvatarFallback>
                    </Avatar>
                    <div
                      className={`max-w-xs rounded-lg overflow-hidden ${
                        isOwnMessage
                          ? 'bg-primary text-white'
                          : 'bg-muted'
                      }`}
                    >
                      {/* Text message */}
                      {messageContent && (
                        <div className="px-3 py-2">
                          <p className="text-sm">{messageContent}</p>
                        </div>
                      )}
                      
                      {/* Timestamp */}
                      <p
                        className={`text-xs px-3 pb-2 ${
                          isOwnMessage
                            ? 'text-white/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {formatTime(messageTime)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t">
          {/* Media preview */}
          {mediaPreview && (
            <div className="mb-3 relative inline-block">
              <div className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-terracotta">
                {selectedMedia?.type.startsWith('image/') ? (
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <video src={mediaPreview} className="w-full h-full object-cover" />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
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
            >
              <Image className="w-4 h-4" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={sending || uploading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={(!newMessage.trim() && !selectedMedia) || sending || uploading}
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
