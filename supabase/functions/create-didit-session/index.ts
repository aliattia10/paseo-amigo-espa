/**
 * Creates a Didit verification session and returns the URL for the Web SDK.
 *
 * Requires Supabase secrets: DIDIT_API_KEY, DIDIT_WORKFLOW_ID
 * Get them from Didit Console → API & Webhooks and Workflows.
 *
 * Tries v1 API first (Authorization: Bearer), falls back to v3 (x-api-key).
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const diditApiKey = Deno.env.get('DIDIT_API_KEY') ?? ''
const workflowId = Deno.env.get('DIDIT_WORKFLOW_ID') ?? ''
const supabase = createClient(supabaseUrl, supabaseKey)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function tryCreateSession(
  apiKey: string,
  wfId: string,
  vendorData: string,
  callbackUrl?: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  // Attempt 1: v1 API with Authorization: Bearer (matches Didit docs snippet)
  const v1Res = await fetch('https://api.didit.me/v1/session', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      workflow_id: wfId,
      vendor_data: vendorData,
      ...(callbackUrl ? { callback_url: callbackUrl } : {}),
    }),
  }).catch(() => null)

  if (v1Res && v1Res.ok) {
    const data = await v1Res.json().catch(() => ({}))
    return { ok: true, status: 200, data }
  }

  // Attempt 2: v3 API with x-api-key header (older format)
  const v3Res = await fetch('https://verification.didit.me/v3/session/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify({
      workflow_id: wfId,
      vendor_data: vendorData,
      ...(callbackUrl ? { callback: callbackUrl } : {}),
    }),
  }).catch(() => null)

  if (v3Res) {
    const data = await v3Res.json().catch(() => ({}))
    return { ok: v3Res.ok, status: v3Res.status, data }
  }

  return { ok: false, status: 503, data: { error: 'Could not reach Didit API' } }
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
      console.error('DIDIT_API_KEY or DIDIT_WORKFLOW_ID not set in Supabase secrets')
      return new Response(JSON.stringify({ error: 'Server configuration error: DIDIT credentials not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json().catch(() => ({}))
    const userType = (body.userType === 'walker' || body.userType === 'owner') ? body.userType : 'owner'

    const vendorData = JSON.stringify({
      user_id: user.id,
      user_type: userType,
      email: user.email,
      source: 'petflik',
    })

    const { ok, status, data } = await tryCreateSession(
      diditApiKey,
      workflowId,
      vendorData,
      body.callback_url || undefined,
    )

    if (!ok) {
      console.error('Didit create session error', status, data)
      return new Response(
        JSON.stringify({ error: data?.detail || data?.message || data?.error || 'Failed to create verification session' }),
        { status: status >= 400 && status < 600 ? status : 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Different API versions return the URL in different fields
    const url = data.url || data.verification_url || data.session_url
    if (!url || typeof url !== 'string') {
      console.error('Didit response missing url field', data)
      return new Response(JSON.stringify({ error: 'Invalid response from verification service' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ url, session_id: data.session_id || data.id }), {
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
