import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [booking, setBooking] = useState<any>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [platformFee, setPlatformFee] = useState<number>(0);
  const [sitterAmount, setSitterAmount] = useState<number>(0);

  // Get bookingId from query params
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (!bookingId || !currentUser) {
      navigate('/bookings');
      return;
    }

    const fetchBookingAndPayment = async () => {
      try {
        // Get booking details
        const { data: bookingData, error: bookingError } = await supabase
          .from('bookings')
          .select('*, sitter:users!bookings_sitter_id_fkey(name, email)')
          .eq('id', bookingId)
          .eq('owner_id', currentUser.id)
          .single();

        if (bookingError) throw bookingError;
        setBooking(bookingData);

        // Use total_price instead of payment_amount
        const amount = bookingData.total_price || bookingData.payment_amount || 0;

        // Create payment intent with Stripe Connect (20% platform fee)
        const { data, error } = await supabase.functions.invoke('create-payment-with-connect', {
          body: {
            bookingId: bookingData.id,
            amount: amount,
          },
        });

        if (error) throw error;

        // Store platform fee and sitter amount for display
        setPlatformFee(data.platformFee || amount * 0.20);
        setSitterAmount(data.sitterAmount || amount * 0.80);

        // Update booking with payment intent ID
        await supabase
          .from('bookings')
          .update({ 
            stripe_payment_intent_id: data.paymentIntentId,
            payment_amount: amount
          })
          .eq('id', bookingId);

        setClientSecret(data.clientSecret);
      } catch (error: any) {
        console.error('Error:', error);
        toast.error(error.message || 'Failed to initialize payment');
        setTimeout(() => navigate('/bookings'), 2000);
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
          <div className="mb-6 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Service:</span>
              <span className="text-sm font-medium capitalize">{booking.service_type || 'Walk'}</span>
            </div>
            <div className="flex justify-between border-t pt-2">
              <span className="text-base font-semibold">Total Amount:</span>
              <span className="text-base font-bold">€{(booking.total_price || booking.payment_amount)?.toFixed(2)}</span>
            </div>
            <div className="text-xs text-muted-foreground space-y-1 border-t pt-2">
              <div className="flex justify-between">
                <span>Goes to Sitter (80%):</span>
                <span className="font-medium">€{sitterAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Platform Fee (20%):</span>
                <span className="font-medium">€{platformFee.toFixed(2)}</span>
              </div>
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
              amount={booking.total_price || booking.payment_amount}
              onSuccess={() => navigate('/bookings')}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  );
}
