import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getNearbyUsers, updateUserLocation } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Heart, X, MapPin, Clock, Star, Phone, MessageCircle, Filter, User, RefreshCw, Switch } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { User as UserType } from '@/types';

const HomePage: React.FC = () => {
  const { userProfile, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [nearbyUsers, setNearbyUsers] = useState<UserType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [maxDistance, setMaxDistance] = useState(50);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ latitude, longitude });
          
          // Update user's location in database
          if (userProfile?.id) {
            updateUserLocation(userProfile.id, latitude, longitude).catch(console.error);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          // Fallback to Madrid coordinates
          setUserLocation({ latitude: 40.4168, longitude: -3.7038 });
        }
      );
    } else {
      // Fallback to Madrid coordinates
      setUserLocation({ latitude: 40.4168, longitude: -3.7038 });
    }
  }, [userProfile?.id]);

  useEffect(() => {
    const loadNearbyUsers = async () => {
      if (!userProfile || !userLocation) return;
      
      try {
        setLoading(true);
        // Show opposite role users
        const targetRole = userProfile.userType === 'owner' ? 'walker' : 'owner';
        const usersData = await getNearbyUsers(
          userLocation.latitude, 
          userLocation.longitude, 
          targetRole, 
          maxDistance
        );
        setNearbyUsers(usersData);
      } catch (error) {
        console.error('Error loading nearby users:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios cercanos.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadNearbyUsers();
  }, [userProfile, userLocation, maxDistance, toast]);

  const handleLike = () => {
    const currentUser = nearbyUsers[currentIndex];
    if (currentUser) {
      toast({
        title: "¡Me gusta! ❤️",
        description: `Te gusta ${currentUser.name}`,
      });
      nextUser();
    }
  };

  const handlePass = () => {
    nextUser();
  };

  const nextUser = () => {
    if (currentIndex < nearbyUsers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more users, show end message
      toast({
        title: "¡Eso es todo! 🎉",
        description: "Has visto todos los usuarios disponibles en tu área.",
      });
    }
  };

  const handleContact = (userId: string) => {
    // Navigate to messaging or contact form
    navigate('/messages');
  };

  const refreshUsers = () => {
    setCurrentIndex(0);
    // The useEffect will trigger a reload
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stitch-primary mx-auto mb-4"></div>
          <p className="text-stitch-text-secondary-light">
            {userProfile?.userType === 'owner' ? 'Buscando paseadores cercanos...' : 'Buscando dueños de perros cercanos...'}
          </p>
        </div>
      </div>
    );
  }

  if (nearbyUsers.length === 0) {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-stitch-primary to-stitch-secondary rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>pets</span>
            </div>
            <h2 className="text-2xl font-bold text-stitch-text-primary-light mb-4 font-display">
              No hay usuarios disponibles
            </h2>
            <p className="text-stitch-text-secondary-light mb-6">
              {userProfile?.userType === 'owner' 
                ? 'No hay paseadores cerca de tu ubicación en este momento.'
                : 'No hay dueños de perros cerca de tu ubicación en este momento.'
              }
            </p>
            <Button 
              onClick={refreshUsers}
              className="bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md"
            >
              <span className="material-symbols-outlined mr-2">refresh</span>
              Intentar de nuevo
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentIndex >= nearbyUsers.length) {
    return (
      <div className="min-h-screen bg-stitch-bg-light flex items-center justify-center p-4">
        <Card className="w-full max-w-md rounded-3xl shadow-lg border-0">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-md">
              <span className="material-symbols-outlined text-white text-5xl" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-stitch-text-primary-light mb-4 font-display">
              ¡Has visto todos!
            </h2>
            <p className="text-stitch-text-secondary-light mb-6">
              Has revisado todos los usuarios disponibles en tu área. Vuelve más tarde para ver nuevos perfiles.
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => setCurrentIndex(0)}
                className="w-full bg-gradient-to-r from-stitch-primary to-stitch-secondary hover:from-stitch-primary/90 hover:to-stitch-secondary/90 text-white rounded-2xl shadow-md"
              >
                Ver de nuevo
              </Button>
              <Button 
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="w-full rounded-2xl"
              >
                Ir al dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentUser = nearbyUsers[currentIndex];

  return (
    <div className="min-h-screen bg-stitch-bg-light">
      {/* Header */}
      <div className="bg-stitch-card-light shadow-md border-b border-stitch-border-light">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stitch-text-primary-light font-display flex items-center gap-2">
            <span className="material-symbols-outlined text-stitch-primary" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>
              {userProfile?.userType === 'owner' ? 'hiking' : 'pets'}
            </span>
            {userProfile?.userType === 'owner' ? 'Paseadores' : 'Dueños'}
          </h1>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" onClick={refreshUsers} className="rounded-xl">
              <span className="material-symbols-outlined">refresh</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="rounded-xl">
              <span className="material-symbols-outlined">person</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Card Stack */}
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="relative h-[600px]">
          <Card className="absolute inset-0 shadow-2xl border-0 overflow-hidden rounded-3xl">
            <CardContent className="p-0 h-full">
              {/* User Image */}
              <div className="h-3/5 bg-gradient-to-br from-stitch-primary to-stitch-secondary relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute top-4 right-4 flex flex-col gap-2">
                  <Badge className="bg-white/95 text-stitch-text-primary-light rounded-xl shadow-md border-0">
                    <span className="material-symbols-outlined text-yellow-500 text-sm mr-1" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>star</span>
                    {currentUser.rating || 0}
                  </Badge>
                  {currentUser.distanceKm && (
                    <Badge className="bg-white/95 text-stitch-text-primary-light rounded-xl shadow-md border-0">
                      <span className="material-symbols-outlined text-stitch-primary text-sm mr-1">location_on</span>
                      {Math.round(currentUser.distanceKm)} km
                    </Badge>
                  )}
                </div>
                {currentUser.profileImage && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="w-36 h-36 border-4 border-white shadow-xl rounded-3xl">
                      <AvatarImage src={currentUser.profileImage} />
                      <AvatarFallback className="text-3xl font-bold rounded-3xl bg-gradient-to-br from-stitch-primary to-stitch-secondary text-white">
                        {currentUser.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
              </div>

              {/* User Info */}
              <div className="h-2/5 p-6 bg-stitch-card-light">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-stitch-text-primary-light font-display">
                      {currentUser.name}
                    </h2>
                    <p className="text-stitch-text-secondary-light text-sm mt-1">{currentUser.bio || 'Sin descripción'}</p>
                  </div>
                  {currentUser.userType === 'walker' && currentUser.hourlyRate && (
                    <Badge className="bg-green-100 text-green-800 border-0 rounded-xl">
                      €{currentUser.hourlyRate}/h
                    </Badge>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {currentUser.userType === 'walker' && (
                    <>
                      <div className="flex items-center text-sm text-stitch-text-secondary-light">
                        <span className="material-symbols-outlined text-base mr-2">hiking</span>
                        {currentUser.totalWalks || 0} paseos realizados
                      </div>
                      <div className="flex items-center text-sm text-stitch-text-secondary-light">
                        <span className="material-symbols-outlined text-base mr-2">schedule</span>
                        {currentUser.experience || 0} años de experiencia
                      </div>
                    </>
                  )}
                  {currentUser.userType === 'owner' && (
                    <div className="flex items-center text-sm text-stitch-text-secondary-light">
                      <span className="material-symbols-outlined text-base mr-2">location_on</span>
                      {currentUser.city}
                    </div>
                  )}
                </div>

                {currentUser.availability && currentUser.availability.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {currentUser.availability.slice(0, 3).map((availability, index) => (
                      <Badge key={index} variant="outline" className="text-xs rounded-xl">
                        {availability}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center space-x-6 mt-8">
          <Button
            onClick={handlePass}
            size="lg"
            variant="outline"
            className="w-16 h-16 rounded-full border-2 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-md transition-all"
          >
            <span className="material-symbols-outlined text-4xl text-red-500">close</span>
          </Button>
          
          <Button
            onClick={() => handleContact(currentUser.id)}
            size="lg"
            className="w-20 h-20 rounded-full bg-stitch-primary hover:bg-stitch-primary/90 shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>chat_bubble</span>
          </Button>
          
          <Button
            onClick={handleLike}
            size="lg"
            className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 shadow-md hover:shadow-lg transition-all hover:scale-105"
          >
            <span className="material-symbols-outlined text-4xl text-white" style={{ fontVariationSettings: '"FILL" 1, "wght" 600' }}>favorite</span>
          </Button>
        </div>

        {/* Progress */}
        <div className="mt-8 text-center">
          <p className="text-sm text-stitch-text-secondary-light font-medium mb-3">
            {currentIndex + 1} de {nearbyUsers.length} usuarios
          </p>
          <div className="w-full bg-stitch-border-light rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-stitch-primary to-stitch-secondary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / nearbyUsers.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
