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

const insertWorkflowNotifications = async (
  bookingId: string,
  ownerId: string,
  sitterId: string,
  ownerMessage: string,
  sitterMessage: string,
) => {
  await supabase.from('notifications').insert([
    {
      user_id: ownerId,
      type: 'payment_completed',
      title: 'Payment completed',
      message: ownerMessage,
      related_id: bookingId,
    },
    {
      user_id: sitterId,
      type: 'payment_completed',
      title: 'Payment received',
      message: sitterMessage,
      related_id: bookingId,
    },
  ])
}

const insertWorkflowMessage = async (ownerId: string, sitterId: string, content: string) => {
  const { data: matchRow } = await supabase
    .from('matches')
    .select('id, user1_id, user2_id')
    .or(`and(user1_id.eq.${ownerId},user2_id.eq.${sitterId}),and(user1_id.eq.${sitterId},user2_id.eq.${ownerId})`)
    .limit(1)
    .maybeSingle()

  if (!matchRow?.id) return

  await supabase.from('messages').insert({
    match_id: matchRow.id,
    sender_id: ownerId,
    content,
    read: false,
  })
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature')
  
  if (!signature) {
    console.error('No Stripe signature provided')
    // Return 200 to prevent Stripe from retrying
    return new Response(
      JSON.stringify({ received: true, error: 'No signature' }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const body = await req.text()

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    console.log('✅ Webhook event received:', event.type)

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
          const { data: booking } = await supabase
            .from('bookings')
            .select('id, owner_id, sitter_id')
            .eq('id', payment.booking_id)
            .maybeSingle()

          await supabase
            .from('bookings')
            .update({
              status: 'confirmed',
              payment_status: 'held',
              updated_at: new Date().toISOString(),
            })
            .eq('id', payment.booking_id)

          if (booking?.owner_id && booking?.sitter_id) {
            await insertWorkflowNotifications(
              booking.id,
              booking.owner_id,
              booking.sitter_id,
              'Your payment succeeded. Booking is confirmed and ready for service.',
              'Owner payment succeeded. Booking is confirmed and ready for service.',
            )
            await insertWorkflowMessage(
              booking.owner_id,
              booking.sitter_id,
              'Payment completed. Booking confirmed and ready for service.',
            )
          }
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
        const disabledReason = account.requirements?.disabled_reason || null
        const fieldsNeeded = [
          ...(account.requirements?.currently_due ?? []),
          ...(account.requirements?.past_due ?? []),
        ]
        const verificationStatus = account.charges_enabled && account.payouts_enabled
          ? 'verified'
          : disabledReason
            ? 'restricted'
            : 'pending'

        await supabase
          .from('stripe_connect_accounts')
          .update({
            charges_enabled: account.charges_enabled,
            payouts_enabled: account.payouts_enabled,
            details_submitted: account.details_submitted,
            verification_status: verificationStatus,
            onboarding_completed: account.details_submitted,
            verification_fields_needed: fieldsNeeded,
          })
          .eq('stripe_account_id', account.id)

        console.log('Account updated:', account.id, 'status:', verificationStatus)
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
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Webhook error:', error)
    // Always return 200 to prevent Stripe from disabling the webhook
    // Log the error but acknowledge receipt
    return new Response(
      JSON.stringify({ received: true, error: error.message }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
