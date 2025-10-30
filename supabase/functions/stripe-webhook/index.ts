import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    return new Response(
      JSON.stringify({ error: 'No signature' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('Webhook event:', event.type)

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await supabase
          .from('payments')
          .update({
            status: 'succeeded',
            paid_at: new Date().toISOString(),
            stripe_charge_id: paymentIntent.latest_charge as string,
          })
          .eq('stripe_payment_intent_id', paymentIntent.id)

        // Update booking status
        const { data: payment } = await supabase
          .from('payments')
          .select('booking_id')
          .eq('stripe_payment_intent_id', paymentIntent.id)
          .single()

        if (payment) {
          await supabase
            .from('bookings')
            .update({ status: 'paid' })
            .eq('id', payment.booking_id)
        }
        
        console.log('Payment succeeded:', paymentIntent.id)
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_payment_intent_id', paymentIntent.id)
        
        console.log('Payment failed:', paymentIntent.id)
        break
      }

      case 'account.updated': {
        const account = event.data.object as Stripe.Account
        
        await supabase
          .from('stripe_connect_accounts')
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            verification_status: account.charges_enabled ? 'verified' : 'pending',
            onboarding_completed: account.details_submitted,
          })
          .eq('stripe_account_id', account.id)
        
        console.log('Account updated:', account.id)
        break
      }

      case 'transfer.created': {
        const transfer = event.data.object as Stripe.Transfer
        
        await supabase
          .from('payments')
          .update({ stripe_transfer_id: transfer.id })
          .eq('stripe_payment_intent_id', transfer.source_transaction as string)
        
        console.log('Transfer created:', transfer.id)
        break
      }

      case 'payout.paid': {
        const payout = event.data.object as Stripe.Payout
        console.log('Payout paid:', payout.id, 'Amount:', payout.amount / 100, payout.currency)
        break
      }

      case 'payout.failed': {
        const payout = event.data.object as Stripe.Payout
        console.error('Payout failed:', payout.id, 'Reason:', payout.failure_message)
        break
      }

      default:
        console.log('Unhandled event type:', event.type)
    }

    return new Response(
      JSON.stringify({ received: true }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
