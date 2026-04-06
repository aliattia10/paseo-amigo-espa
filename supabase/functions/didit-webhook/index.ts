import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-signature-v2, x-timestamp',
};

async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const buf = await crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

async function verifyDiditSignature(
  body: string,
  signature: string | null,
  timestamp: string | null,
  secret: string
): Promise<boolean> {
  if (!signature || !timestamp) return false;
  const now = Math.floor(Date.now() / 1000);
  const ts = parseInt(timestamp, 10);
  if (Number.isNaN(ts) || Math.abs(now - ts) > 300) return false;
  const expected = await hmacSha256Hex(secret, body);
  return timingSafeEqualStr(expected, signature);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const webhookSecret = Deno.env.get('DIDIT_WEBHOOK_SECRET');
  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const admin = createClient(supabaseUrl, serviceKey);

  const body = await req.text();
  const sig = req.headers.get('x-signature-v2');
  const ts = req.headers.get('x-timestamp');

  if (webhookSecret) {
    if (!(await verifyDiditSignature(body, sig, ts, webhookSecret))) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  }

  try {
    const payload = JSON.parse(body);
    const status: string = payload.status ?? '';
    const vendorData: string | undefined = payload.vendor_data;
    const sessionId: string | undefined = payload.session_id;

    if (!vendorData) {
      return new Response(JSON.stringify({ received: true, skipped: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const approved = status === 'Approved';
    const declined = status === 'Declined';
    const inReview = status === 'In Review' || status === 'In review';

    const verification_status = approved
      ? 'verified'
      : declined
        ? 'rejected'
        : inReview
          ? 'pending_review'
          : 'pending';

    const kyc_data = {
      provider: 'didit',
      session_id: sessionId ?? null,
      status,
      decision: payload.decision ?? null,
      updated_at: new Date().toISOString(),
    };

    await admin
      .from('users')
      .update({
        verification_status,
        verified: approved,
        kyc_data,
        updated_at: new Date().toISOString(),
      })
      .eq('id', vendorData);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('didit-webhook error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
