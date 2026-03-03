/**
 * Creates a Didit verification session and returns the URL for the Web SDK.
 *
 * Requires Supabase secrets: DIDIT_API_KEY, DIDIT_WORKFLOW_ID
 * Get them from Didit Console → API & Webhooks and Workflows.
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const diditApiKey = Deno.env.get('DIDIT_API_KEY')!
const workflowId = Deno.env.get('DIDIT_WORKFLOW_ID')!
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '')
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!diditApiKey || !workflowId) {
      console.error('DIDIT_API_KEY or DIDIT_WORKFLOW_ID not set')
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const userType = (body.userType === 'walker' || body.userType === 'owner') ? body.userType : 'owner'

    const vendorData = JSON.stringify({
      user_id: user.id,
      user_type: userType,
      source: 'paseo-amigo-espa',
    })

    const res = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': diditApiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        vendor_data: vendorData,
        callback: body.callback || undefined,
      }),
    })

    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      console.error('Didit create session error', res.status, data)
      return new Response(
        JSON.stringify({ error: data.detail || data.message || 'Failed to create verification session' }),
        { status: res.status >= 400 && res.status < 500 ? res.status : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const url = data.url
    if (!url || typeof url !== 'string') {
      console.error('Didit response missing url', data)
      return new Response(JSON.stringify({ error: 'Invalid response from verification service' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url, session_id: data.session_id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('create-didit-session error', err)
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
