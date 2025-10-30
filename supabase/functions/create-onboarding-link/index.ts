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
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, origin',
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

    // Get Stripe account ID
    const { data: account, error: accountError } = await supabase
      .from('stripe_connect_accounts')
      .select('stripe_account_id')
      .eq('user_id', user.id)
      .single()

    if (accountError || !account) {
      return new Response(
        JSON.stringify({ error: 'No Stripe account found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get origin from request
    const origin = req.headers.get('origin') || 'https://paseo-amigo-espa.lovable.app'

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.stripe_account_id,
      refresh_url: `${origin}/payout-setup?refresh=true`,
      return_url: `${origin}/payout-setup?success=true`,
      type: 'account_onboarding',
    })

    // Update database with link
    await supabase
      .from('stripe_connect_accounts')
      .update({
        onboarding_link: accountLink.url,
        onboarding_expires_at: new Date(accountLink.expires_at * 1000).toISOString(),
      })
      .eq('user_id', user.id)

    return new Response(
      JSON.stringify({ url: accountLink.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error creating onboarding link:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
