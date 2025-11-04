import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { getWalkRequestsByOwner, getWalkRequestsByWalker } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Clock, MapPin, Dog, Heart } from 'lucide-react';
import type { WalkRequest } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
  otherUser?: {
    id: string;
    name: string;
    profile_image?: string;
    role?: string;
  };
}

interface ChatListProps {
  onSelectChat: (walkRequest: WalkRequest | null, otherUser: { id: string; name: string; profileImage?: string; role?: string }, matchId?: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const { userProfile, currentUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [walkRequests, setWalkRequests] = useState<WalkRequest[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      if (!userProfile || !currentUser) return;

      try {
        // Load matches
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id}`)
          .order('created_at', { ascending: false });

        if (matchesError) {
          console.error('Error loading matches:', matchesError);
        } else if (matchesData) {
          // Load other user details for each match
          const matchesWithUsers = await Promise.all(
            matchesData.map(async (match) => {
              const otherUserId = match.user1_id === currentUser.id ? match.user2_id : match.user1_id;
              
              const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, name, profile_image, user_type')
                .eq('id', otherUserId)
                .single();

              if (!userError && userData) {
                return {
                  ...match,
                  otherUser: {
                    id: userData.id,
                    name: userData.name || 'User',
                    profile_image: userData.profile_image,
                    role: userData.user_type,
                  },
                };
              }
              return match;
            })
          );
          setMatches(matchesWithUsers);
        }

        // Also load walk requests for existing bookings
        const requests = userProfile.userType === 'owner' 
          ? await getWalkRequestsByOwner(userProfile.id)
          : await getWalkRequestsByWalker(userProfile.id);
        
        const activeRequests = requests.filter(
          request => ['pending', 'accepted', 'in-progress'].includes(request.status)
        );
        
        setWalkRequests(activeRequests);
      } catch (error) {
        console.error('Error loading chats:', error);
        toast({
          title: t('common.error'),
          description: t('messages.loadError') || 'Could not load conversations.',
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [userProfile, currentUser, toast]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return t('common.today') || 'Today';
    } else if (diffDays === 1) {
      return t('common.yesterday') || 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} ${t('common.daysAgo') || 'days ago'}`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'accepted':
        return t('walk.accepted') || 'Accepted';
      case 'in-progress':
        return t('walk.inProgress') || 'In Progress';
      case 'completed':
        return t('walk.completed') || 'Completed';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-2"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0 && walkRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">{t('messages.noConversations') || 'No conversations'}</h3>
          <p className="text-muted-foreground">
            {t('messages.matchToChat') || 'When you match with someone, you can chat here and coordinate services.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0 border-b">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          {t('messages.conversations') || 'Conversations'}
        </h2>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {/* Show matches first */}
            {matches.map((match) => {
              if (!match.otherUser) return null;

              return (
                <div
                  key={match.id}
                  className="p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectChat(null, match.otherUser!, match.id)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={match.otherUser.profile_image} />
                      <AvatarFallback>{match.otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{match.otherUser.name}</h3>
                        <Badge className="bg-pink-100 text-pink-800">
                          <Heart className="w-3 h-3 mr-1" />
                          Match
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{match.otherUser.role === 'sitter' ? '🐾 Sitter' : '🏠 Owner'}</span>
                        <span>•</span>
                        <span>{formatDate(new Date(match.created_at))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Show walk requests */}
            {walkRequests.map((request) => {
              const otherUser = {
                id: userProfile?.userType === 'owner' ? request.walkerId : request.ownerId,
                name: userProfile?.userType === 'owner' ? 'Compañero' : 'Dueño',
                profileImage: undefined,
              };

              return (
                <div
                  key={request.id}
                  className="p-4 border-b cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onSelectChat(request, otherUser)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser.profileImage} />
                      <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">{otherUser.name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <Dog className="w-4 h-4" />
                        <span>{request.dogId}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{request.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{request.location}</span>
                        <span>•</span>
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ChatList;
