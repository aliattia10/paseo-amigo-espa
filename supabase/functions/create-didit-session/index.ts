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
/** Optional base URL for redirect after verification (e.g. https://petflik.com). If set, callback becomes {DIDIT_CALLBACK_BASE}/verify-identity-done */
const diditCallbackBase = Deno.env.get('DIDIT_CALLBACK_BASE') ?? ''
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
  // Didit v3 API (documented): https://verification.didit.me/v3/session/
  // Auth: x-api-key header. Body: workflow_id, vendor_data (string), callback (optional).
  // Response: 201 Created with url, session_id, etc.
  const payload: Record<string, string> = {
    workflow_id: wfId,
    vendor_data: vendorData,
  }
  if (callbackUrl && callbackUrl.startsWith('http')) {
    payload.callback = callbackUrl
    payload.callback_method = 'both'
  }

  const res = await fetch('https://verification.didit.me/v3/session/', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  }).catch((e) => {
    console.error('Didit fetch error', e)
    return null
  })

  if (!res) {
    return { ok: false, status: 503, data: { error: 'Could not reach Didit API' } }
  }

  const data = await res.json().catch(() => ({}))
  const ok = res.status === 200 || res.status === 201
  if (!ok) {
    console.error('Didit API error', res.status, data)
  }
  return { ok, status: res.status, data }
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
      email: user.email ?? undefined,
      source: 'petflik',
    })

    const callbackUrl =
      (typeof body.callback_url === 'string' && body.callback_url.startsWith('http') ? body.callback_url : null) ||
      (diditCallbackBase ? `${diditCallbackBase.replace(/\/$/, '')}/verify-identity-done` : null) ||
      undefined

    const { ok, status, data } = await tryCreateSession(
      diditApiKey,
      workflowId,
      vendorData,
      callbackUrl,
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
