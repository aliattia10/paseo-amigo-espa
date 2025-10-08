import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getDogsByOwner, getWalkRequestsByOwner } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Heart, MapPin, Clock, Plus, LogOut, User, Settings, MessageCircle, Crown, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Dog, WalkRequest } from '@/types';
import HomePage from './HomePage';

const OwnerDashboard: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [dogs, setDogs] = useState<Dog[]>([]);
  const [recentWalks, setRecentWalks] = useState<WalkRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentView, setCurrentView] = useState<'dashboard' | 'home'>('home');

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;

      setLoading(true);
      try {
        const [dogsData, walksData] = await Promise.all([
          getDogsByOwner(userProfile.id),
          getWalkRequestsByOwner(userProfile.id)
        ]);

        setDogs(dogsData);
        setRecentWalks(walksData.slice(0, 3));
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

    if (currentView === 'dashboard') {
      loadData();
    }
  }, [userProfile, toast, currentView]);

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

  // Show HomePage (Tinder-like) by default
  if (currentView === 'home') {
    return <HomePage />;
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
              <Button variant="ghost" size="icon" onClick={() => setCurrentView('home')}>
                <Search className="w-4 h-4" />
              </Button>
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
        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Button 
            variant="terracotta" 
            size="lg" 
            className="h-20 text-lg"
            onClick={() => {/* Navigate to find walker */}}
          >
            <Heart className="mr-3 w-6 h-6" />
            Encontrar un Compañero
          </Button>
          
          <Button 
            variant="warm" 
            size="lg" 
            className="h-20 text-lg"
            onClick={() => {/* Navigate to add dog */}}
          >
            <Plus className="mr-3 w-6 h-6" />
            Añadir Perro
          </Button>
        </div>

        {/* Dogs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Mis Perros</h2>
          {dogs.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground mb-4">
                  Aún no has añadido ningún perro a tu perfil.
                </p>
                <Button onClick={() => {/* Navigate to add dog */}}>
                  <Plus className="mr-2 w-4 h-4" />
                  Añadir mi primer perro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dogs.map((dog) => (
                <Card key={dog.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={dog.imageUrl} />
                        <AvatarFallback>{dog.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{dog.name}</h3>
                        <p className="text-sm text-muted-foreground">{dog.age} • {dog.breed}</p>
                        <Badge variant="secondary" className="mt-1">Activo</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Recent Walks */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Paseos Recientes</h2>
          {recentWalks.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  No hay paseos recientes. ¡Encuentra un compañero para tus perros!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentWalks.map((walk) => (
                <Card key={walk.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-terracotta flex items-center justify-center">
                          <Heart className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">Paseo con {walk.walkerId}</h3>
                          <p className="text-sm text-muted-foreground">
                            {walk.date.toLocaleDateString()} • {walk.duration} min
                          </p>
                        </div>
                      </div>
                      <Badge 
                        variant={walk.status === 'completed' ? 'default' : 'secondary'}
                      >
                        {walk.status === 'completed' ? 'Completado' : 'En progreso'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-terracotta">{dogs.length}</div>
              <div className="text-sm text-muted-foreground">Perros</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-mediterranean">
                {recentWalks.filter(w => w.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Paseos Completados</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-sunny">
                {recentWalks.filter(w => w.status === 'pending').length}
              </div>
              <div className="text-sm text-muted-foreground">Pendientes</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard; 