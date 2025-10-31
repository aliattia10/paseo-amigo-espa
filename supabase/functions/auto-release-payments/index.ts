import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * AUTO PAYMENT RELEASE FUNCTION
 * This function should be called by a scheduled job (cron) every hour
 * It finds all bookings that are eligible for payment release (3 days passed)
 * and automatically transfers funds to sitters
 */
serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !supabaseServiceKey || !supabaseUrl) {
      throw new Error('Required secrets not configured');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting auto-release payment job...');

    // Get all bookings eligible for payment release
    const { data: eligibleBookings, error } = await supabase
      .rpc('get_bookings_for_auto_release');

    if (error) {
      console.error('Error fetching eligible bookings:', error);
      throw error;
    }

    if (!eligibleBookings || eligibleBookings.length === 0) {
      console.log('No bookings eligible for payment release');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No bookings to process',
          processed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${eligibleBookings.length} bookings eligible for release`);

    const results = [];

    // Process each booking
    for (const booking of eligibleBookings) {
      try {
        console.log(`Processing booking ${booking.booking_id}...`);

        // Call the release_payment_to_sitter function
        const { data: releaseResult, error: releaseError } = await supabase
          .rpc('release_payment_to_sitter', {
            p_booking_id: booking.booking_id,
            p_force_release: false
          });

        if (releaseError) {
          console.error(`Error releasing payment for booking ${booking.booking_id}:`, releaseError);
          results.push({
            booking_id: booking.booking_id,
            success: false,
            error: releaseError.message
          });
          continue;
        }

        if (!releaseResult.success) {
          console.log(`Cannot release payment for booking ${booking.booking_id}: ${releaseResult.error}`);
          results.push({
            booking_id: booking.booking_id,
            success: false,
            error: releaseResult.error
          });
          continue;
        }

        console.log(`✅ Payment released for booking ${booking.booking_id}`);
        results.push({
          booking_id: booking.booking_id,
          success: true,
          amount: releaseResult.amount
        });

      } catch (bookingError) {
        console.error(`Failed to process booking ${booking.booking_id}:`, bookingError);
        results.push({
          booking_id: booking.booking_id,
          success: false,
          error: bookingError.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    console.log(`Job completed: ${successCount} successful, ${failCount} failed`);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Auto-release job completed',
        total: eligibleBookings.length,
        successful: successCount,
        failed: failCount,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-release payment function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

