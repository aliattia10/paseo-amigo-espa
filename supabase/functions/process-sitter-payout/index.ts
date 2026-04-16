import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
})

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // This function should be called by admin/cron job
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { payoutRequestId } = await req.json()

    // Get payout request
    const { data: payoutRequest, error: requestError } = await supabase
      .from('payout_requests')
      .select('*, sitter:users!payout_requests_sitter_id_fkey(*)')
      .eq('id', payoutRequestId)
      .single()

    if (requestError || !payoutRequest) {
      throw new Error('Payout request not found')
    }

    if (payoutRequest.status !== 'pending') {
      throw new Error('Payout request already processed')
    }

    // Stripe Connect-only payout flow.
    const { data: connectAccount, error: connectErr } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id, onboarding_completed, payouts_enabled, charges_enabled, verification_status')
      .eq('user_id', payoutRequest.sitter_id)
      .single()

    if (connectErr || !connectAccount?.stripe_account_id) {
      throw new Error('Sitter Stripe Connect account not found')
    }

    const payoutResult: Record<string, unknown> = {
      method: 'stripe_connect',
      stripe_account_id: connectAccount.stripe_account_id,
      onboarding_completed: connectAccount.onboarding_completed,
      payouts_enabled: connectAccount.payouts_enabled,
      charges_enabled: connectAccount.charges_enabled,
      verification_status: connectAccount.verification_status,
      status: connectAccount.payouts_enabled ? 'ready_for_stripe_payout' : 'manual_review_required',
      note: connectAccount.payouts_enabled
        ? 'Payout should be processed using Stripe Connect account capabilities.'
        : 'Stripe Connect account is not fully enabled. Complete onboarding before payout.',
    }

    // Update payout request status
    await supabase
      .from('payout_requests')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString(),
        payout_details: JSON.stringify(payoutResult),
        payout_method: 'stripe_connect',
      })
      .eq('id', payoutRequestId)

    // Update bookings payment status to 'released'
    await supabase
      .from('bookings')
      .update({ payment_status: 'released' })
      .eq('sitter_id', payoutRequest.sitter_id)
      .eq('status', 'completed')
      .eq('payment_status', 'held')

    return new Response(
      JSON.stringify({
        success: true,
        payoutRequest: payoutRequestId,
        method: 'stripe_connect',
        amount: payoutRequest.amount,
        details: payoutResult,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error processing payout:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
