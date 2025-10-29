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

  // Set up permission change listener
  useEffect(() => {
    if (!navigator.permissions) return;

    let permissionStatus: PermissionStatus | null = null;

    const setupListener = async () => {
      try {
        permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Initial permission state:', permissionStatus.state);
        
        const handleChange = () => {
          if (!permissionStatus) return;
          console.log('Permission changed to:', permissionStatus.state);
          
          // If permission was granted, automatically get location
          if (permissionStatus.state === 'granted' && !locationEnabled) {
            console.log('Permission granted, requesting location...');
            // Use a small delay to ensure the permission is fully granted
            setTimeout(() => {
              requestLocation();
            }, 100);
          }
          
          // If permission was denied, clear saved state
          if (permissionStatus.state === 'denied') {
            console.log('Permission denied, clearing saved state');
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
        title: 'Location not supported',
        description: 'Your browser does not support location services',
        variant: 'destructive',
      });
      return;
    }

    // Check if permission is already granted
    if (navigator.permissions) {
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Location permission status:', permissionStatus.state);
        
        if (permissionStatus.state === 'denied') {
          toast({
            title: '🔒 Location Blocked',
            description: 'Click the lock icon (🔒) in your browser address bar (top left), then allow location access and try again',
            variant: 'destructive',
            duration: 10000,
          });
          
          // Show alert for desktop users
          if (window.confirm('Location access is blocked.\n\nTo enable:\n1. Click the lock icon (🔒) in your browser address bar\n2. Find "Location" and change it to "Allow"\n3. Refresh the page\n\nClick OK to see instructions, or Cancel to browse globally.')) {
            // User wants instructions - they can follow the toast message
          } else {
            // User wants to browse globally instead
            toggleGlobalMode();
          }
          return;
        }
      } catch (e) {
        console.log('Permissions API not supported, continuing with geolocation request');
      }
    }

    try {
      console.log('Requesting location...');
      console.log('Browser will now show permission popup (look at top of browser window)');
      
      // Show a temporary toast to guide users
      toast({
        title: '📍 Permission Request',
        description: 'Look for the permission popup at the top of your browser window and click "Allow"',
        duration: 5000,
      });
      
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      console.log('Location received:', position.coords);
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
      
      let errorMessage = 'Unable to get your location';
      let errorDescription = 'Please try again or browse globally';
      
      if (error?.code === 1) { // PERMISSION_DENIED
        errorMessage = 'Location access denied';
        errorDescription = 'Click the location icon (🔒) in your browser address bar to allow location access';
      } else if (error?.code === 2) { // POSITION_UNAVAILABLE
        errorMessage = 'Location unavailable';
        errorDescription = 'Your location could not be determined. Try again or browse globally';
      } else if (error?.code === 3) { // TIMEOUT
        errorMessage = 'Location request timed out';
        errorDescription = 'Please check your connection and try again';
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
