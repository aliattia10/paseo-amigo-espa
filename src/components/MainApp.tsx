import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MapPin, Dog, User, LogOut, Plus } from 'lucide-react';
import appLogo from '@/assets/app-logo.png';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  name: string;
  city: string;
  user_type: 'owner' | 'walker';
  verified: boolean;
  rating: number | null;
  total_reviews: number;
}

interface MainAppProps {
  user: SupabaseUser;
  session: Session;
  onSignOut: () => void;
}

const MainApp: React.FC<MainAppProps> = ({ user, session, onSignOut }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchProfile();
  }, [user.id]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "No se pudo cargar tu perfil",
          variant: "destructive",
        });
      } else {
        setProfile(data as Profile);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error",
        description: "No se pudo cerrar sesión",
        variant: "destructive",
      });
    } else {
      onSignOut();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center">
        <div className="text-center">
          <img src={appLogo} alt="Loading" className="w-16 h-16 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-warm-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center">Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-4">No se pudo cargar tu perfil.</p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderOwnerHome = () => (
    <div className="min-h-screen bg-warm-bg">
      <header className="bg-white shadow-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-warm-text">¿Damos un Paseo?</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-warm-text mb-2">Hola {profile.name},</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{profile.city}</span>
          </div>
          {profile.verified && (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
              Cuenta Verificada
            </Badge>
          )}
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5" />
                Mis Perros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                Añade el perfil de tu perro para empezar
              </p>
              <Button variant="terracotta" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Añadir Perro
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Buscar Compañeros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                Encuentra compañeros de paseo cerca de ti
              </p>
              <Button variant="warm" className="w-full">
                <MapPin className="w-4 h-4 mr-2" />
                Explorar Área
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paseos Recientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                No hay paseos aún. ¡Encuentra un compañero para tu perro!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderWalkerHome = () => (
    <div className="min-h-screen bg-warm-bg">
      <header className="bg-white shadow-sm border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={appLogo} alt="Logo" className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-warm-text">¿Damos un Paseo?</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut}>
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-warm-text mb-2">Hola {profile.name},</h2>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{profile.city}</span>
          </div>
          {profile.verified && (
            <Badge variant="secondary" className="mt-2 bg-green-100 text-green-800">
              Cuenta Verificada
            </Badge>
          )}
          {profile.rating && (
            <div className="mt-2">
              <span className="text-lg font-semibold">{profile.rating}/5</span>
              <span className="text-sm text-muted-foreground ml-1">
                ({profile.total_reviews} valoraciones)
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4 max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                Solicitudes Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                No hay solicitudes pendientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dog className="w-5 h-5" />
                Paseos Activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center">
                No hay paseos activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mi Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center mb-4">
                Completa tu perfil para recibir más solicitudes
              </p>
              <Button variant="terracotta" className="w-full">
                <User className="w-4 h-4 mr-2" />
                Editar Perfil
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );

  return profile.user_type === 'owner' ? renderOwnerHome() : renderWalkerHome();
};

export default MainApp;