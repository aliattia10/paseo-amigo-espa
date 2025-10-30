# 🎯 Complete Flow: Match → Message → Book → Pay

## Overview
This guide shows the complete user journey from swiping to payment.

---

## 🔄 User Flow

### 1. Discovery & Matching
```
Pet Owner swipes on app
  ↓
Sees sitter profiles (Tinder-style)
  ↓
Swipes right on a sitter → Like saved to Supabase
  ↓
Sitter also swipes right on owner → Match created!
  ↓
Both users see "It's a Match!" modal
  ↓
Click "Send Message" → Navigate to chat
```

### 2. Messaging
```
Users open match from Messages tab
  ↓
Chat interface loads (ChatWindow component)
  ↓
Send messages back and forth
  ↓
Messages saved to Supabase in real-time
  ↓
Owner decides to book → Clicks "Book Now" button
```

### 3. Booking
```
Owner clicks "Book Now" in chat
  ↓
Navigate to BookingRequestPage with sitter_id
  ↓
Owner fills out:
  - Select pet
  - Choose dates/times
  - Add special instructions
  - See price calculation
  ↓
Click "Request Booking"
  ↓
Booking created in Supabase (status: 'requested')
  ↓
Sitter receives notification
```

### 4. Booking Confirmation
```
Sitter opens Bookings tab
  ↓
Sees pending booking request
  ↓
Reviews details
  ↓
Clicks "Accept" or "Decline"
  ↓
If accepted → Booking status: 'confirmed'
  ↓
Owner receives notification
  ↓
Payment flow begins
```

### 5. Payment
```
Owner sees confirmed booking
  ↓
Clicks "Pay Now"
  ↓
Stripe payment form loads
  ↓
Owner enters payment details
  ↓
Payment processed
  ↓
Booking status: 'paid'
  ↓
Both users receive confirmation
```

---

## 📊 Database Tables Involved

### matches table
```sql
CREATE TABLE matches (
  id UUID PRIMARY KEY,
  user1_id UUID REFERENCES auth.users(id),
  user2_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP,
  last_message_at TIMESTAMP,
  unread_count_user1 INTEGER,
  unread_count_user2 INTEGER
);
```

### messages table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  match_id UUID REFERENCES matches(id),
  sender_id UUID REFERENCES auth.users(id),
  content TEXT,
  read BOOLEAN,
  created_at TIMESTAMP
);
```

### bookings table (already exists)
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  owner_id UUID REFERENCES auth.users(id),
  sitter_id UUID REFERENCES auth.users(id),
  pet_id UUID REFERENCES pets(id),
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  status TEXT, -- 'requested', 'confirmed', 'paid', 'completed', 'cancelled'
  total_price DECIMAL,
  special_instructions TEXT,
  created_at TIMESTAMP
);
```

### payments table (needs to be created)
```sql
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount DECIMAL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  status TEXT, -- 'pending', 'succeeded', 'failed', 'refunded'
  created_at TIMESTAMP
);
```

---

## 🔧 Implementation Steps

### Step 1: Run Database Migration
```bash
# Already done: CREATE_SWIPE_SYSTEM.sql
# Creates: likes, passes, matches, messages tables
```

### Step 2: Add Payment Table
Create `database/ADD_PAYMENTS_TABLE.sql`:

```sql
-- Payments table for Stripe integration
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  stripe_payment_intent_id TEXT,
  stripe_charge_id TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  payment_method TEXT, -- 'card', 'bank_transfer', etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payments_booking_id ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_intent ON payments(stripe_payment_intent_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments"
  ON payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to create payment and update booking
CREATE OR REPLACE FUNCTION create_payment_and_update_booking(
  p_booking_id UUID,
  p_user_id UUID,
  p_amount DECIMAL,
  p_stripe_payment_intent_id TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  payment_id UUID;
BEGIN
  -- Create payment record
  INSERT INTO payments (booking_id, user_id, amount, stripe_payment_intent_id, status)
  VALUES (p_booking_id, p_user_id, p_amount, p_stripe_payment_intent_id, 'processing')
  RETURNING id INTO payment_id;
  
  -- Update booking status
  UPDATE bookings
  SET status = 'paid'
  WHERE id = p_booking_id;
  
  RETURN payment_id;
END;
$$;

GRANT EXECUTE ON FUNCTION create_payment_and_update_booking(UUID, UUID, DECIMAL, TEXT) TO authenticated;
```

### Step 3: Update ChatWindow Component
Add "Book Now" button to chat interface:

```typescript
// In src/components/messaging/ChatWindow.tsx

const handleBookNow = () => {
  // Get the other user's ID from the match
  const otherUserId = match.user1_id === currentUser.id 
    ? match.user2_id 
    : match.user1_id;
  
  // Navigate to booking page
  navigate(`/booking/request?sitter_id=${otherUserId}`);
};

// Add button in the UI
<button
  onClick={handleBookNow}
  className="bg-primary text-white px-4 py-2 rounded-lg"
>
  📅 Book Now
</button>
```

### Step 4: Update BookingRequestPage
Ensure it accepts sitter_id from URL params:

```typescript
// In src/pages/BookingRequestPage.tsx

const searchParams = new URLSearchParams(location.search);
const sitterId = searchParams.get('sitter_id');

// Pre-fill sitter information
React.useEffect(() => {
  if (sitterId) {
    loadSitterInfo(sitterId);
  }
}, [sitterId]);
```

### Step 5: Add Stripe Integration
Create `src/lib/stripe.ts`:

```typescript
import { loadStripe } from '@stripe/stripe-js';

export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);

export const createPaymentIntent = async (
  bookingId: string,
  amount: number
) => {
  // Call your backend to create payment intent
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId, amount })
  });
  
  return response.json();
};
```

### Step 6: Create Payment Component
Create `src/components/payment/PaymentForm.tsx`:

```typescript
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';

const PaymentForm = ({ bookingId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) return;
    
    // Create payment intent
    const { clientSecret } = await createPaymentIntent(bookingId, amount);
    
    // Confirm payment
    const { error, paymentIntent } = await stripe.confirmCardPayment(
      clientSecret,
      {
        payment_method: {
          card: elements.getElement(CardElement)!,
        }
      }
    );
    
    if (error) {
      console.error(error);
    } else if (paymentIntent.status === 'succeeded') {
      // Save to Supabase
      await supabase.rpc('create_payment_and_update_booking', {
        p_booking_id: bookingId,
        p_user_id: currentUser.id,
        p_amount: amount,
        p_stripe_payment_intent_id: paymentIntent.id
      });
      
      onSuccess();
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Pay ${amount}
      </button>
    </form>
  );
};

// Wrap with Elements provider
export default ({ bookingId, amount, onSuccess }) => (
  <Elements stripe={stripePromise}>
    <PaymentForm bookingId={bookingId} amount={amount} onSuccess={onSuccess} />
  </Elements>
);
```

---

## 🎨 UI Components Needed

### 1. Match Modal (✅ Already exists)
- `src/components/ui/MatchModal.tsx`
- Shows when match is created
- "Send Message" button

### 2. Chat Window (✅ Already exists)
- `src/components/messaging/ChatWindow.tsx`
- Need to add: "Book Now" button

### 3. Booking Request Page (✅ Already exists)
- `src/pages/BookingRequestPage.tsx`
- Need to update: Accept sitter_id from URL

### 4. Payment Form (❌ Needs to be created)
- `src/components/payment/PaymentForm.tsx`
- Stripe card element
- Payment confirmation

### 5. Booking Confirmation Page (❌ Needs to be created)
- `src/pages/BookingConfirmationPage.tsx`
- Shows after successful payment
- Booking details
- Receipt

---

## 🔐 Environment Variables Needed

Add to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Backend needs:
```
STRIPE_SECRET_KEY=sk_test_...
```

---

## 🧪 Testing Checklist

- [ ] User A swipes right on User B
- [ ] User B swipes right on User A
- [ ] Match modal appears for both users
- [ ] Both users can send messages
- [ ] "Book Now" button appears in chat
- [ ] Clicking "Book Now" navigates to booking page
- [ ] Booking form pre-fills sitter info
- [ ] Booking request creates record in database
- [ ] Sitter receives notification
- [ ] Sitter can accept/decline booking
- [ ] Payment form appears after acceptance
- [ ] Payment processes successfully
- [ ] Booking status updates to 'paid'
- [ ] Both users receive confirmation

---

## 🚀 Next Steps

1. **Run the database migration** (CREATE_SWIPE_SYSTEM.sql)
2. **Add payments table** (ADD_PAYMENTS_TABLE.sql)
3. **Update ChatWindow** with "Book Now" button
4. **Create PaymentForm** component
5. **Set up Stripe** account and get API keys
6. **Test the complete flow** end-to-end

---

## 💡 Tips

- Use Stripe test mode during development
- Test card: 4242 4242 4242 4242
- Add error handling for payment failures
- Send email confirmations after booking
- Add calendar integration for sitters
- Implement refund flow for cancellations

---

You now have a complete marketplace flow from discovery to payment! 🎉
