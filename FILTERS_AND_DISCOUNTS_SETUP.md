# Filters & Discount Codes Setup Guide

Complete guide for the advanced filtering system and sitter discount codes feature in Petflik.

## 🎯 Features Added

### 1. Advanced Filters System
- **Pet Type Filter**: Dogs only, Cats only, or Both (for owners)
- **Distance Filter**: 5km to 200km radius slider
- **Rating Filter**: Minimum rating from 0-5 stars
- **Price Filter**: Maximum hourly rate
- **Sort Options**: Distance, Rating, Price, Newest

### 2. Discount Codes for Sitters
- **Unique Codes**: Auto-generated unique codes per sitter
- **Customizable**: 5-50% discount percentage
- **Usage Tracking**: Track how many times code is used
- **Expiration**: Optional expiration date
- **Max Uses**: Optional usage limit
- **Easy Sharing**: One-click copy to clipboard

## 📋 Database Setup

### Step 1: Run the Migration

Execute the SQL migration in Supabase SQL Editor:

```bash
# Run: database/add_filters_and_discounts.sql
```

This creates:
- `discount_codes` table
- `discount_usage` table
- Filter preference columns in `users` table
- Helper functions for code generation and validation
- RLS policies for security

### Step 2: Verify Tables Created

Check in Supabase Dashboard → Table Editor:
- ✅ `discount_codes` table exists
- ✅ `discount_usage` table exists
- ✅ `users` table has new columns:
  - `pet_preferences`
  - `max_distance_km`
  - `min_rating`
  - `max_hourly_rate`
  - `filter_preferences`

## 🎨 UI Components

### FiltersModal Component
**Location**: `src/components/ui/FiltersModal.tsx`

**Features**:
- Responsive modal design
- Real-time filter preview
- Save preferences to localStorage
- Reset to defaults option
- Active filter count badge

**Usage**:
```tsx
import FiltersModal from '@/components/ui/FiltersModal';

<FiltersModal
  isOpen={showFilters}
  onClose={() => setShowFilters(false)}
  onApply={handleApplyFilters}
  userRole={userRole}
/>
```

### DiscountCodeManager Component
**Location**: `src/components/sitter/DiscountCodeManager.tsx`

**Features**:
- Create unique discount codes
- Visual code display with copy button
- Usage statistics
- Deactivate codes
- Sharing tips

**Usage**:
```tsx
import DiscountCodeManager from '@/components/sitter/DiscountCodeManager';

// In sitter profile or settings page
<DiscountCodeManager />
```

## 🔧 How It Works

### Filters System

#### 1. Filter Storage
```typescript
interface FilterOptions {
  petType: 'all' | 'dog' | 'cat';
  maxDistance: number;
  minRating: number;
  maxPrice: number | null;
  sortBy: 'distance' | 'rating' | 'price' | 'newest';
}
```

Filters are saved to:
- **localStorage**: For persistence across sessions
- **Database**: User preferences (optional)

#### 2. Filter Application
```typescript
// Apply filters to profiles
const applyFilters = (profiles: Profile[]) => {
  let filtered = profiles;
  
  // Pet type filter
  if (filters.petType !== 'all') {
    filtered = filtered.filter(/* pet type logic */);
  }
  
  // Distance filter
  if (!isGlobalMode && filters.maxDistance) {
    filtered = filtered.filter(p => p.distance <= filters.maxDistance);
  }
  
  // Rating filter
  if (filters.minRating > 0) {
    filtered = filtered.filter(p => p.rating >= filters.minRating);
  }
  
  // Price filter
  if (filters.maxPrice) {
    filtered = filtered.filter(p => p.hourlyRate <= filters.maxPrice);
  }
  
  // Sort
  filtered.sort(/* sort logic */);
  
  return filtered;
};
```

#### 3. Active Filter Badge
Shows count of active filters on the filter button:
```tsx
{activeFiltersCount > 0 && (
  <span className="badge">{activeFiltersCount}</span>
)}
```

### Discount Codes System

#### 1. Code Generation
```sql
-- Auto-generates unique codes like: SARAH1234, MIKE5678
SELECT generate_discount_code('Sarah Johnson');
-- Returns: SARAH1234
```

Algorithm:
1. Takes first 6 characters of sitter name
2. Removes special characters
3. Adds 4-digit random number
4. Ensures uniqueness in database

#### 2. Code Creation
```typescript
const createDiscountCode = async () => {
  const { data } = await supabase.rpc('create_sitter_discount', {
    p_sitter_id: currentUser.id,
    p_sitter_name: 'Sarah Johnson',
    p_percentage: 20,
    p_description: 'First-time client special',
    p_max_uses: 100,
    p_valid_until: '2024-12-31',
  });
};
```

#### 3. Code Validation
```typescript
const validateCode = async (code: string) => {
  const { data } = await supabase.rpc('validate_discount_code', {
    p_code: code,
    p_user_id: currentUser.id,
  });
  
  // Returns: { valid, percentage, sitter_id, message }
};
```

Checks:
- ✅ Code exists and is active
- ✅ Not expired
- ✅ Within valid date range
- ✅ Under max uses limit
- ✅ User hasn't used it before

#### 4. Code Application
```typescript
const applyCode = async (code: string, bookingId: string) => {
  const success = await supabase.rpc('apply_discount_code', {
    p_code: code,
    p_user_id: currentUser.id,
    p_booking_id: bookingId,
    p_discount_amount: calculatedDiscount,
  });
};
```

Tracks:
- Who used the code
- When it was used
- Which booking it was applied to
- Discount amount saved

## 📱 User Experience

### For Pet Owners

#### Using Filters
1. Click filter icon (top right)
2. Adjust preferences:
   - Select pet type (dogs/cats/both)
   - Set maximum distance
   - Choose minimum rating
   - Set price limit
   - Pick sort order
3. Click "Apply Filters"
4. Profiles update instantly
5. Active filter count shows on button

#### Using Discount Codes
1. Browse sitter profiles
2. See discount badge if available
3. Copy code from profile
4. Apply at booking checkout
5. See discounted price
6. Complete booking with savings

### For Sitters

#### Creating Discount Code
1. Go to Profile → Discount Code section
2. Set discount percentage (5-50%)
3. Add optional description
4. Set max uses (optional)
5. Set expiration date (optional)
6. Click "Create Discount Code"
7. Unique code generated instantly

#### Managing Code
1. View code with copy button
2. See usage statistics
3. Share code with clients
4. Deactivate when needed
5. Create new code after deactivation

## 🔐 Security & Privacy

### Filter Security
- Filters stored locally (no sensitive data)
- Server-side validation for all queries
- RLS policies prevent unauthorized access
- Distance calculations server-side only

### Discount Code Security
- Unique codes prevent guessing
- One code per sitter at a time
- Usage tracking prevents abuse
- Expiration dates enforced
- Max uses limit enforced
- User can only use code once

### RLS Policies
```sql
-- Sitters can manage own codes
CREATE POLICY "Sitters can view own discount codes"
ON discount_codes FOR SELECT
USING (auth.uid() = sitter_id);

-- Anyone can validate active codes
CREATE POLICY "Anyone can view active discount codes"
ON discount_codes FOR SELECT
USING (is_active = true);

-- Users can view own usage
CREATE POLICY "Users can view own discount usage"
ON discount_usage FOR SELECT
USING (auth.uid() = user_id);
```

## 📊 Database Schema

### discount_codes Table
```sql
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY,
  sitter_id UUID REFERENCES users(id),
  code VARCHAR(20) UNIQUE NOT NULL,
  percentage INTEGER CHECK (percentage > 0 AND percentage <= 100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  max_uses INTEGER,
  valid_from TIMESTAMP DEFAULT NOW(),
  valid_until TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### discount_usage Table
```sql
CREATE TABLE discount_usage (
  id UUID PRIMARY KEY,
  discount_code_id UUID REFERENCES discount_codes(id),
  user_id UUID REFERENCES users(id),
  booking_id UUID,
  used_at TIMESTAMP DEFAULT NOW(),
  discount_amount DECIMAL(10,2),
  UNIQUE(discount_code_id, user_id, booking_id)
);
```

### users Table (Updated)
```sql
ALTER TABLE users ADD COLUMN pet_preferences JSONB DEFAULT '{"dogs": true, "cats": true}';
ALTER TABLE users ADD COLUMN max_distance_km INTEGER DEFAULT 50;
ALTER TABLE users ADD COLUMN min_rating DECIMAL(2,1) DEFAULT 0;
ALTER TABLE users ADD COLUMN max_hourly_rate INTEGER;
ALTER TABLE users ADD COLUMN filter_preferences JSONB DEFAULT '{}';
```

## 🧪 Testing

### Test Filters

1. **Pet Type Filter**:
   - Set to "Dogs only"
   - Verify only dog sitters appear
   - Set to "Cats only"
   - Verify only cat sitters appear

2. **Distance Filter**:
   - Set to 10km
   - Verify only nearby profiles show
   - Toggle to global mode
   - Verify all profiles appear

3. **Rating Filter**:
   - Set minimum to 4 stars
   - Verify only 4+ rated sitters show
   - Reset to 0
   - Verify all sitters appear

4. **Price Filter**:
   - Set max to €15/hr
   - Verify only affordable sitters show
   - Clear filter
   - Verify all prices appear

5. **Sort Options**:
   - Sort by distance → closest first
   - Sort by rating → highest first
   - Sort by price → cheapest first
   - Sort by newest → recent first

### Test Discount Codes

1. **Create Code**:
   - Set 20% discount
   - Add description
   - Set max 50 uses
   - Verify unique code generated

2. **Copy Code**:
   - Click copy button
   - Verify "Copied!" message
   - Paste in notepad
   - Verify code matches

3. **Validate Code**:
   - Enter valid code
   - Verify validation passes
   - Enter invalid code
   - Verify error message

4. **Apply Code**:
   - Use code at checkout
   - Verify discount applied
   - Check usage count increased
   - Try using same code again
   - Verify "already used" error

5. **Deactivate Code**:
   - Click deactivate
   - Verify code no longer works
   - Create new code
   - Verify new code works

## 🚀 Integration Points

### Booking System Integration
```typescript
// At checkout, validate and apply discount
const applyDiscount = async (code: string, totalAmount: number) => {
  const validation = await validateDiscountCode(code, userId);
  
  if (validation.valid) {
    const discountAmount = totalAmount * (validation.percentage / 100);
    const finalAmount = totalAmount - discountAmount;
    
    // Apply to booking
    await applyDiscountCode(code, userId, bookingId, discountAmount);
    
    return { finalAmount, discountAmount };
  }
};
```

### Profile Display Integration
```typescript
// Show discount badge on sitter profiles
{sitter.discount_code && (
  <div className="discount-badge">
    <Percent className="icon" />
    {sitter.discount_percentage}% OFF
    <span className="code">{sitter.discount_code}</span>
  </div>
)}
```

## 📈 Analytics & Insights

### For Sitters
- Total discount code uses
- Revenue impact of discounts
- Most popular discount percentage
- Conversion rate with vs without discount

### For Platform
- Most used discount codes
- Average discount percentage
- Discount impact on bookings
- Popular filter combinations

## ✅ Checklist

Before deploying:

- [ ] Run database migration
- [ ] Verify tables created
- [ ] Test filter functionality
- [ ] Test discount code creation
- [ ] Test code validation
- [ ] Test code application
- [ ] Verify RLS policies
- [ ] Test on mobile devices
- [ ] Check performance with many profiles
- [ ] Verify localStorage persistence

---

**Ready to offer smart filtering and attractive discounts! 🎯💰**
