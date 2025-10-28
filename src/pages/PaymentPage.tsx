import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

function PaymentForm({ bookingId, amount, onSuccess }: { bookingId: string; amount: number; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/bookings`,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast.error(error.message);
      } else {
        // Update booking status
        await supabase
          .from('bookings')
          .update({ payment_status: 'held' })
          .eq('id', bookingId);

        toast.success('Payment authorized! Your booking is confirmed.');
        onSuccess();
      }
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay €${amount.toFixed(2)}`
        )}
      </Button>
      <p className="text-sm text-muted-foreground text-center">
        Your payment will be held securely until the service is completed.
      </p>
    </form>
  );
}

export default function PaymentPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!bookingId || !currentUser) return;

    const fetchBookingAndPayment = async () => {
      try {
        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .eq('owner_id', currentUser.id)
          .single();

        if (bookingError) throw bookingError;
        setBooking(bookingData);

        // Create payment intent
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: {
            amount: bookingData.payment_amount,
            bookingId: bookingData.id,
            ownerEmail: currentUser.email,
            description: `Booking for ${bookingData.service_type}`,
          },
        });

        if (error) throw error;

        // Update booking with payment intent ID
        await supabase
          .from('bookings')
          .update({ stripe_payment_intent_id: data.paymentIntentId })
          .eq('id', bookingId);

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error('Error:', error);
        toast.error('Failed to initialize payment');
        navigate('/bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingAndPayment();
  }, [bookingId, currentUser, navigate]);

  if (loading || !clientSecret) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Complete Your Booking</CardTitle>
          <CardDescription>
            Securely pay for your {booking.service_type} service
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm">Service:</span>
              <span className="text-sm font-medium">{booking.service_type}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Total Amount:</span>
              <span className="text-sm font-medium">€{booking.payment_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span className="text-xs">Platform Fee (20%):</span>
              <span className="text-xs">€{booking.commission_fee?.toFixed(2)}</span>
            </div>
          </div>

          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
                variables: {
                  colorPrimary: '#d97706',
                },
              },
            }}
          >
            <PaymentForm
              bookingId={bookingId!}
              amount={booking.payment_amount}
              onSuccess={() => navigate('/bookings')}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
