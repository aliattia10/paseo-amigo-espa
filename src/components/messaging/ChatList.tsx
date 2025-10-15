import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from '@/contexts/AuthContext';
import { getWalkRequestsByOwner, getWalkRequestsByWalker } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Clock, MapPin, Dog } from 'lucide-react';
import type { WalkRequest } from '@/types';

interface ChatListProps {
  onSelectChat: (walkRequest: WalkRequest, otherUser: { id: string; name: string; profileImage?: string }) => void;
}

const ChatList: React.FC<ChatListProps> = ({ onSelectChat }) => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const [walkRequests, setWalkRequests] = useState<WalkRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalkRequests = async () => {
      if (!userProfile) return;

      try {
        const requests = userProfile.userType === 'owner' 
          ? await getWalkRequestsByOwner(userProfile.id)
          : await getWalkRequestsByWalker(userProfile.id);
        
        // Filter requests that are relevant for chat. Include 'pending' so owners and walkers can
        // message each other before a request is accepted.
        const activeRequests = requests.filter(
          request => ['pending', 'accepted', 'in-progress'].includes(request.status)
        );
        
        setWalkRequests(activeRequests);
      } catch (error) {
        console.error('Error loading walk requests:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar las conversaciones.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWalkRequests();
  }, [userProfile, toast]);

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy';
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-ES');
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
        return 'Aceptado';
      case 'in-progress':
        return 'En progreso';
      case 'completed':
        return 'Completado';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-terracotta mx-auto mb-2"></div>
          <p className="text-muted-foreground">Cargando conversaciones...</p>
        </div>
      </div>
    );
  }

  if (walkRequests.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay conversaciones</h3>
          <p className="text-muted-foreground">
            {userProfile?.userType === 'owner' 
              ? 'Cuando acepten una solicitud de paseo, podrás chatear aquí.'
              : 'Cuando aceptes una solicitud, podrás chatear con el dueño aquí.'
            }
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
          Conversaciones
        </h2>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="space-y-1">
            {walkRequests.map((request) => {
              // For demo purposes, we'll use placeholder data for the other user
              // In a real app, you'd fetch this from the database
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
