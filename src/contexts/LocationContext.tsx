import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  locationEnabled: boolean;
  isGlobalMode: boolean;
  requestLocation: () => Promise<void>;
  toggleGlobalMode: () => void;
  updateUserLocation: (lat: number, lon: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [isGlobalMode, setIsGlobalMode] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const savedGlobalMode = localStorage.getItem('globalMode') === 'true';
    setIsGlobalMode(savedGlobalMode);
    
    const savedLocationEnabled = localStorage.getItem('locationEnabled') === 'true';
    if (savedLocationEnabled) {
      setLocationEnabled(true);
      // Optionally try to get current location again
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation({ 
              latitude: position.coords.latitude, 
              longitude: position.coords.longitude 
            });
          },
          (error) => {
            console.error('Error getting saved location:', error);
            // If we can't get location, remove the saved flag
            localStorage.removeItem('locationEnabled');
            setLocationEnabled(false);
          },
          { timeout: 5000, maximumAge: 600000 } // 10 minute cache
        );
      }
    }
  }, []);

  // Request location permission
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: 'Location not supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      });
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
      setLocationEnabled(true);
      
      // Save location enabled state
      localStorage.setItem('locationEnabled', 'true');

      // Update user location in database
      if (currentUser) {
        await updateUserLocation(latitude, longitude);
      }

      toast({
        title: '📍 Location enabled',
        description: 'You can now see nearby matches',
      });
    } catch (error: any) {
      console.error('Error getting location:', error);
      
      // Only show toast if user explicitly denied (not if it just timed out or unavailable)
      if (error?.code === 1) { // PERMISSION_DENIED
        toast({
          title: 'Location access denied',
          description: 'To enable location, click the location icon in your browser address bar',
          variant: 'destructive',
        });
      }
      // For other errors, fail silently - the UI will show the prompt
    }
  };

  // Update user location in database
  const updateUserLocation = async (lat: number, lon: number) => {
    if (!currentUser) return;

    try {
      // Direct update to users table
      const { error } = await supabase
        .from('users')
        .update({
          latitude: lat,
          longitude: lon,
          location_enabled: true,
          location_updated_at: new Date().toISOString(),
        })
        .eq('id', currentUser.id);
      
      if (error) {
        console.error('Error updating location:', error);
      }
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Toggle between local and global mode
  const toggleGlobalMode = () => {
    const newMode = !isGlobalMode;
    setIsGlobalMode(newMode);
    localStorage.setItem('globalMode', String(newMode));
    
    toast({
      title: newMode ? '🌍 Global mode' : '📍 Local mode',
      description: newMode 
        ? 'Showing profiles from everywhere' 
        : 'Showing nearby profiles only',
    });
  };

  return (
    <LocationContext.Provider
      value={{
        location,
        locationEnabled,
        isGlobalMode,
        requestLocation,
        toggleGlobalMode,
        updateUserLocation,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
};
