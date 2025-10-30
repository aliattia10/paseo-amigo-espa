# 💳 Stripe Payment System Setup for Spain

## Overview
Complete payment integration for your pet sitting marketplace with support for Spanish payment methods.

---

## 🇪🇸 Supported Payment Methods in Spain

### Credit/Debit Cards
- ✅ Visa
- ✅ Mastercard
- ✅ American Express
- ✅ Cartes Bancaires

### Local Payment Methods
- ✅ **Bizum** (instant bank transfers - very popular in Spain!)
- ✅ SEPA Direct Debit
- ✅ Bank transfers
- ✅ Google Pay
- ✅ Apple Pay

---

## 📋 Prerequisites

1. **Stripe Account** (Spain-based)
   - Go to https://stripe.com/es
   - Sign up with your Spanish business details
   - Complete identity verification (DNI/NIE)
   - Add bank account for payouts

2. **Business Requirements**
   - Business name and address
   - Tax ID (NIF/CIF)
   - Bank account (IBAN)

---

## 🚀 Step 1: Install Stripe

```bash
npm install @stripe/stripe-js @stripe/react-stripe-js
```

---

## 🔧 Step 2: Set Up Environment Variables

Add to `.env`:
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

Add to your backend `.env`:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

---

## 💾 Step 3: Create Payment Tables

Run this SQL in Supabase:

```sql
-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  payer_id UUID NOT NULL REFERENCES auth.users(id),
  receiver_id UUID NOT NULL REFERENCES auth.users(id),
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'EUR',
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  sitter_payout DECIMAL(10, 2),
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  payment_method_type TEXT, -- 'card', 'bizum', 'sepa_debit', etc.
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'succeeded', 'failed', 'refunded'
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sitter payout accounts (for Stripe Connect)
CREATE TABLE IF NOT EXISTS sitter_payout_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sitter_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  stripe_account_id TEXT UNIQUE,
  account_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'restricted'
  payouts_enabled BOOLEAN DEFAULT FALSE,
  iban TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment methods saved by users
CREATE TABLE IF NOT EXISTS saved_payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_payment_method_id TEXT NOT NULL,
  type TEXT NOT NULL, -- 'card', 'bizum', 'sepa_debit'
  last4 TEXT,
  brand TEXT, -- 'visa', 'mastercard', etc.
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_payer ON payments(payer_id);
CREATE INDEX idx_payments_receiver ON payments(receiver_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_sitter_accounts_sitter ON sitter_payout_accounts(sitter_id);
CREATE INDEX idx_saved_methods_user ON saved_payment_methods(user_id);

-- RLS Policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE sitter_payout_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_payment_methods ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users can view their payments"
  ON payments FOR SELECT
  USING (auth.uid() = payer_id OR auth.uid() = receiver_id);

-- Sitters can view their payout account
CREATE POLICY "Sitters can view own payout account"
  ON sitter_payout_accounts FOR SELECT
  USING (auth.uid() = sitter_id);

-- Users can view their saved payment methods
CREATE POLICY "Users can view own payment methods"
  ON saved_payment_methods FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 🎨 Step 4: Create Payment Components

### 4.1 Payment Form Component

Create `src/components/payment/PaymentForm.tsx`:

```typescript
import React, { useState } from 'react';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface PaymentFormProps {
  bookingId: string;
  amount: number;
  onSuccess: () => void;
}

const CheckoutForm: React.FC<PaymentFormProps> = ({ bookingId, amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/booking/success?booking_id=${bookingId}`,
        },
      });

      if (error) {
        toast({
          title: 'Error en el pago',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        onSuccess();
      }
    } catch (err) {
      console.error('Payment error:', err);
      toast({
        title: 'Error',
        description: 'No se pudo procesar el pago',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Método de pago</h3>
        <PaymentElement />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-semibold">€{amount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-600">Comisión de servicio (20%)</span>
          <span className="font-semibold">€{(amount * 0.2).toFixed(2)}</span>
        </div>
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total</span>
            <span className="text-lg font-bold">€{(amount * 1.2).toFixed(2)}</span>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-primary hover:bg-primary/90 text-white py-6 text-lg"
      >
        {loading ? 'Procesando...' : `Pagar €${(amount * 1.2).toFixed(2)}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Pago seguro procesado por Stripe. Tus datos están protegidos.
      </p>
    </form>
  );
};

export const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: props.bookingId,
            amount: props.amount * 1.2, // Include platform fee
          }),
        });

        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error creating payment intent:', error);
      } finally {
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, [props.bookingId, props.amount]);

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#10b981',
          },
        },
        locale: 'es',
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
};
```

### 4.2 Payment Methods Page

Create `src/pages/PaymentMethodsPage.tsx`:

```typescript
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, Plus, Trash2 } from 'lucide-react';

export const PaymentMethodsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    if (!currentUser) return;

    try {
      const { data } = await (supabase as any)
        .from('saved_payment_methods')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });

      setPaymentMethods(data || []);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPaymentMethod = () => {
    // Open Stripe setup modal
    window.location.href = '/payment/add-method';
  };

  const handleDeleteMethod = async (methodId: string) => {
    try {
      await (supabase as any)
        .from('saved_payment_methods')
        .delete()
        .eq('id', methodId);

      loadPaymentMethods();
    } catch (error) {
      console.error('Error deleting payment method:', error);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Métodos de Pago</h1>
        <Button onClick={handleAddPaymentMethod}>
          <Plus className="w-4 h-4 mr-2" />
          Añadir Método
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">Cargando...</div>
      ) : paymentMethods.length === 0 ? (
        <Card className="p-12 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No hay métodos de pago</h3>
          <p className="text-gray-600 mb-4">
            Añade una tarjeta o cuenta bancaria para realizar pagos
          </p>
          <Button onClick={handleAddPaymentMethod}>
            Añadir Método de Pago
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {paymentMethods.map((method) => (
            <Card key={method.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CreditCard className="w-8 h-8 text-gray-600" />
                <div>
                  <p className="font-semibold">
                    {method.brand?.toUpperCase()} •••• {method.last4}
                  </p>
                  <p className="text-sm text-gray-600">{method.type}</p>
                </div>
                {method.is_default && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                    Predeterminado
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteMethod(method.id)}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold mb-2">💡 Métodos de pago disponibles</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✅ Tarjetas de crédito/débito (Visa, Mastercard, Amex)</li>
          <li>✅ Bizum (transferencias instantáneas)</li>
          <li>✅ SEPA Direct Debit (domiciliación bancaria)</li>
          <li>✅ Google Pay / Apple Pay</li>
        </ul>
      </div>
    </div>
  );
};
```

---

## 🔐 Step 5: Backend API (Supabase Edge Functions)

Create `supabase/functions/create-payment-intent/index.ts`:

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { bookingId, amount } = await req.json()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
      },
    })

    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## 📱 Step 6: Update Booking Flow

Add payment step after booking is accepted:

1. Owner creates booking → Status: `requested`
2. Sitter accepts booking → Status: `accepted`
3. Owner pays → Status: `paid`
4. Service completed → Status: `completed`
5. Platform releases payment to sitter

---

## 💰 Step 7: Platform Fees

Recommended fee structure:
- **20% platform fee** (industry standard)
- Owner pays: Service cost + 20% fee
- Sitter receives: Service cost (80% goes to sitter)
- Platform keeps: 20% fee

Example:
- Service: €15/hour × 2 hours = €30
- Platform fee (20%): €6
- Owner pays: €36
- Sitter receives: €30

---

## 🧪 Testing

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- **3D Secure**: 4000 0027 6000 3184

---

## 🚀 Go Live Checklist

- [ ] Complete Stripe account verification
- [ ] Add business details and tax info
- [ ] Set up bank account for payouts
- [ ] Switch to live API keys
- [ ] Test with real small payment
- [ ] Set up webhook endpoints
- [ ] Configure payout schedule
- [ ] Add terms of service
- [ ] Add refund policy

---

## 📞 Support

- Stripe Spain Support: https://support.stripe.com/
- Phone: +34 911 23 86 00
- Email: support@stripe.com

---

You're ready to accept payments in Spain! 🇪🇸💳
