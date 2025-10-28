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

    console.log('Capturing payment for booking:', bookingId);

    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('stripe_payment_intent_id, total_price, commission_fee, sitter_id')
      .eq('id', bookingId)
      .single();

    if (bookingError || !booking) {
      throw new Error('Booking not found');
    }

    // Capture the payment
    const paymentIntent = await stripe.paymentIntents.capture(
      booking.stripe_payment_intent_id
    );

    console.log('Payment captured:', paymentIntent.id);

    // Calculate transfer amount (total - commission)
    const transferAmount = Math.round(
      (booking.total_price - booking.commission_fee) * 100
    );

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: 'released' })
      .eq('id', bookingId);

    console.log('Payment released to sitter');

    return new Response(
      JSON.stringify({
        success: true,
        paymentIntentId: paymentIntent.id,
        transferAmount: transferAmount / 100,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error capturing payment:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});
