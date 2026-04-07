import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LocationContextType {
  location: { latitude: number; longitude: number } | null;
  locationEnabled: boolean;
  requestLocation: () => Promise<void>;
  updateUserLocation: (lat: number, lon: number) => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const { t } = useTranslation();
  const { toast } = useToast();
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationEnabled, setLocationEnabled] = useState(false);

  // Load saved preferences
  useEffect(() => {
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

  // Set up permission change listener
  useEffect(() => {
    if (!navigator.permissions) return;

    let permissionStatus: PermissionStatus | null = null;

    const setupListener = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        
        const handleChange = () => {
          if (!permissionStatus) return;
          
          // If permission was granted, automatically get location
          if (permissionStatus.state === 'granted' && !locationEnabled) {
            // Use a small delay to ensure the permission is fully granted
            setTimeout(() => {
              requestLocation();
            }, 100);
          }
          
          // If permission was denied, clear saved state
          if (permissionStatus.state === 'denied') {
            localStorage.removeItem('locationEnabled');
            setLocationEnabled(false);
            setLocation(null);
          }
        };

        permissionStatus.addEventListener('change', handleChange);
        
        // Cleanup
        return () => {
          if (permissionStatus) {
            permissionStatus.removeEventListener('change', handleChange);
          }
        };
      } catch (e) {
        console.log('Permissions API not supported:', e);
      }
    };

    setupListener();
  }, [locationEnabled]);

  // Request location permission
  const requestLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: t('location.notSupported'),
        description: t('location.notSupportedDesc'),
        variant: 'destructive',
      });
      return;
    }

    // Check if permission is already granted
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
          // Nothing to do here; let the geolocation API handle the request
        
        // Note: We don't return early on 'denied' state because sometimes
        // the Permissions API is out of sync with actual browser settings
        // Let the geolocation API itself handle the permission
      } catch (e) {
        console.log('Permissions API not supported, continuing with geolocation request');
      }
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
        title: t('location.enabled'),
        description: t('location.enabledDesc'),
      });
    } catch (error: any) {
      console.error('Error getting location:', error);
      
      let errorMessage = t('location.unableToGet');
      let errorDescription = t('location.tryAgainShort');
      
      if (error?.code === 1) {
        errorMessage = t('location.denied');
        errorDescription = t('location.deniedDesc');
      } else if (error?.code === 2) {
        errorMessage = t('location.unavailable');
        errorDescription = t('location.unavailableDesc');
      } else if (error?.code === 3) {
        errorMessage = t('location.timedOut');
        errorDescription = t('location.timedOutDesc');
      }
      
      toast({
        title: errorMessage,
        description: errorDescription,
        variant: 'destructive',
        duration: 6000,
      });
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

  return (
    <LocationContext.Provider
      value={{
        location,
        locationEnabled,
        requestLocation,
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
