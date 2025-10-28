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

      // Update user location in database
      if (currentUser) {
        await updateUserLocation(latitude, longitude);
      }

      toast({
        title: '📍 Location enabled',
        description: 'You can now see nearby matches',
      });
    } catch (error) {
      console.error('Error getting location:', error);
      toast({
        title: 'Location access denied',
        description: 'Please enable location access to see nearby matches',
        variant: 'destructive',
      });
    }
  };

  // Update user location in database
  const updateUserLocation = async (lat: number, lon: number) => {
    if (!currentUser) return;

    try {
      // Use RPC function to update location
      const { error } = await (supabase.rpc as any)('update_user_location', {
        user_id: currentUser.id,
        lat: lat,
        lon: lon,
      });

      if (error) {
        console.error('Error updating location via RPC:', error);
        // Fallback to direct update
        const { error: updateError } = await supabase
          .from('users')
          .update({
            latitude: lat,
            longitude: lon,
            location_enabled: true,
            location_updated_at: new Date().toISOString(),
          } as any)
          .eq('id', currentUser.id);
        
        if (updateError) throw updateError;
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
