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
import { MessageCircle, Clock, MapPin, Dog, Heart, ArrowRight } from 'lucide-react';
import type { WalkRequest } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface Match {
  id: string;
  user1_id?: string;
  user2_id?: string;
  user_id?: string;
  matched_user_id?: string;
  is_mutual?: boolean;
  match_type?: string;
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
    const loadChats = async (showLoading = true) => {
      if (!userProfile || !currentUser) {
        setLoading(false);
        return;
      }

      try {
        if (showLoading) setLoading(true);
        // Load matches from both possible column structures
        const { data: matchesData, error: matchesError } = await supabase
          .from('matches')
          .select('*')
          .or(`user1_id.eq.${currentUser.id},user2_id.eq.${currentUser.id},user_id.eq.${currentUser.id},matched_user_id.eq.${currentUser.id}`);

        if (matchesError) {
          console.error('Error loading matches:', matchesError);
        } else if (matchesData) {
          const mutualMatches = matchesData.filter(m => {
            if (m.is_mutual !== undefined) return m.is_mutual === true;
            return true;
          });

          const matchesWithUsers = await Promise.all(
            mutualMatches.map(async (match) => {
              let otherUserId = '';
              if (match.user1_id) {
                otherUserId = match.user1_id === currentUser.id ? match.user2_id : match.user1_id;
              } else if (match.user_id) {
                otherUserId = match.user_id === currentUser.id ? match.matched_user_id : match.user_id;
              }
              if (!otherUserId) return match;

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
          setMatches(matchesWithUsers.filter(m => m.otherUser));
        }

        const requests = userProfile.userType === 'owner'
          ? await getWalkRequestsByOwner(userProfile.id)
          : await getWalkRequestsByWalker(userProfile.id);
        const activeRequests = requests.filter(
          request => ['pending', 'accepted', 'in-progress'].includes(request.status)
        );
        setWalkRequests(activeRequests);
      } catch (error: any) {
        const msg = error?.message ?? '';
        const isOffline = /timed out|failed to fetch|network|blocked|load failed|service|unavailable/i.test(msg);
        if (!isOffline) {
          console.error('Error loading chats:', error);
        }
        // Network/offline errors → silent empty state, no toast
      } finally {
        setLoading(false);
      }
    };

    loadChats();

    // Realtime: refetch when a new match is inserted for this user
    if (!currentUser?.id) return;
    const channel = supabase
      .channel('chat-list-matches')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'matches' },
        (payload) => {
          const row = payload.new as Record<string, unknown>;
          const uid = currentUser.id;
          const involvesUser =
            row?.user1_id === uid || row?.user2_id === uid || row?.user_id === uid || row?.matched_user_id === uid;
          if (involvesUser) loadChats(false);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userProfile, currentUser, toast, t]);

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
        return 'bg-sage-green/20 text-medium-jungle';
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
          <p className="text-muted-foreground">{t('messages.loadingMessages') || t('common.loading') || 'Loading...'}</p>
        </div>
      </div>
    );
  }

  if (matches.length === 0 && walkRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center mb-4">
          <Heart className="w-12 h-12 text-pink-400" />
        </div>
        <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
          {t('messages.noConversations') || 'No conversations yet'}
        </h3>
        <p className="text-text-secondary-light dark:text-text-secondary-dark max-w-sm">
          {t('messages.matchDescription') || t('messages.matchToChat') || 'When you match with someone, you can chat here and coordinate services.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b bg-card-light dark:bg-card-dark">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-text-primary-light dark:text-text-primary-dark">
          <MessageCircle className="w-5 h-5" />
          {t('messages.conversations') || 'Conversations'}
        </h2>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-3">
          {/* Show matches first - Tinder-style bubbles */}
          {matches.map((match) => {
            if (!match.otherUser) return null;

            // Parse profile image
            let profileImageUrl = '';
            try {
              if (match.otherUser.profile_image) {
                const parsed = JSON.parse(match.otherUser.profile_image);
                profileImageUrl = Array.isArray(parsed) ? parsed[0] : match.otherUser.profile_image;
              }
            } catch {
              profileImageUrl = match.otherUser.profile_image || '';
            }

            return (
              <div
                key={match.id}
                className="relative bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl p-4 cursor-pointer hover:shadow-lg transition-all transform hover:scale-[1.02] border border-pink-200 dark:border-pink-800"
                onClick={() => onSelectChat(null, match.otherUser!, match.id)}
              >
                {/* Match Badge */}
                <div className="absolute top-3 right-3">
                  <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-md">
                    <Heart className="w-3 h-3 fill-white" />
                    {t('messages.match') || 'Match'}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Profile Image - Large Circle */}
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-400 to-purple-400 p-0.5">
                      <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 overflow-hidden">
                        {profileImageUrl ? (
                          <img 
                            src={profileImageUrl} 
                            alt={match.otherUser.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-pink-200 to-purple-200 dark:from-pink-800 dark:to-purple-800">
                            <span className="text-2xl font-bold text-pink-600 dark:text-pink-300">
                              {match.otherUser.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-medium-jungle border-2 border-white dark:border-gray-800 rounded-full"></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg text-text-primary-light dark:text-text-primary-dark mb-1 truncate">
                      {match.otherUser.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm mb-2">
                      <span className="bg-white/60 dark:bg-gray-800/60 px-2 py-0.5 rounded-full text-xs font-medium">
                        {match.otherUser.role === 'sitter' || match.otherUser.role === 'walker' 
                          ? `🐾 ${t('messages.sitter') || 'Sitter'}` 
                          : `🏠 ${t('messages.owner') || 'Owner'}`}
                      </span>
                    </div>
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      Matched {formatDate(new Date(match.created_at))}
                    </p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="text-pink-400">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}

            {/* Show walk requests - Card style */}
            {walkRequests.map((request) => {
              const otherUser = {
                id: userProfile?.userType === 'owner' ? request.walkerId : request.ownerId,
                name: userProfile?.userType === 'owner' ? t('messages.sitter') : t('messages.owner'),
                profileImage: undefined,
              };

              return (
                <div
                  key={request.id}
                  className="bg-card-light dark:bg-card-dark rounded-xl p-4 cursor-pointer hover:shadow-md transition-all border border-border-light dark:border-border-dark"
                  onClick={() => onSelectChat(request, otherUser)}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUser.profileImage} />
                      <AvatarFallback>{otherUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate text-text-primary-light dark:text-text-primary-dark">{otherUser.name}</h3>
                        <Badge className={getStatusColor(request.status)}>
                          {getStatusText(request.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark mb-1">
                        <Dog className="w-4 h-4" />
                        <span>{request.dogId}</span>
                        <Clock className="w-4 h-4 ml-2" />
                        <span>{request.duration} min</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
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
      </div>
  );
};

export default ChatList;
