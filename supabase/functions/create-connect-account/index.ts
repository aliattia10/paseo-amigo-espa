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

    // Check if account already exists
    const { data: existing } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ accountId: existing.stripe_account_id }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get user profile for metadata
    const { data: profile } = await supabase
      .from('users')
      .select('email, full_name')
      .eq('id', user.id)
      .single()

    // Create Stripe Connect Express account
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'ES',
      email: profile?.email || user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      business_type: 'individual',
      metadata: {
        user_id: user.id,
        platform: 'paseo-amigo',
      },
    })

    // Save to database
    const { error: insertError } = await supabase
      .from('stripe_connect_accounts')
      .insert({
        user_id: user.id,
        stripe_account_id: account.id,
        account_type: 'express',
        country: 'ES',
        currency: 'EUR',
      })

    if (insertError) {
      console.error('Database insert error:', insertError)
      throw new Error('Failed to save account')
    }

    return new Response(
      JSON.stringify({ accountId: account.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating Connect account:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
