# Comprehensive Test Data Guide

This guide explains the comprehensive test data created for thorough testing of the Paseo Amigo España application.

## Overview

The comprehensive test data includes realistic Spanish profiles with authentic names, diverse dog breeds, and varied user characteristics to test all app functionality.

## Test Data Summary

### 👥 Users (12 total)
- **6 Dog Owners** with diverse backgrounds
- **6 Dog Walkers** with different experience levels and specializations

### 🐕 Dogs (11 total)
- **Popular Spanish dog names**: Luna, Max, Bruno, Maya, Thor, Nala, Rex, Coco, Zeus, Bella, Rocky
- **Authentic breeds**: Golden Retriever, Labrador, Pastor Alemán, Beagle, Husky Siberiano, Border Collie, Rottweiler, French Bulldog, Mastín Español, Cocker Spaniel, Bulldog Inglés
- **Varied characteristics**: Different ages, temperaments, and care requirements

### 🚶 Walker Profiles (6 total)
- **Alejandro Morales**: Professional with 8+ years experience, certified, specializes in large breeds
- **Carmen Delgado**: Specialized in nervous/anxious dogs, very patient and caring
- **Roberto Silva**: Young veterinary student, energetic, budget-friendly
- **Isabel Castro**: Professional and reliable, flexible schedule, high ratings
- **Fernando Navarro**: Weekend specialist, experienced with active/sporting breeds
- **Patricia Jiménez**: Family-oriented, great with children and family dogs

### 🏃 Walk Requests
- Various statuses: pending, accepted, completed
- Different durations: 30, 45, 60 minutes
- Multiple locations across Madrid, Barcelona, Valencia, and Sevilla

### ⭐ Reviews & Ratings
- Realistic 5-star reviews with authentic Spanish comments
- Tags highlighting walker strengths: punctual, caring, experienced, reliable

### 💬 Chat Messages
- Realistic conversations between owners and walkers
- Spanish language with authentic expressions
- Various topics: scheduling, dog instructions, confirmations

### 🔔 Notifications
- Different types: walk requests, confirmations, completions, reviews
- Realistic timing and content

## How to Use the Test Data

### Option 1: SQL Script (Recommended)
1. Open your Supabase dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `database/seed_comprehensive.sql`
4. Execute the script

### Option 2: TypeScript Script
1. Navigate to the backend directory: `cd backend`
2. Run the comprehensive seed script: `npm run seed:comprehensive`
3. Or run directly: `npx ts-node src/database/seed-comprehensive.ts`

### Option 3: Manual Script
1. Run the helper script: `node scripts/seed-comprehensive.js`

## Testing Scenarios

### 🎯 Dog Owner Experience
- **María González**: Test with Luna (Golden Retriever) and Max (Labrador)
- **Carlos Ruiz**: Test with Bruno (Pastor Alemán) and Maya (Beagle)
- **Ana Fernández**: Test with Thor (Husky) and Nala (Border Collie)

### 🎯 Dog Walker Experience
- **Alejandro Morales**: Test premium walker features and large breed expertise
- **Carmen Delgado**: Test specialized care for nervous dogs
- **Roberto Silva**: Test young walker features and budget pricing

### 🎯 Matching System
- Test owner-walker matching based on:
  - Dog breed requirements
  - Walker specialization
  - Availability schedules
  - Pricing preferences
  - Location proximity

### 🎯 Communication Features
- Test chat functionality with realistic conversations
- Test notification system with various message types
- Test review and rating system

### 🎯 Subscription Features
- Test different subscription tiers
- Test premium walker access
- Test feature limitations

## Data Characteristics

### 🏙️ Geographic Distribution
- **Madrid**: 4 users (2 owners, 2 walkers)
- **Barcelona**: 4 users (2 owners, 2 walkers)
- **Valencia**: 2 users (1 owner, 1 walker)
- **Sevilla**: 2 users (1 owner, 1 walker)

### 💰 Pricing Range
- **Budget**: €12-13/hour (Roberto, Patricia)
- **Standard**: €14-16/hour (Fernando, Isabel)
- **Premium**: €18/hour (Alejandro, Carmen)

### 🕒 Availability Patterns
- **Weekdays only**: Patricia (family schedule)
- **Weekends only**: Fernando (weekend specialist)
- **Flexible**: Roberto (student schedule)
- **Professional**: Alejandro, Carmen, Isabel (business hours)

### 🐕 Dog Size Distribution
- **Small**: Coco (French Bulldog), Rocky (Bulldog Inglés)
- **Medium**: Luna (Golden Retriever), Max (Labrador), Maya (Beagle), Nala (Border Collie), Bella (Cocker Spaniel)
- **Large**: Bruno (Pastor Alemán), Thor (Husky), Rex (Rottweiler), Zeus (Mastín Español)

## Realistic Spanish Elements

### 👤 Names
- **Authentic Spanish names**: María González Pérez, Carlos Ruiz Martínez, etc.
- **Regional diversity**: Names from different Spanish regions
- **Professional email addresses**: Gmail, Hotmail, Outlook, Yahoo

### 📱 Phone Numbers
- **Spanish format**: +34 prefix with realistic mobile numbers
- **Regional codes**: Different codes for Madrid, Barcelona, etc.

### 🏠 Postal Codes
- **Real Spanish postal codes**: 28001 (Madrid Centro), 08001 (Barcelona Centro), etc.
- **Geographic accuracy**: Codes match the cities

### 🗣️ Language
- **Authentic Spanish expressions**: Natural conversation patterns
- **Regional variations**: Different Spanish expressions and vocabulary
- **Professional tone**: Appropriate for service interactions

## Benefits for Testing

1. **Realistic User Journeys**: Test complete workflows with believable data
2. **Diverse Scenarios**: Cover different user types, dog breeds, and situations
3. **Spanish Localization**: Verify proper Spanish language support
4. **Edge Cases**: Test various dog temperaments and walker specializations
5. **Performance**: Test with realistic data volumes
6. **User Experience**: Validate UI with authentic content

## Maintenance

- Update test data periodically to reflect new features
- Add new user types and scenarios as the app evolves
- Maintain realistic Spanish language and cultural elements
- Keep data consistent across all tables and relationships

---

*This comprehensive test data ensures thorough testing of all Paseo Amigo España functionality with realistic, culturally appropriate Spanish content.*
