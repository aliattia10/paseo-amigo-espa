import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const PLATFORM_FEE_PERCENT = 0.20 // 20% platform fee

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { bookingId, amount } = await req.json()

    // Get booking details
    const { data: booking, error: bookingError} = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      console.error('Booking error:', bookingError)
      return new Response(
        JSON.stringify({ error: 'Booking not found', details: bookingError?.message }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Optional: Check if sitter has payout method configured
    // This is optional for now - sitter can add payout method later
    try {
      const { data: sitterProfile } = await supabase
        .from('users')
        .select('payout_method, paypal_email, iban')
        .eq('id', booking.sitter_id)
        .single()
      
      // Log warning if no payout method, but don't block payment
      if (!sitterProfile || (!sitterProfile.paypal_email && !sitterProfile.iban)) {
        console.warn('Sitter has not set up payout method yet, but allowing payment to proceed')
      }
    } catch (error) {
      // If columns don't exist yet (migration not run), just log and continue
      console.warn('Could not check payout method (columns may not exist yet):', error)
    }

    // Calculate fees
    const totalAmount = Math.round(amount * 100) // Convert to cents
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)
    const sitterAmount = totalAmount - platformFee

    // Create standard payment intent (money goes to platform account)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        payer_id: user.id,
        receiver_id: booking.sitter_id,
        platform_fee: (platformFee / 100).toString(),
        sitter_amount: (sitterAmount / 100).toString(),
      },
    })

    // Save payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      payer_id: user.id,
      receiver_id: booking.sitter_id,
      amount: amount,
      currency: 'EUR',
      platform_fee: platformFee / 100,
      sitter_payout: sitterAmount / 100,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
    })

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        platformFee: platformFee / 100,
        sitterAmount: sitterAmount / 100,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating payment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
