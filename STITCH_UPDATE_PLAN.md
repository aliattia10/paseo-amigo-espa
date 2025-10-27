# Stitch UI/UX Update Plan

## Overview
Complete redesign based on Stitch design files from `stitch_welcome_to_paseo` folder.

## Design System

### Colors
- Primary: `#4A90E2` (Blue)
- Secondary: `#F5A623` (Orange)  
- Background Light: `#F2F2F7`
- Background Dark: `#1C1C1E`
- Card Light: `#FFFFFF`
- Card Dark: `#2C2C2E`

### Typography
- Font: Plus Jakarta Sans
- Weights: 400, 500, 600, 700, 800

### Icons
- Material Symbols Outlined
- Use FILL=1 for filled variants

## Files to Update

### Configuration
1. `tailwind.config.ts` - Add new color scheme
2. `index.html` - Add Material Symbols font
3. `src/index.css` - Update base styles

### Pages/Components
1. Welcome/Splash Screen
2. Role Selection  
3. Profile Setup (Owner & Sitter)
4. Home Feed with Browse Sitters
5. Messages/Inbox
6. Chat Interface
7. Profile
8. Search & Filters
9. Bottom Navigation
10. Top App Bar

## Implementation Strategy

### Phase 1: Core Infrastructure
- [ ] Update Tailwind config
- [ ] Add Material Symbols font
- [ ] Create base component wrappers

### Phase 2: Auth Flow
- [ ] Welcome screen
- [ ] Role selection
- [ ] Profile setup

### Phase 3: Main App
- [ ] Home/Feed
- [ ] Messages
- [ ] Chat
- [ ] Profile
- [ ] Search

### Phase 4: Polish & Testing
- [ ] Animations
- [ ] Dark mode
- [ ] Responsive adjustments
- [ ] Test with Supabase

Would you like me to proceed with the full implementation?

