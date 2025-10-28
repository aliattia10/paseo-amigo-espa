# Cat Integration Implementation Tasks

## Phase 1: Database & Backend (Week 1)

- [ ] 1.1 Run existing `database/add_cat_support.sql`
- [ ] 1.2 Create storage buckets for pet and sitter images
- [ ] 1.3 Update RLS policies for new fields
- [ ] 1.4 Create migration script for existing dog data
- [ ] 1.5 Add indexes for pet_type queries

## Phase 2: Core Components (Week 1-2)

- [ ] 2.1 Create PetTypeSelector component
- [ ] 2.2 Create BreedSelector component (dog/cat breeds)
- [ ] 2.3 Create MultiImageUpload component
- [ ] 2.4 Create PetCareFields component (conditional fields)
- [ ] 2.5 Create PetPreferencesSelector for sitters

## Phase 3: Pet Profile Pages (Week 2)

- [ ] 3.1 Update DogOwnerProfileSetup → PetOwnerProfileSetup
- [ ] 3.2 Add pet type selection
- [ ] 3.3 Add conditional breed selection
- [ ] 3.4 Add multi-image upload (3-10 photos)
- [ ] 3.5 Add pet-specific care fields
- [ ] 3.6 Update PetEditPage with new fields

## Phase 4: Sitter Profile Pages (Week 2)

- [ ] 4.1 Update SitterProfileSetup
- [ ] 4.2 Add pet preferences selector
- [ ] 4.3 Add separate experience fields for dogs/cats
- [ ] 4.4 Add separate rate fields for dogs/cats
- [ ] 4.5 Add multi-image upload (5-15 photos)

## Phase 5: Search & Filtering (Week 3)

- [ ] 5.1 Update FiltersModal with pet type filter
- [ ] 5.2 Add pet type icons to profile cards
- [ ] 5.3 Update search logic to filter by pet compatibility
- [ ] 5.4 Add pet type badges to sitter profiles
- [ ] 5.5 Update NewHomePage with pet type indicators

## Phase 6: Booking Flow (Week 3)

- [ ] 6.1 Update BookingRequestPage
- [ ] 6.2 Add pet selection with checkboxes
- [ ] 6.3 Calculate pricing based on pet type
- [ ] 6.4 Show pet-specific care instructions
- [ ] 6.5 Update BookingsPage to show pet types

## Phase 7: Terminology Updates (Week 3-4)

- [ ] 7.1 Update WelcomeScreen tagline
- [ ] 7.2 Update index.html meta tags
- [ ] 7.3 Update RoleSelectionPage text
- [ ] 7.4 Update all "dog" → "pet" in general contexts
- [ ] 7.5 Update notification messages
- [ ] 7.6 Update email templates

## Phase 8: UI/UX Polish (Week 4)

- [ ] 8.1 Add pet type icons (🐕 🐱) throughout app
- [ ] 8.2 Update imagery to include cats
- [ ] 8.3 Add tooltips for pet-specific features
- [ ] 8.4 Ensure consistent styling for pet types
- [ ] 8.5 Add loading states for image uploads

## Phase 9: Testing (Week 4)

- [ ] 9.1 Test creating dog profiles
- [ ] 9.2 Test creating cat profiles
- [ ] 9.3 Test mixed pet households
- [ ] 9.4 Test sitter with dogs only
- [ ] 9.5 Test sitter with cats only
- [ ] 9.6 Test sitter with both
- [ ] 9.7 Test search/filter by pet type
- [ ] 9.8 Test booking flow for each type
- [ ] 9.9 Test image upload/reorder
- [ ] 9.10 Test migration of existing data

## Phase 10: Documentation & Deployment (Week 4)

- [ ] 10.1 Update README with cat support
- [ ] 10.2 Create user guide for cat owners
- [ ] 10.3 Create sitter guide for cat care
- [ ] 10.4 Update API documentation
- [ ] 10.5 Deploy to staging
- [ ] 10.6 User acceptance testing
- [ ] 10.7 Deploy to production
- [ ] 10.8 Monitor analytics

## Quick Wins (Can be done immediately)

- [ ] Update homepage tagline to "Trusted Sitters for happy pets"
- [ ] Change "Find Sitters" button text to be pet-inclusive
- [ ] Add 🐱 emoji alongside 🐕 in navigation
- [ ] Update meta description in index.html
- [ ] Run database/add_cat_support.sql

## Priority Order

1. **High Priority** (Must have for launch):
   - Database migration
   - Pet type selection
   - Breed selection
   - Sitter pet preferences
   - Search filtering
   - Terminology updates

2. **Medium Priority** (Important but can follow):
   - Multi-image upload
   - Pet-specific care fields
   - Separate rates for dogs/cats
   - Booking flow updates

3. **Low Priority** (Nice to have):
   - Image reordering
   - Advanced analytics
   - Pet type-specific tips
   - Onboarding tutorials
