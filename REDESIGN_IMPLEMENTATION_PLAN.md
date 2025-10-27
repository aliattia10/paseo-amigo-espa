# Paseo App Redesign Implementation Plan

## Overview
Complete redesign to match the Stitch design files in `stitch_welcome_to_paseo` folder.

## Key Changes

### 1. Design System
- **New Color Scheme**: Green primary (#20df6c), updated backgrounds
- **Typography**: Plus Jakarta Sans font family
- **Border Radius**: Consistent rounded corners (0.5rem, 1rem, 1.5rem)
- **Material Symbols**: Using Google Material Symbols Outlined

### 2. New Components Needed

#### A. Welcome/Splash Screen
- Animated fade-in logo
- "Trusted sitters, happy pups" tagline
- Loading dots animation
- File: `src/components/welcome/WelcomeScreen.tsx` ✅ EXISTS

#### B. Role Selection Page
- Hero image at top
- Two large buttons: "Dog Owner" and "Sitter"
- Each with icon, title, and description
- "Already have an account? Sign In" link
- File: `src/components/auth/RoleSelection.tsx` ✅ EXISTS

#### C. Home Feed (Tinder-Style)
- Card stack with 3 layers (visual depth)
- Large profile cards with:
  - Background image
  - Name and age
  - Distance away
  - Star rating
- Three action buttons:
  - Red X (pass)
  - Green heart (like) - larger
  - Blue info (details)
- Bottom navigation bar
- File: `src/components/dashboard/NewHomePage.tsx` ✅ CREATED

#### D. Profile Page
- Profile header with avatar and edit button
- Name, location, rating
- Segmented control (Sitter/Owner toggle)
- Availability calendar
- Account management list
- Booking history cards
- Reviews section
- Bottom navigation
- File: `src/components/profile/NewProfilePage.tsx` ❌ NEEDS CREATION

#### E. Chat Interface
- Message list with avatars
- Input field with send button
- Typing indicators
- File: `src/components/messaging/NewChatWindow.tsx` ❌ NEEDS CREATION

#### F. Search & Filters
- Search bar
- Filter chips (distance, rating, availability)
- Results list
- File: `src/components/search/SearchPage.tsx` ❌ NEEDS CREATION

### 3. Updated Routing Structure

```typescript
/                          → WelcomeScreen (splash)
/select-role               → RoleSelection
/auth                      → AuthNew (login/signup)
/forgot-password           → ForgotPassword
/reset-password            → ResetPassword
/dashboard                 → NewHomePage (card stack)
/profile                   → NewProfilePage
/messages                  → MessagingPage
/search                    → SearchPage
```

### 4. Implementation Steps

#### Phase 1: Core UI Components (Priority)
1. ✅ Update tailwind.config.ts with new colors
2. ✅ Create NewHomePage with card stack
3. ⏳ Create NewProfilePage
4. ⏳ Update WelcomeScreen animations
5. ⏳ Update RoleSelection styling

#### Phase 2: Navigation & Routing
1. ⏳ Create unified bottom navigation component
2. ⏳ Update App.tsx routing
3. ⏳ Add route transitions

#### Phase 3: Features
1. ⏳ Implement card swipe gestures
2. ⏳ Add match notifications
3. ⏳ Implement real-time messaging
4. ⏳ Add booking flow

#### Phase 4: Polish
1. ⏳ Add loading states
2. ⏳ Add error handling
3. ⏳ Add animations
4. ⏳ Test responsive design

### 5. Files to Modify

#### High Priority
- `src/App.tsx` - Update routing
- `src/components/dashboard/OwnerDashboard.tsx` - Replace with NewHomePage
- `src/components/dashboard/WalkerDashboard.tsx` - Replace with NewHomePage
- `src/components/welcome/WelcomeScreen.tsx` - Update styling
- `src/components/auth/RoleSelection.tsx` - Update styling

#### Medium Priority
- `src/components/profile/ProfileSettings.tsx` - Redesign
- `src/components/messaging/MessagingPage.tsx` - Redesign
- `src/components/ui/MainNavigation.tsx` - Update to bottom nav style

#### Low Priority
- All other component styling updates

### 6. Design Tokens

```typescript
// Welcome Page
welcome-primary: #FFC107
welcome-background-light: #FAF8F1
welcome-accent-light: #00796B

// Role Selection
role-primary: #50E3C2
role-button-secondary: #F5A623

// Home Feed
home-primary: #20df6c
home-background-light: #f6f8f7

// Profile & Main App
primary: #4A90E2
secondary: #F5A623
background-light: #F2F2F7
card-light: #FFFFFF
```

### 7. Next Steps

1. Review and approve this plan
2. Create remaining components
3. Update routing
4. Test on mobile devices
5. Deploy to staging
6. User testing
7. Deploy to production

## Notes
- All designs are mobile-first
- Dark mode support included
- Material Symbols Outlined icons
- Plus Jakarta Sans font
- Smooth animations and transitions
