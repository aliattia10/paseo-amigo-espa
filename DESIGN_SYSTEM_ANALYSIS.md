# Paseo UI/UX Design System Analysis

## Overview
Based on the Stitch design files, here are the key design patterns and specifications.

## Color Scheme

### Primary Colors
- **Primary**: `#4A90E2` (Blue) - Main CTA buttons, active states
- **Secondary**: `#F5A623` (Orange/Yellow) - Secondary actions, accents
- **Success/Green**: `#20df6c` (Green) - Used in some variations

### Background Colors
- **Background Light**: `#F2F2F7` or `#f6f8f7`
- **Background Dark**: `#1C1C1E` or `#112117`

### Text Colors
- **Text Primary Light**: `#1C1C1E` or `#0e1b13`
- **Text Primary Dark**: `#F2F2F7` or `#E0E0E0`
- **Text Secondary Light**: `#8E8E93`
- **Text Secondary Dark**: `#8E8E93`

### Card Colors
- **Card Light**: `#FFFFFF`
- **Card Dark**: `#2C2C2E`

### Border Colors
- **Border Light**: `#E5E5EA`
- **Border Dark**: `#3A3A3C`

## Typography
- **Font Family**: Plus Jakarta Sans
- **Weights**: 400, 500, 600, 700, 800

## Border Radius
- Default: `0.5rem` (8px)
- lg: `1rem` (16px)
- xl: `1.5rem` (24px)
- full: `9999px`

## Component Patterns

### Buttons
- Primary: `bg-primary text-white rounded-xl`
- Secondary: `bg-card-light border border-border-light`
- Icon buttons: `rounded-full`
- Heights: 14 (56px) for CTA, 10-12 for regular

### Cards
- `rounded-xl bg-card-light shadow-sm`
- Padding: `p-4`

### Input Fields
- Height: `h-14` (56px)
- Border: `border border-border-light`
- Focus: `focus:ring-2 focus:ring-primary/50`
- Padding: `p-[15px]` or `px-4 py-[15px]`

### Icons
- Material Symbols Outlined
- FILL for filled variants (filled icons)
- Size: 24px default, 2xl (24px) for nav icons

### Top App Bar
- Sticky: `sticky top-0 z-10`
- Backdrop: `bg-background-light/80 backdrop-blur-sm`
- Padding: `p-4 pb-2`
- Border: `border-b border-border-light`

### Bottom Navigation
- Fixed: `fixed bottom-0 left-0 right-0`
- Height: `h-16` or `h-20`
- Backdrop: `bg-card-light/90 backdrop-blur-sm`
- Border: `border-t`

### List Items
- Padding: `p-3` or `p-4`
- Rounded: `rounded-xl`
- Hover: `hover:bg-slate-100 dark:hover:bg-white/5`

## Key Screens

1. **Welcome/Splash** - Animated fade-in logo
2. **Role Selection** - Two button cards (Owner/Sitter)
3. **Profile Setup** - Multi-step form with progress bar
4. **Home/Feed** - Card stack (Tinder-style)
5. **Chat** - Messenger-style bubbles
6. **Messages List** - Conversation list with avatars
7. **Profile** - Segmented control, cards
8. **Search** - Accordion filters

## Next Steps
1. Update Tailwind config with new colors
2. Add Material Symbols font
3. Create base components
4. Update each page systematically

