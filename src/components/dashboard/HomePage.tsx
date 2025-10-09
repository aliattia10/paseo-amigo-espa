import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getNearbyWalkers } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Heart, X, MapPin, Clock, Star, Phone, MessageCircle, Filter, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { WalkerProfile } from '@/types';

const HomePage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [walkers, setWalkers] = useState<WalkerProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWalkers = async () => {
      if (!userProfile) return;
      
      try {
        const walkersData = await getNearbyWalkers(userProfile.city);
        setWalkers(walkersData);
      } catch (error) {
        console.error('Error loading walkers:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los paseadores cercanos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadWalkers();
  }, [userProfile, toast]);

  const handleLike = () => {
    const currentWalker = walkers[currentIndex];
    if (currentWalker) {
      toast({
        title: "¡Me gusta! ❤️",
        description: `Te gusta ${currentWalker.userName || 'este paseador'}`,
      });
      nextWalker();
    }
  };

  const handlePass = () => {
    nextWalker();
  };

  const nextWalker = () => {
    if (currentIndex < walkers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more walkers, show end message
      toast({
        title: "¡Eso es todo! 🎉",
        description: "Has visto todos los paseadores disponibles en tu área.",
      });
    }
  };

  const handleContact = (walkerId: string) => {
    // Navigate to messaging or contact form
    navigate('/messages');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terracotta mx-auto mb-4"></div>
          <p className="text-muted-foreground">Buscando paseadores cercanos...</p>
        </div>
      </div>
    );
  }

  if (walkers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-terracotta rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🐕</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-text mb-4">
              No hay paseadores disponibles
            </h2>
            <p className="text-muted-foreground mb-6">
              No encontramos paseadores en tu área. Intenta más tarde o expande tu búsqueda.
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-terracotta hover:bg-terracotta/90"
            >
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentIndex >= walkers.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-neutral-text mb-4">
              ¡Has visto todos!
            </h2>
            <p className="text-muted-foreground mb-6">
              Has revisado todos los paseadores disponibles en tu área. Vuelve más tarde para ver nuevos perfiles.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setCurrentIndex(0)}
                className="w-full bg-terracotta hover:bg-terracotta/90"
              >
                Ver de nuevo
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full"
              >
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentWalker = walkers[currentIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sunny-light via-warm-bg to-mediterranean-light">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-neutral-text">🐕 Paseadores</h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm">
              <Filter className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
              <User className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="relative h-[600px]">
          <Card className="absolute inset-0 shadow-lg border-0 overflow-hidden">
            <CardContent className="p-0 h-full">
              {/* Walker Image */}
              <div className="h-3/5 bg-gradient-to-br from-blue-400 to-purple-500 relative">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="absolute top-4 right-4">
                  <Badge className="bg-white/90 text-black">
                    {currentWalker.rating} ⭐
                  </Badge>
                </div>
              </div>

              {/* Walker Info */}
              <div className="h-2/5 p-6 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-neutral-text">
                      {currentWalker.userName || `Paseador ${currentIndex + 1}`}
                    </h2>
                    <p className="text-muted-foreground">{currentWalker.bio}</p>
                  </div>
                  <Badge variant="secondary">
                    €{currentWalker.hourlyRate}/h
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-4 w-4 mr-2" />
                    {currentWalker.totalWalks} paseos realizados
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {currentWalker.experience}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {currentWalker.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-8 mt-8">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-300 hover:bg-red-50"
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          
          <Button
            onClick={() => handleContact(currentWalker.userId)}
            size="lg"
            className="w-16 h-16 rounded-full bg-blue-500 hover:bg-blue-600"
          >
            <MessageCircle className="h-8 w-8 text-white" />
          </Button>
          
          <Button
            onClick={handleLike}
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600"
          >
            <Heart className="h-8 w-8 text-white" />
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} de {walkers.length} paseadores
          </p>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-terracotta h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / walkers.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
