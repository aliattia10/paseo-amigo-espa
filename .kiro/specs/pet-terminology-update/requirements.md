# Pet Terminology Update Requirements

## Introduction

This specification defines the requirements for updating all "dog" terminology to "pet" throughout the Petflik application, and adding full cat support to the pet owner profile creation system.

## Glossary

- **Pet**: Generic term for both dogs and cats
- **Pet Type**: Either "dog" or "cat"
- **Pet Owner**: User who owns pets (dogs or cats)
- **Sitter**: User who provides pet care services

## Requirements

### Requirement 1: Update UI Terminology

**User Story:** As a user, I want to see "pet" instead of "dog" in the UI so that the app is inclusive of both dogs and cats.

#### Acceptance Criteria

1. WHEN viewing any page, THE System SHALL use "pet" instead of "dog" in generic contexts
2. WHEN referring to a specific animal, THE System SHALL use the correct type (dog or cat)
3. WHEN showing role selection, THE System SHALL say "Pet Owner" instead of "Dog Owner"
4. WHEN showing profile setup, THE System SHALL say "Pet Profile" instead of "Dog Profile"
5. THE System SHALL maintain specific terminology where appropriate (e.g., "dog walker" for sitters)

### Requirement 2: Add Cat Selection in Pet Creation

**User Story:** As a pet owner, I want to select whether I'm adding a dog or cat so that I can manage both types of pets.

#### Acceptance Criteria

1. WHEN creating a new pet, THE System SHALL show a pet type selector
2. THE System SHALL offer "Dog" and "Cat" as options
3. WHEN "Cat" is selected, THE System SHALL show cat-appropriate fields
4. WHEN "Dog" is selected, THE System SHALL show dog-appropriate fields
5. THE System SHALL save the pet_type in the database

### Requirement 3: Update Database References

**User Story:** As a developer, I want the database to use "pets" terminology so that the schema is consistent.

#### Acceptance Criteria

1. THE System SHALL use "pets" table (already exists)
2. THE System SHALL maintain backward compatibility with "dogs" table
3. THE System SHALL have pet_type column ('dog' or 'cat')
4. THE System SHALL migrate existing dog data to pets table
5. THE System SHALL update all queries to use pets table

### Requirement 4: Update Type Definitions

**User Story:** As a developer, I want TypeScript types to reflect pet terminology so that code is clear and maintainable.

#### Acceptance Criteria

1. THE System SHALL rename Dog interface to Pet interface
2. THE System SHALL add petType field to Pet interface
3. THE System SHALL update all function signatures
4. THE System SHALL update all imports
5. THE System SHALL maintain type safety throughout

### Requirement 5: Update Component Names

**User Story:** As a developer, I want component names to reflect pet terminology so that code is organized logically.

#### Acceptance Criteria

1. THE System SHALL rename DogOwnerProfileSetup to PetOwnerProfileSetup
2. THE System SHALL rename DogProfileForm to PetProfileForm
3. THE System SHALL rename DogEditPage to PetEditPage (already done)
4. THE System SHALL update all component imports
5. THE System SHALL update all route paths

### Requirement 6: Update Service Functions

**User Story:** As a developer, I want service functions to use pet terminology so that API is consistent.

#### Acceptance Criteria

1. THE System SHALL rename getDogsByOwner to getPetsByOwner
2. THE System SHALL rename createDog to createPet
3. THE System SHALL rename updateDog to updatePet
4. THE System SHALL rename deleteDog to deletePet
5. THE System SHALL update all function calls

### Requirement 7: Maintain Sitter Terminology

**User Story:** As a user, I want sitter-related terms to remain clear so that I understand the service being offered.

#### Acceptance Criteria

1. THE System SHALL keep "sitter" as the primary term
2. THE System SHALL use "pet sitter" in generic contexts
3. THE System SHALL allow sitters to specify they work with dogs, cats, or both
4. THE System SHALL show appropriate icons for each pet type
5. THE System SHALL filter sitters by pet type preference

### Requirement 8: Update Documentation

**User Story:** As a developer, I want documentation to reflect pet terminology so that it's accurate and helpful.

#### Acceptance Criteria

1. THE System SHALL update all README files
2. THE System SHALL update all setup guides
3. THE System SHALL update all code comments
4. THE System SHALL update all error messages
5. THE System SHALL update all toast notifications

### Requirement 9: Backward Compatibility

**User Story:** As a system administrator, I want existing data to work seamlessly so that no data is lost during the update.

#### Acceptance Criteria

1. THE System SHALL read from both dogs and pets tables
2. THE System SHALL write to pets table
3. THE System SHALL migrate dogs data to pets table
4. THE System SHALL maintain existing dog records
5. THE System SHALL handle missing pet_type gracefully (default to 'dog')

### Requirement 10: UI Icons and Images

**User Story:** As a user, I want to see appropriate icons for dogs and cats so that the interface is visually clear.

#### Acceptance Criteria

1. WHEN viewing a dog profile, THE System SHALL show dog icon (🐕)
2. WHEN viewing a cat profile, THE System SHALL show cat icon (🐱)
3. WHEN viewing generic pet content, THE System SHALL show paw icon (🐾)
4. THE System SHALL use appropriate Material Symbols icons
5. THE System SHALL update all placeholder images
