import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { createUserSubscription } from '@/lib/payment-services';
import { stripeOptions, formatPrice, getIntervalText } from '@/lib/stripe';
import { Loader2, CreditCard, Lock } from 'lucide-react';
import type { SubscriptionPlan } from '@/types';

interface PaymentFormProps {
  selectedPlan: SubscriptionPlan;
  onSuccess: () => void;
  onCancel: () => void;
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_publishable_key');

const PaymentFormContent: React.FC<PaymentFormProps> = ({ 
  selectedPlan, 
  onSuccess, 
  onCancel 
}) => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: currentUser?.email || '',
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !currentUser) {
      return;
    }

    setLoading(true);

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { error: paymentMethodError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: customerInfo.name,
          email: customerInfo.email,
        },
      });

      if (paymentMethodError) {
        throw new Error(paymentMethodError.message);
      }

      // Create subscription
      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: currentUser.id,
          priceId: selectedPlan.stripePriceId,
          paymentMethodId: paymentMethod.id,
        }),
      });

      const { subscription, error: subscriptionError } = await response.json();

      if (subscriptionError) {
        throw new Error(subscriptionError);
      }

      // Confirm payment
      const { error: confirmError } = await stripe.confirmCardPayment(
        subscription.client_secret,
        {
          payment_method: paymentMethod.id,
        }
      );

      if (confirmError) {
        throw new Error(confirmError.message);
      }

      // Save subscription to database
      await createUserSubscription({
        userId: currentUser.id,
        planId: selectedPlan.id,
        stripeSubscriptionId: subscription.id,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        cancelAtPeriodEnd: false,
      });

      toast({
        title: "¡Suscripción activada!",
        description: `Has suscrito exitosamente al ${selectedPlan.name}.`,
      });

      onSuccess();
    } catch (error: any) {
      console.error('Payment error:', error);
      toast({
        title: "Error en el pago",
        description: error.message || "Hubo un problema procesando tu pago.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Información de Pago
        </CardTitle>
        <div className="text-center">
          <p className="text-lg font-semibold text-terracotta">
            {selectedPlan.name}
          </p>
          <p className="text-2xl font-bold">
            {formatPrice(selectedPlan.price)}
            <span className="text-sm text-muted-foreground ml-1">
              / {getIntervalText(selectedPlan.interval)}
            </span>
          </p>
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre completo</Label>
              <Input
                id="name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Tu nombre completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div>
              <Label>Información de la tarjeta</Label>
              <div className="mt-2 p-4 border rounded-lg bg-muted/50">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#1f2937',
                        '::placeholder': {
                          color: '#9ca3af',
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="w-4 h-4" />
            <span>Tu información está protegida con encriptación SSL</span>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-terracotta hover:bg-terracotta/90"
              disabled={loading || !stripe}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Suscribirse
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

const PaymentForm: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise} options={stripeOptions}>
      <PaymentFormContent {...props} />
    </Elements>
  );
};

export default PaymentForm;
