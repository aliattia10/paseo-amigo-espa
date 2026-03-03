/**
 * Didit identity verification webhook (V3 API).
 *
 * Configure in Didit Console → API & Webhooks: set Webhook URL to
 *   https://<PROJECT_REF>.supabase.co/functions/v1/didit-webhook
 * and set secret in Supabase: DIDIT_WEBHOOK_SECRET_KEY (from Didit Console).
 *
 * Create Session API sends vendor_data as a STRING (JSON.stringify of our object);
 * Didit echoes it back here as vendor_data string — we JSON.parse it and set users.verified on status "Approved".
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const webhookSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

/** Vendor data we send when creating a Didit session (must match frontend DiditVendorData). */
interface DiditVendorData {
  user_id?: string
  user_type?: 'owner' | 'walker'
  email?: string
  signup_session_id?: string
  source?: string
}

/** Didit V3 webhook payload: status, session_id, vendor_data (string), workflow_id, webhook_type, etc. */
interface DiditWebhookPayload {
  status?: string
  session_id?: string
  /** Echoed back as the same string we sent when creating the session. */
  vendor_data?: string
  workflow_id?: string
  webhook_type?: string
  timestamp?: number
  decision?: unknown
}

function parseVendorData(vendorDataRaw: unknown): DiditVendorData | null {
  if (typeof vendorDataRaw === 'string') {
    try {
      const v = JSON.parse(vendorDataRaw) as DiditVendorData
      return v && typeof v === 'object' ? v : null
    } catch {
      return null
    }
  }
  if (vendorDataRaw && typeof vendorDataRaw === 'object') {
    return vendorDataRaw as DiditVendorData
  }
  return null
}

/** X-Signature-V2: sort keys + shorten floats, then HMAC-SHA256(utf8). */
function shortenFloats(data: unknown): unknown {
  if (Array.isArray(data)) return data.map(shortenFloats)
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, shortenFloats(v)])
    )
  }
  if (typeof data === 'number' && !Number.isInteger(data) && data % 1 === 0) {
    return Math.trunc(data)
  }
  return data
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys)
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).sort().reduce((acc: Record<string, unknown>, k) => {
      acc[k] = sortKeys((obj as Record<string, unknown>)[k])
      return acc
    }, {})
  }
  return obj
}

async function verifySignatureV2(
  jsonBody: Record<string, unknown>,
  signatureHeader: string,
  timestampHeader: string,
  secretKey: string
): Promise<boolean> {
  const now = Math.floor(Date.now() / 1000)
  const ts = parseInt(timestampHeader, 10)
  if (Number.isNaN(ts) || Math.abs(now - ts) > 300) return false
  const processed = shortenFloats(jsonBody) as Record<string, unknown>
  const canonical = JSON.stringify(sortKeys(processed))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secretKey),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(canonical)
  )
  const expectedHex = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
  return expectedHex.length === signatureHeader.length && expectedHex === signatureHeader
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature-v2, x-timestamp',
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

  let payload: DiditWebhookPayload
  try {
    payload = await req.json()
  } catch {
    console.error('Didit webhook: invalid JSON body')
    return new Response(
      JSON.stringify({ received: true, error: 'Invalid JSON' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  if (webhookSecret) {
    const sigV2 = req.headers.get('X-Signature-V2')
    const timestamp = req.headers.get('X-Timestamp')
    if (!sigV2 || !timestamp) {
      console.error('Didit webhook: missing X-Signature-V2 or X-Timestamp')
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const ok = await verifySignatureV2(
      payload as Record<string, unknown>,
      sigV2,
      timestamp,
      webhookSecret
    )
    if (!ok) {
      console.error('Didit webhook: invalid signature')
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
  }

  const vendorData = parseVendorData(payload.vendor_data)
  const status = payload.status || 'unknown'
  console.log('Didit webhook:', payload.webhook_type, 'status=', status, 'vendor_data=', payload.vendor_data ? '(parsed)' : 'missing')

  if (!vendorData) {
    console.warn('Didit webhook: could not parse vendor_data')
    return new Response(
      JSON.stringify({ received: true, warning: 'No vendor_data' }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  // Didit status: "Approved" | "Declined" | "In Review" | "Abandoned" | etc.
  const isApproved = status === 'Approved'

  if (isApproved && vendorData.user_id) {
    const { error } = await supabase
      .from('users')
      .update({ verified: true, updated_at: new Date().toISOString() })
      .eq('id', vendorData.user_id)

    if (error) {
      console.error('Didit webhook: failed to update user verified', vendorData.user_id, error)
    } else {
      console.log('Didit webhook: set users.verified=true for', vendorData.user_id)
    }
  }

  if (isApproved && vendorData.signup_session_id && vendorData.email) {
    console.log('Didit webhook: pending signup session', vendorData.signup_session_id, vendorData.email)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})
