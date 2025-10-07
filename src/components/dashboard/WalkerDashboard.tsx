import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getWalkRequestsByWalker, getWalkerProfile } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, LogOut, Settings, Star, DollarSign, CheckCircle, MessageCircle, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WalkRequest, WalkerProfile } from '@/types';

const WalkerDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState<WalkRequest[]>([]);
  const [walkerProfile, setWalkerProfile] = useState<WalkerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;
      
      try {
        const [requestsData, profileData] = await Promise.all([
          getWalkRequestsByWalker(userProfile.id),
          getWalkerProfile(userProfile.id)
        ]);
        
        setPendingRequests(requestsData.filter(r => r.status === 'pending'));
        setWalkerProfile(profileData);
      } catch (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userProfile, toast]);

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Error al cerrar sesión.",
        variant: "destructive",
      });
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    // TODO: Implement accept request functionality
    toast({
      title: "Solicitud aceptada",
      description: "Has aceptado la solicitud de paseo.",
    });
  };

  const handleDeclineRequest = async (requestId: string) => {
    // TODO: Implement decline request functionality
    toast({
      title: "Solicitud rechazada",
      description: "Has rechazado la solicitud de paseo.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={userProfile?.profileImage} />
                <AvatarFallback>{userProfile?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-xl font-semibold">Hola, {userProfile?.name}</h1>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{userProfile?.city}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => navigate('/messages')}>
                <MessageCircle className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/subscription')}>
                <Crown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Profile Stats */}
        {walkerProfile && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-terracotta">
                  {walkerProfile.totalWalks}
                </div>
                <div className="text-sm text-muted-foreground">Paseos Completados</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-mediterranean">
                  {walkerProfile.rating.toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">Valoración</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-sunny">
                  €{walkerProfile.hourlyRate}
                </div>
                <div className="text-sm text-muted-foreground">Por Hora</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {pendingRequests.length}
                </div>
                <div className="text-sm text-muted-foreground">Pendientes</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pending Requests */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Solicitudes Pendientes</h2>
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay solicitudes pendientes en este momento.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Las nuevas solicitudes aparecerán aquí automáticamente.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="border-2 border-terracotta">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">
                            Paseo para {request.dogId}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {request.date.toLocaleDateString()} • {request.time} • {request.duration} min
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {request.location} • €{request.price}
                          </p>
                          {request.notes && (
                            <p className="text-sm text-muted-foreground mt-2">
                              <strong>Notas:</strong> {request.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Nueva
                        </Badge>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Aceptar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            Rechazar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Actividad Reciente</h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Paseo completado con Max</p>
                    <p className="text-sm text-muted-foreground">Hace 2 horas • 45 min • €15</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">5.0</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Paseo programado con Luna</p>
                    <p className="text-sm text-muted-foreground">Mañana • 30 min • €10</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="terracotta" 
            size="lg" 
            className="h-16 text-lg"
            onClick={() => {/* Navigate to profile settings */}}
          >
            <Settings className="mr-3 w-5 h-5" />
            Configurar Perfil
          </Button>
          
          <Button 
            variant="warm" 
            size="lg" 
            className="h-16 text-lg"
            onClick={() => {/* Navigate to availability */}}
          >
            <Clock className="mr-3 w-5 h-5" />
            Gestionar Disponibilidad
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WalkerDashboard; 