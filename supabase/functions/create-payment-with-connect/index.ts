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
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, sitter:walker_id(id)')
      .eq('id', bookingId)
      .single()

    if (bookingError || !booking) {
      return new Response(
        JSON.stringify({ error: 'Booking not found' }), 
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get sitter's Stripe Connect account
    const { data: connectAccount, error: accountError } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id, payouts_enabled')
      .eq('user_id', booking.walker_id)
      .single()

    if (accountError || !connectAccount || !connectAccount.payouts_enabled) {
      return new Response(
        JSON.stringify({ error: 'Sitter has not completed payout setup' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Calculate fees
    const totalAmount = Math.round(amount * 100) // Convert to cents
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)
    const sitterAmount = totalAmount - platformFee

    // Create payment intent with application fee
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'eur',
      application_fee_amount: platformFee,
      transfer_data: {
        destination: connectAccount.stripe_account_id,
      },
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        payer_id: user.id,
        receiver_id: booking.walker_id,
        platform_fee: (platformFee / 100).toString(),
      },
    })

    // Save payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      payer_id: user.id,
      receiver_id: booking.walker_id,
      amount: amount,
      currency: 'EUR',
      platform_fee: platformFee / 100,
      sitter_payout: sitterAmount / 100,
      stripe_payment_intent_id: paymentIntent.id,
      stripe_connect_account_id: connectAccount.stripe_account_id,
      application_fee_amount: platformFee / 100,
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
