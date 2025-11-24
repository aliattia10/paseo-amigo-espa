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

    // Get sitter's payout details
    const sitter = payoutRequest.sitter
    const payoutMethod = sitter.payout_method

    let payoutResult: any = {}

    if (payoutMethod === 'paypal') {
      // For PayPal, you would integrate with PayPal API
      // For now, mark as manual processing required
      payoutResult = {
        method: 'paypal',
        email: sitter.paypal_email,
        status: 'manual_processing_required',
        note: 'Process PayPal payout manually to: ' + sitter.paypal_email
      }
    } else if (payoutMethod === 'bank') {
      // For bank transfers, you could use Stripe Transfers API if you have their bank details
      // Or mark for manual SEPA transfer
      payoutResult = {
        method: 'bank_transfer',
        iban: sitter.iban,
        account_holder: sitter.account_holder_name,
        bank_name: sitter.bank_name,
        status: 'manual_processing_required',
        note: 'Process bank transfer manually to IBAN: ' + sitter.iban
      }
    }

    // Update payout request status
    await supabase
      .from('payout_requests')
      .update({
        status: 'processing',
        processed_at: new Date().toISOString(),
        payout_details: JSON.stringify(payoutResult),
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
        method: payoutMethod,
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
