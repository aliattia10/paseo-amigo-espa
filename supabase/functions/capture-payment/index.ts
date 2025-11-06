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

    const { bookingId } = await req.json();

    console.log('Marking payment as held for booking:', bookingId);

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('stripe_payment_intent_id, total_price, commission_fee, sitter_id, payment_status')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Check if payment intent exists
    if (!booking.stripe_payment_intent_id) {
      throw new Error('No payment has been made for this booking yet. Payment is required before completing booking.');
    }

    // Check if already released
    if (booking.payment_status === 'released') {
      throw new Error('Payment has already been released for this booking');
    }

    // Verify payment was successful
    const paymentIntent = await stripe.paymentIntents.retrieve(
      booking.stripe_payment_intent_id
    );

    if (paymentIntent.status !== 'succeeded') {
      throw new Error('Payment has not been completed yet');
    }

    console.log('Payment verified:', paymentIntent.id);

    // Calculate sitter's amount (total - commission)
    const sitterAmount = booking.total_price - booking.commission_fee;

    // Update booking payment status to 'held' (funds held until service completed)
    await supabase
      .from('bookings')
      .update({ payment_status: 'held' })
      .eq('id', bookingId);

    console.log('Payment marked as held, will be released when service is completed');

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        sitterAmount: sitterAmount,
        status: 'held',
        message: 'Payment held securely. Will be released to sitter when service is completed.',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
