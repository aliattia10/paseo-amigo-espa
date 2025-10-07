import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { sendMessage, getChatMessages, subscribeToChatMessages } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Send, ArrowLeft, MessageCircle } from 'lucide-react';
import type { ChatMessage, WalkRequest } from '@/types';

interface ChatWindowProps {
  walkRequest: WalkRequest;
  onClose: () => void;
  otherUser: {
    id: string;
    name: string;
    profileImage?: string;
  };
}

const ChatWindow: React.FC<ChatWindowProps> = ({ walkRequest, onClose, otherUser }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

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
        const initialMessages = await getChatMessages(walkRequest.id);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Error loading messages:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los mensajes.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, [walkRequest.id, toast]);

  // Subscribe to real-time messages
  useEffect(() => {
    const subscription = subscribeToChatMessages(walkRequest.id, (newMessages) => {
      setMessages(newMessages);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [walkRequest.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || sending) return;

    setSending(true);
    try {
      await sendMessage({
        requestId: walkRequest.id,
        senderId: currentUser.id,
        message: newMessage.trim(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "No se pudo enviar el mensaje.",
        variant: "destructive",
      });
    } finally {
      setSending(false);
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
          <div>
            <h3 className="font-semibold">{otherUser.name}</h3>
            <p className="text-sm text-muted-foreground">
              Paseo para {walkRequest.dogId}
            </p>
          </div>
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
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.senderId === currentUser?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage 
                      src={message.senderId === currentUser?.id ? currentUser.user_metadata?.avatar_url : otherUser.profileImage} 
                    />
                    <AvatarFallback>
                      {message.senderId === currentUser?.id 
                        ? currentUser.email?.charAt(0).toUpperCase()
                        : otherUser.name.charAt(0)
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-xs px-3 py-2 rounded-lg ${
                      message.senderId === currentUser?.id
                        ? 'bg-terracotta text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.senderId === currentUser?.id
                          ? 'text-white/70'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex-shrink-0 p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="flex-1"
              disabled={sending}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!newMessage.trim() || sending}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChatWindow;
