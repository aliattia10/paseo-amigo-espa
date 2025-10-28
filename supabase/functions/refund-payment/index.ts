import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = 'https://zxbfygofxxmfivddwdqt.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !supabaseServiceKey) {
      throw new Error('Required secrets not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { bookingId, reason } = await req.json();

    console.log('Refunding payment for booking:', bookingId);

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('stripe_payment_intent_id, payment_status, owner_id, sitter_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    if (booking.payment_status === 'refunded') {
      throw new Error('Payment already refunded');
    }

    // Cancel the payment intent if it's still held
    let refund;
    if (booking.payment_status === 'held') {
      // Cancel authorization
      await stripe.paymentIntents.cancel(booking.stripe_payment_intent_id);
      console.log('Payment intent cancelled');
    } else if (booking.payment_status === 'released') {
      // Create refund
      refund = await stripe.refunds.create({
        payment_intent: booking.stripe_payment_intent_id,
        reason: 'requested_by_customer',
      });
      console.log('Refund created:', refund.id);
    }

    // Update booking
    await supabase
      .from('bookings')
      .update({
        payment_status: 'refunded',
        status: 'cancelled',
        refund_reason: reason,
        refunded_at: new Date().toISOString(),
        cancellation_reason: reason,
      })
      .eq('id', bookingId);

    // Notify both parties
    await supabase.from('notifications').insert([
      {
        user_id: booking.owner_id,
        type: 'refund_processed',
        title: 'Refund Processed',
        message: 'Your booking has been refunded',
        related_id: bookingId,
      },
      {
        user_id: booking.sitter_id,
        type: 'booking_cancelled',
        title: 'Booking Cancelled',
        message: 'A booking has been cancelled and refunded',
        related_id: bookingId,
      },
    ]);

    console.log('Refund processed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        refundId: refund?.id,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error refunding payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
