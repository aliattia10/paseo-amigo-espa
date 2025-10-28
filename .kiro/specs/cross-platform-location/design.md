# Cross-Platform Location Permission Design

## Overview

This design implements a robust, cross-platform location permission system that works seamlessly across web browsers, Android (via Google Play), and iOS (via Apple App Store). The solution uses a progressive enhancement approach, starting with web standards and optionally adding native capabilities through Capacitor.

## Architecture

### Layered Approach

```
┌─────────────────────────────────────────┐
│         Application Layer               │
│  (React Components, Location Context)   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│      Location Service Abstraction       │
│   (Detects platform, routes requests)   │
└─────────────────────────────────────────┘
                  ↓
┌──────────────┬──────────────┬───────────┐
│   Web API    │   Android    │    iOS    │
│ (Geolocation)│ (Play Svcs)  │(CoreLoc)  │
└──────────────┴──────────────┴───────────┘
```

### Platform Detection Strategy

1. **Check for Capacitor**: If available, use native plugins
2. **Check for PWA**: If installed as PWA, use enhanced web APIs
3. **Fallback to Web**: Use standard Geolocation API
4. **Global Mode**: If all fail, enable global browsing

## Components and Interfaces

### 1. Location Service (`src/services/LocationService.ts`)

```typescript
interface LocationService {
  // Check if location is available on this platform
  isAvailable(): Promise<boolean>;
  
  // Request location permission
  requestPermission(): Promise<PermissionResult>;
  
  // Get current location
  getCurrentLocation(): Promise<Coordinates>;
  
  // Watch location changes
  watchLocation(callback: (coords: Coordinates) => void): WatchId;
  
  // Stop watching location
  clearWatch(id: WatchId): void;
  
  // Check permission status
  checkPermission(): Promise<PermissionStatus>;
  
  // Open system settings (for denied permissions)
  openSettings(): Promise<void>;
}

interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

interface PermissionResult {
  granted: boolean;
  denied: boolean;
  prompt: boolean; // User hasn't decided yet
}

type PermissionStatus = 'granted' | 'denied' | 'prompt' | 'unavailable';
```

### 2. Platform-Specific Implementations

#### Web Implementation (`WebLocationService.ts`)
```typescript
class WebLocationService implements LocationService {
  async requestPermission(): Promise<PermissionResult> {
    // Use navigator.permissions.query if available
    // Fallback to direct geolocation request
  }
  
  async getCurrentLocation(): Promise<Coordinates> {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        }),
        reject,
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }
}
```

#### Capacitor Implementation (`CapacitorLocationService.ts`)
```typescript
import { Geolocation } from '@capacitor/geolocation';
import { App } from '@capacitor/app';

class CapacitorLocationService implements LocationService {
  async requestPermission(): Promise<PermissionResult> {
    const permission = await Geolocation.requestPermissions();
    return {
      granted: permission.location === 'granted',
      denied: permission.location === 'denied',
      prompt: permission.location === 'prompt'
    };
  }
  
  async openSettings(): Promise<void> {
    await App.openSettings();
  }
}
```

### 3. Location Context Enhancement

Update `src/contexts/LocationContext.tsx`:

```typescript
interface LocationContextType {
  // Existing
  location: Coordinates | null;
  locationEnabled: boolean;
  isGlobalMode: boolean;
  
  // New
  permissionStatus: PermissionStatus;
  platform: 'web' | 'android' | 'ios' | 'pwa';
  canOpenSettings: boolean;
  
  // Methods
  requestLocation(): Promise<void>;
  toggleGlobalMode(): void;
  openLocationSettings(): Promise<void>;
  retryLocationRequest(): Promise<void>;
}
```

### 4. Enhanced Permission UI Components

#### Permission Modal (`LocationPermissionModal.tsx`)
```typescript
interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  platform: 'web' | 'android' | 'ios' | 'pwa';
  permissionStatus: PermissionStatus;
}

// Shows platform-specific instructions
// Provides "Open Settings" button for denied permissions
// Explains benefits of location access
```

## Data Models

### User Location Storage

```sql
-- Already exists in users table
users (
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_enabled BOOLEAN,
  location_updated_at TIMESTAMP,
  location_accuracy DECIMAL(10, 2), -- NEW: store accuracy
  location_source VARCHAR(20) -- NEW: 'web', 'android', 'ios'
)
```

### Local Storage Schema

```typescript
interface LocationPreferences {
  permissionGranted: boolean;
  permissionDenied: boolean;
  globalModePreferred: boolean;
  lastLocationUpdate: number;
  platform: string;
}

// Stored at: localStorage.getItem('petflik_location_prefs')
```

## Error Handling

### Error Types and Recovery

```typescript
enum LocationError {
  PERMISSION_DENIED = 'permission_denied',
  POSITION_UNAVAILABLE = 'position_unavailable',
  TIMEOUT = 'timeout',
  NOT_SUPPORTED = 'not_supported',
  NETWORK_ERROR = 'network_error'
}

interface ErrorRecovery {
  [LocationError.PERMISSION_DENIED]: {
    action: 'Show settings button',
    fallback: 'Enable global mode'
  },
  [LocationError.POSITION_UNAVAILABLE]: {
    action: 'Retry with lower accuracy',
    fallback: 'Use last known location'
  },
  [LocationError.TIMEOUT]: {
    action: 'Retry with longer timeout',
    fallback: 'Use cached location'
  },
  [LocationError.NOT_SUPPORTED]: {
    action: 'Show browser upgrade message',
    fallback: 'Force global mode'
  }
}
```

### User-Friendly Error Messages

```typescript
const ERROR_MESSAGES = {
  web: {
    permission_denied: "Location access was blocked. Click the location icon in your browser's address bar to enable it.",
    position_unavailable: "Unable to determine your location. Please check your device's location settings.",
    timeout: "Location request timed out. Please try again.",
    not_supported: "Your browser doesn't support location services. Try updating your browser or use global mode."
  },
  android: {
    permission_denied: "Location permission denied. Tap 'Open Settings' to enable location access for Petflik.",
    position_unavailable: "Unable to get your location. Make sure location services are enabled in your device settings.",
    timeout: "Location request timed out. Please ensure you have a good GPS signal.",
    not_supported: "Location services are not available on this device."
  },
  ios: {
    permission_denied: "Location permission denied. Go to Settings > Petflik > Location to enable access.",
    position_unavailable: "Unable to determine your location. Check Settings > Privacy > Location Services.",
    timeout: "Location request timed out. Please ensure you have a good GPS signal.",
    not_supported: "Location services are not available on this device."
  }
};
```

## Testing Strategy

### Unit Tests
- Test each platform implementation independently
- Mock native APIs (Capacitor, Geolocation)
- Test error handling and recovery
- Test permission state transitions

### Integration Tests
- Test LocationContext with different platforms
- Test UI components with various permission states
- Test database updates when location changes
- Test fallback to global mode

### Manual Testing Checklist

**Web Browser:**
- [ ] Chrome desktop - permission prompt
- [ ] Firefox desktop - permission prompt
- [ ] Safari desktop - permission prompt
- [ ] Chrome mobile - permission prompt
- [ ] Safari iOS - permission prompt

**PWA:**
- [ ] Install PWA on Android
- [ ] Install PWA on iOS
- [ ] Test location permission after install
- [ ] Test offline functionality

**Native (if using Capacitor):**
- [ ] Android - first permission request
- [ ] Android - denied permission recovery
- [ ] Android - settings deep link
- [ ] iOS - first permission request
- [ ] iOS - denied permission recovery
- [ ] iOS - settings deep link

## Progressive Web App (PWA) Configuration

### manifest.json Updates

```json
{
  "name": "Petflik - Trusted Sitters for happy pets",
  "short_name": "Petflik",
  "description": "Find trusted pet sitters near you",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0D9488",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "permissions": [
    "geolocation"
  ],
  "categories": ["lifestyle", "social"],
  "screenshots": [
    {
      "src": "/screenshots/home.png",
      "sizes": "540x720",
      "type": "image/png"
    }
  ]
}
```

### Service Worker for PWA

```typescript
// public/sw.js
const CACHE_NAME = 'petflik-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
  );
});
```

## Capacitor Configuration (Optional)

### Installation

```bash
npm install @capacitor/core @capacitor/cli
npm install @capacitor/geolocation
npm install @capacitor/app
npx cap init
```

### capacitor.config.ts

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.petflik.app',
  appName: 'Petflik',
  webDir: 'dist',
  bundledWebRuntime: false,
  plugins: {
    Geolocation: {
      permissions: ['location']
    }
  }
};

export default config;
```

### Android Configuration

**android/app/src/main/AndroidManifest.xml:**
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
```

### iOS Configuration

**ios/App/App/Info.plist:**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Petflik needs your location to show you nearby pet sitters and pet owners in your area.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Petflik uses your location to help you find the best matches nearby, even when the app is in the background.</string>
```

## Performance Considerations

### Location Caching Strategy

```typescript
interface LocationCache {
  coordinates: Coordinates;
  timestamp: number;
  maxAge: number; // milliseconds
}

class LocationCacheManager {
  private cache: LocationCache | null = null;
  private readonly DEFAULT_MAX_AGE = 60 * 60 * 1000; // 1 hour
  
  isValid(): boolean {
    if (!this.cache) return false;
    return Date.now() - this.cache.timestamp < this.cache.maxAge;
  }
  
  get(): Coordinates | null {
    return this.isValid() ? this.cache.coordinates : null;
  }
  
  set(coordinates: Coordinates, maxAge = this.DEFAULT_MAX_AGE): void {
    this.cache = {
      coordinates,
      timestamp: Date.now(),
      maxAge
    };
  }
}
```

### Battery Optimization

- Use cached location when available
- Only request high accuracy when needed
- Implement geofencing for location updates
- Stop watching location when app is backgrounded

## Security Considerations

### Location Data Privacy

1. **Encryption**: Location data transmitted over HTTPS only
2. **Storage**: Encrypted at rest in database
3. **Access Control**: RLS policies restrict access
4. **Anonymization**: Round distances for display
5. **Deletion**: Remove location when user disables

### Permission Best Practices

1. **Just-in-Time**: Request permission when needed
2. **Explanation**: Always explain why before requesting
3. **Graceful Denial**: Provide alternatives if denied
4. **Revocation**: Allow users to revoke anytime
5. **Transparency**: Show when location is being accessed

## Migration Path

### Phase 1: Enhanced Web (Current)
- Improve browser permission handling
- Add better error messages
- Implement location caching

### Phase 2: PWA Support
- Add manifest.json
- Implement service worker
- Add install prompts
- Test on mobile devices

### Phase 3: Native Apps (Optional)
- Integrate Capacitor
- Build Android APK
- Build iOS IPA
- Submit to app stores

## Success Metrics

- **Permission Grant Rate**: % of users who grant location
- **Location Accuracy**: Average accuracy in meters
- **Error Rate**: % of location requests that fail
- **Global Mode Usage**: % of users in global vs local mode
- **Platform Distribution**: Usage across web/Android/iOS
