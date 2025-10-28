# Cross-Platform Location Implementation Tasks

## 1. Enhance Web Location Service

- [ ] 1.1 Create LocationService interface and base implementation
  - Define TypeScript interfaces for LocationService, Coordinates, PermissionResult
  - Create abstract base class with common functionality
  - Add location caching mechanism
  - _Requirements: 1.1, 1.2, 6.1, 8.3_

- [ ] 1.2 Implement WebLocationService with improved error handling
  - Use navigator.permissions.query() API when available
  - Implement retry logic with exponential backoff
  - Add timeout handling with user-friendly messages
  - Handle all geolocation error codes
  - _Requirements: 1.3, 1.4, 7.5, 8.5_

- [ ] 1.3 Add platform detection utility
  - Detect if running as PWA
  - Detect if Capacitor is available
  - Detect mobile vs desktop
  - Detect specific browsers (Chrome, Safari, Firefox)
  - _Requirements: 7.1, 10.1_

## 2. Update Location Context

- [ ] 2.1 Enhance LocationContext with new features
  - Add permissionStatus state
  - Add platform detection
  - Add canOpenSettings flag
  - Integrate LocationService abstraction
  - _Requirements: 6.1, 6.2, 6.3_

- [ ] 2.2 Implement permission state persistence
  - Save permission state to localStorage
  - Load previous state on app start
  - Handle permission revocation
  - Clear state when user logs out
  - _Requirements: 6.1, 6.2, 6.4_

- [ ] 2.3 Add location update throttling
  - Implement 1-hour cache for location
  - Only update if user moves >1km
  - Add manual refresh option
  - Show last update timestamp
  - _Requirements: 8.2, 8.3, 8.4_

## 3. Improve Permission UI

- [ ] 3.1 Create enhanced LocationPermissionModal component
  - Show platform-specific instructions
  - Display permission benefits clearly
  - Add "Learn More" expandable section
  - Show privacy and security information
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 3.2 Add permission denied recovery UI
  - Show "Open Settings" button for denied permissions
  - Provide step-by-step instructions for each platform
  - Add visual guides (screenshots/animations)
  - Offer global mode as alternative
  - _Requirements: 2.2, 2.3, 3.2, 3.3, 7.1_

- [ ] 3.3 Improve location prompt in NewHomePage
  - Make prompt more visually appealing
  - Add illustrations or icons
  - Show example of nearby matches
  - Add skip/remind later options
  - _Requirements: 1.1, 10.1, 10.5_

## 4. Add PWA Support

- [ ] 4.1 Create comprehensive manifest.json
  - Add all required PWA fields
  - Include app icons in multiple sizes
  - Set proper display mode and orientation
  - Add screenshots for app stores
  - _Requirements: 4.1, 4.3, 4.5_

- [ ] 4.2 Generate PWA icons
  - Create 512x512 master icon
  - Generate all required sizes (72, 96, 128, 144, 152, 192, 384, 512)
  - Create maskable icons for Android
  - Add favicon and apple-touch-icon
  - _Requirements: 4.5_

- [ ] 4.3 Implement service worker
  - Cache essential assets for offline use
  - Implement cache-first strategy for static assets
  - Add network-first strategy for API calls
  - Handle service worker updates
  - _Requirements: 4.4_

- [ ] 4.4 Add PWA install prompt
  - Detect if app is installable
  - Show custom install banner
  - Handle beforeinstallprompt event
  - Track install analytics
  - _Requirements: 4.1, 4.2_

## 5. Implement Error Handling

- [ ] 5.1 Create LocationError enum and error types
  - Define all possible error types
  - Create error recovery strategies
  - Map native errors to custom errors
  - Add error logging
  - _Requirements: 7.5, 8.5_

- [ ] 5.2 Add platform-specific error messages
  - Create message templates for each platform
  - Include actionable instructions
  - Add links to help documentation
  - Support multiple languages
  - _Requirements: 7.5, 10.1_

- [ ] 5.3 Implement error recovery flows
  - Auto-retry with backoff for transient errors
  - Fallback to cached location when appropriate
  - Switch to global mode for permanent failures
  - Show user-friendly error toasts
  - _Requirements: 7.1, 7.2, 7.3, 7.4_

## 6. Add Capacitor Support (Optional)

- [ ] 6.1 Install and configure Capacitor
  - Install Capacitor core and CLI
  - Install Geolocation and App plugins
  - Initialize Capacitor project
  - Configure app ID and name
  - _Requirements: 5.1, 5.2_

- [ ] 6.2 Create CapacitorLocationService implementation
  - Implement LocationService interface
  - Use @capacitor/geolocation plugin
  - Handle native permission requests
  - Implement openSettings() method
  - _Requirements: 5.1, 5.3, 5.4, 5.5_

- [ ] 6.3 Configure Android platform
  - Add location permissions to AndroidManifest.xml
  - Configure Google Play Services
  - Set up signing keys
  - Test on Android device/emulator
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 6.4 Configure iOS platform
  - Add usage descriptions to Info.plist
  - Configure location permissions
  - Set up provisioning profiles
  - Test on iOS device/simulator
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

## 7. Enhance Privacy and Security

- [ ] 7.1 Implement location data encryption
  - Encrypt location in transit (HTTPS)
  - Add database-level encryption
  - Implement secure storage for cached location
  - Add audit logging for location access
  - _Requirements: 9.1, 9.2_

- [ ] 7.2 Add location accuracy field to database
  - Add location_accuracy column
  - Add location_source column
  - Update RLS policies
  - Migrate existing data
  - _Requirements: 8.1, 9.1_

- [ ] 7.3 Implement distance rounding for privacy
  - Round displayed distances to 0.1 mile/km
  - Never show exact coordinates to unmatched users
  - Add fuzzy location for profile cards
  - Document privacy measures
  - _Requirements: 9.3, 9.4_

- [ ] 7.4 Add location disable functionality
  - Add "Disable Location" button in settings
  - Clear location from database when disabled
  - Show confirmation dialog
  - Update UI to reflect disabled state
  - _Requirements: 9.4, 9.5_

## 8. Testing and Quality Assurance

- [ ]* 8.1 Write unit tests for LocationService
  - Test WebLocationService with mocked APIs
  - Test CapacitorLocationService with mocked plugins
  - Test error handling and recovery
  - Test caching mechanism
  - _Requirements: All_

- [ ]* 8.2 Write integration tests for LocationContext
  - Test permission request flows
  - Test location updates
  - Test global mode toggle
  - Test persistence
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ]* 8.3 Perform cross-browser testing
  - Test on Chrome desktop and mobile
  - Test on Firefox desktop and mobile
  - Test on Safari desktop and iOS
  - Test on Edge
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [ ]* 8.4 Test PWA installation and functionality
  - Test install on Android Chrome
  - Test install on iOS Safari
  - Test offline functionality
  - Test location permission after install
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

## 9. Documentation and User Education

- [ ] 9.1 Create user help documentation
  - Write "Why we need location" guide
  - Create platform-specific setup guides
  - Add troubleshooting section
  - Include privacy policy updates
  - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 9.2 Add in-app help tooltips
  - Add tooltip to location toggle button
  - Add help icon with explanations
  - Show tips on first use
  - Add contextual help for errors
  - _Requirements: 10.1, 10.4_

- [ ] 9.3 Create developer documentation
  - Document LocationService API
  - Add platform setup guides
  - Document error codes and recovery
  - Add deployment instructions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

## 10. Deployment and Monitoring

- [ ] 10.1 Set up analytics for location features
  - Track permission grant/deny rates
  - Track location accuracy metrics
  - Track error rates by platform
  - Track global vs local mode usage
  - _Requirements: All_

- [ ] 10.2 Configure error monitoring
  - Set up Sentry or similar for error tracking
  - Add custom error tags for location issues
  - Set up alerts for high error rates
  - Create error dashboard
  - _Requirements: 7.5, 8.5_

- [ ] 10.3 Deploy PWA updates
  - Update manifest.json on server
  - Deploy service worker
  - Test PWA update flow
  - Monitor install rates
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ]* 10.4 Submit to app stores (if using Capacitor)
  - Build Android APK/AAB
  - Submit to Google Play Store
  - Build iOS IPA
  - Submit to Apple App Store
  - _Requirements: 2.1, 3.1, 5.4, 5.5_
