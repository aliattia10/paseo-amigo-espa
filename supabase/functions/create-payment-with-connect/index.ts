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
const STRIPE_CHF_MIN = 0.5 // Minimum charge in CHF (major unit)

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

    const { bookingId, amount, originalAmountChf, chargedAmountChf, testMode } = await req.json()

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

    // Check if sitter has Stripe Connect configured.
    try {
      const { data: connectAccount } = await supabase
        .from('stripe_connect_accounts')
        .select('onboarding_completed, payouts_enabled, charges_enabled')
        .eq('user_id', booking.sitter_id)
        .single()
      
      // Log warning if Stripe isn't connected yet, but do not block payment.
      if (!connectAccount || !connectAccount.onboarding_completed) {
        console.warn('Sitter has not completed Stripe Connect setup yet, allowing payment to proceed')
      }
    } catch (error) {
      console.warn('Could not check Stripe Connect status:', error)
    }

    const incomingAmount = Number(amount)
    const safeAmountChf = Number.isFinite(incomingAmount) ? Math.max(STRIPE_CHF_MIN, incomingAmount) : STRIPE_CHF_MIN
    const originalAmountSafe = Number.isFinite(Number(originalAmountChf))
      ? Math.max(STRIPE_CHF_MIN, Number(originalAmountChf))
      : safeAmountChf
    const chargedAmountSafe = Number.isFinite(Number(chargedAmountChf))
      ? Math.max(STRIPE_CHF_MIN, Number(chargedAmountChf))
      : safeAmountChf

    // Calculate fees
    const totalAmount = Math.round(safeAmountChf * 100) // Convert to rappen
    const platformFee = Math.round(totalAmount * PLATFORM_FEE_PERCENT)
    const sitterAmount = totalAmount - platformFee

    // Create standard payment intent (money goes to platform account)
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'chf',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: bookingId,
        payer_id: user.id,
        receiver_id: booking.sitter_id,
        platform_fee: (platformFee / 100).toString(),
        sitter_amount: (sitterAmount / 100).toString(),
        test_mode: Boolean(testMode).toString(),
        original_amount_chf: originalAmountSafe.toFixed(2),
        charged_amount_chf: chargedAmountSafe.toFixed(2),
      },
    })

    // Save payment record
    await supabase.from('payments').insert({
      booking_id: bookingId,
      payer_id: user.id,
      receiver_id: booking.sitter_id,
      amount: safeAmountChf,
      currency: 'CHF',
      platform_fee: platformFee / 100,
      sitter_payout: sitterAmount / 100,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'pending',
    })

    if (testMode) {
      const existingNotes = typeof booking.notes === 'string' ? booking.notes : ''
      const testNote =
        `\n[Test pricing mode] original_amount_chf=${originalAmountSafe.toFixed(2)} charged_amount_chf=${chargedAmountSafe.toFixed(2)}`
      await supabase
        .from('bookings')
        .update({
          notes: `${existingNotes}${testNote}`.trim(),
          payment_amount: safeAmountChf,
        })
        .eq('id', bookingId)
    }

    return new Response(
      JSON.stringify({ 
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        chargedAmountChf: safeAmountChf,
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
