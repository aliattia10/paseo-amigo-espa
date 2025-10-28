import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from '@/contexts/AuthContext';
import { getNearbyUsers, updateUserLocation } from '@/lib/supabase-services';
import { useToast } from '@/hooks/use-toast';
import { Heart, X, MapPin, Clock, Star, Phone, MessageCircle, Filter, User, RefreshCw } from 'lucide-react';
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
  const [locationError, setLocationError] = useState<{
    denied: boolean;
    message: string;
  } | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  // Function to request location
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError({
        denied: true,
        message: 'Geolocation is not supported by your browser.'
      });
      return;
    }

    setIsRequestingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });
        setLocationError(null); // Clear any previous errors
        
        // Update user's location in database
        if (userProfile?.id) {
          updateUserLocation(userProfile.id, latitude, longitude).catch(console.error);
        }
        
        setIsRequestingLocation(false);
        
        toast({
          title: "Location Enabled ✓",
          description: "You can now see nearby matches!",
        });
      },
      (error) => {
        console.error('Error getting location:', error);
        let errorMessage = 'Unable to get your location.';
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied. Please enable location access to see nearby matches.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
          default:
            errorMessage = 'An unknown error occurred.';
            break;
        }
        
        setLocationError({
          denied: error.code === error.PERMISSION_DENIED,
          message: errorMessage
        });
        
        setIsRequestingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // Get user's current location on mount
  useEffect(() => {
    requestLocation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const loadNearbyUsers = async () => {
      // Don't load users if location is denied or we're still requesting location
      if (!userProfile || !userLocation || locationError?.denied || isRequestingLocation) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // Show opposite role users
        const targetRole = userProfile.userType === 'owner' ? 'walker' : 'owner';
        const usersData = await getNearbyUsers(
          targetRole,
          userLocation.latitude, 
          userLocation.longitude, 
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
  }, [userProfile, userLocation, maxDistance, toast, locationError, isRequestingLocation]);

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

  // Show location denied error screen
  if (locationError?.denied) {
    return (
      <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden max-w-md mx-auto border-x border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-red-500 text-5xl">location_off</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0e1b13] dark:text-gray-100 mb-4 font-display">
              Location access denied
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Please enable location access to see nearby matches
            </p>
            <div className="space-y-3">
              <button 
                onClick={requestLocation}
                disabled={isRequestingLocation}
                className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-home-primary text-[#0e1b13] text-base font-bold leading-normal tracking-[0.015em] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isRequestingLocation ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-[#0e1b13] border-t-transparent mr-2"></div>
                    Requesting...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined mr-2">location_on</span>
                    Enable Location
                  </>
                )}
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 dark:bg-gray-800 text-[#0e1b13] dark:text-gray-100 text-base font-medium leading-normal"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || isRequestingLocation) {
    return (
      <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden max-w-md mx-auto border-x border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-home-primary mx-auto mb-4"></div>
            <p className="text-[#0e1b13] dark:text-gray-100">
              {isRequestingLocation 
                ? 'Requesting location access...'
                : userProfile?.userType === 'owner' 
                  ? 'Buscando paseadores cercanos...' 
                  : 'Buscando dueños de perros cercanos...'
              }
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (nearbyUsers.length === 0) {
    return (
      <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden max-w-md mx-auto border-x border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-home-primary/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-home-primary text-5xl">search_off</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0e1b13] dark:text-gray-100 mb-4 font-display">
              No hay usuarios disponibles
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {userProfile?.userType === 'owner' 
                ? 'No hay paseadores cerca de tu ubicación en este momento.'
                : 'No hay dueños de perros cerca de tu ubicación en este momento.'
              }
            </p>
            <button 
              onClick={refreshUsers}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-home-primary text-[#0e1b13] text-base font-bold leading-normal tracking-[0.015em] mx-auto"
            >
              <span className="material-symbols-outlined mr-2">refresh</span>
              Intentar de nuevo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentIndex >= nearbyUsers.length) {
    return (
      <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden max-w-md mx-auto border-x border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-green-500/20 rounded-xl flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-green-500 text-5xl" style={{ fontVariationSettings: '"FILL" 1' }}>check_circle</span>
            </div>
            <h2 className="text-2xl font-bold text-[#0e1b13] dark:text-gray-100 mb-4 font-display">
              ¡Has visto todos!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Has revisado todos los usuarios disponibles en tu área.
            </p>
            <div className="space-y-3">
              <button 
                onClick={() => setCurrentIndex(0)}
                className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-home-primary text-[#0e1b13] text-base font-bold leading-normal tracking-[0.015em]"
              >
                Ver de nuevo
              </button>
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-gray-200 dark:bg-gray-800 text-[#0e1b13] dark:text-gray-100 text-base font-medium leading-normal"
              >
                Ir al dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentUser = nearbyUsers[currentIndex];

  return (
    <div className="relative flex h-screen w-full flex-col group/design-root overflow-hidden max-w-md mx-auto border-x border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark">
      {/* Top App Bar */}
      <header className="flex items-center bg-home-background-light dark:bg-home-background-dark p-4 pb-2 justify-between shrink-0">
        <div className="flex size-12 shrink-0 items-center justify-start">
          <span className="material-symbols-outlined text-3xl text-home-primary">pets</span>
        </div>
        <h1 className="text-[#0e1b13] dark:text-gray-100 text-xl font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
          {userProfile?.userType === 'owner' ? 'Encuentra Paseador' : 'Encuentra Dueño'}
        </h1>
        <div className="flex w-12 items-center justify-end">
          <button 
            onClick={refreshUsers}
            className="flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-10 w-10 bg-transparent text-[#0e1b13] dark:text-gray-100 p-0 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <span className="material-symbols-outlined">tune</span>
          </button>
        </div>
      </header>

      {/* Main Content: Card Stack */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 pt-2 overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Background Card 2 */}
          <div className="absolute w-[90%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-md transform scale-95 -translate-y-4"></div>
          {/* Background Card 1 */}
          <div className="absolute w-[95%] h-[95%] bg-white dark:bg-gray-800 rounded-xl shadow-lg transform scale-95"></div>
          {/* Main Card */}
          <div 
            className="absolute bg-cover bg-center flex flex-col items-stretch justify-end rounded-xl shadow-xl w-full h-full"
            style={{
              backgroundImage: currentUser.profileImage 
                ? `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), url("${currentUser.profileImage}")`
                : `linear-gradient(0deg, rgba(0, 0, 0, 0.5) 0%, rgba(0, 0, 0, 0) 40%), linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
            }}
          >
            <div className="flex w-full items-end justify-between gap-4 p-4">
              <div className="flex max-w-[440px] flex-1 flex-col gap-1">
                {currentUser.distanceKm && (
                  <p className="text-white text-base font-medium leading-normal bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full self-start">
                    {Math.round(currentUser.distanceKm)} km away
                  </p>
                )}
                <p className="text-white tracking-tight text-3xl font-bold leading-tight max-w-[440px]">
                  {currentUser.name}
                  {currentUser.userType === 'walker' && currentUser.hourlyRate && (
                    <span className="text-lg font-normal ml-2">€{currentUser.hourlyRate}/h</span>
                  )}
                  {currentUser.petType && (
                    <span className="text-2xl ml-2">
                      {currentUser.petType === 'cat' ? '🐱' : '🐕'}
                    </span>
                  )}
                </p>
                <div className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-yellow-400" style={{ fontVariationSettings: '"FILL" 1' }}>star</span>
                  <p className="text-white text-lg font-medium leading-normal">{currentUser.rating || '5.0'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Action Buttons */}
      <div className="flex flex-shrink-0 gap-4 flex-wrap px-4 py-4 justify-center items-center bg-home-background-light dark:bg-home-background-dark">
        <button 
          onClick={handlePass}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-red-500 shadow-md hover:bg-red-50 dark:hover:bg-red-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl">close</span>
        </button>
        <button 
          onClick={handleLike}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-20 w-20 bg-home-primary text-[#0e1b13] dark:text-black shadow-lg shadow-home-primary/30 hover:opacity-90 transition-opacity"
        >
          <span className="material-symbols-outlined text-5xl">favorite</span>
        </button>
        <button 
          onClick={() => handleContact(currentUser.id)}
          className="flex min-w-0 max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-full h-16 w-16 bg-white dark:bg-gray-800 text-blue-500 shadow-md hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
        >
          <span className="material-symbols-outlined text-4xl">info</span>
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <footer className="flex gap-2 border-t border-gray-200 dark:border-gray-800 bg-home-background-light dark:bg-home-background-dark px-4 pb-3 pt-2 shrink-0">
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex flex-1 flex-col items-center justify-end gap-1 rounded-full text-home-primary"
        >
          <div className="text-home-primary flex h-8 items-center justify-center">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>home</span>
          </div>
          <p className="text-home-primary text-xs font-bold leading-normal tracking-[0.015em]">Home</p>
        </button>
        <button 
          onClick={() => navigate('/messages')}
          className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 dark:text-gray-400"
        >
          <div className="text-gray-500 dark:text-gray-400 flex h-8 items-center justify-center">
            <span className="material-symbols-outlined">chat_bubble</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-normal tracking-[0.015em]">Messages</p>
        </button>
        <button 
          onClick={() => navigate('/dashboard')}
          className="flex flex-1 flex-col items-center justify-end gap-1 text-gray-500 dark:text-gray-400"
        >
          <div className="text-gray-500 dark:text-gray-400 flex h-8 items-center justify-center">
            <span className="material-symbols-outlined">person</span>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-xs font-medium leading-normal tracking-[0.015em]">Profile</p>
        </button>
      </footer>
    </div>
  );
};

export default HomePage;
