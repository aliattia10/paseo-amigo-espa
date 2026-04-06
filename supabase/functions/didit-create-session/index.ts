import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

  try {
    const apiKey = Deno.env.get('DIDIT_API_KEY');
    const workflowId = Deno.env.get('DIDIT_WORKFLOW_ID');
    const publicAppUrl = (Deno.env.get('PUBLIC_APP_URL') || 'https://petflik.com').replace(/\/$/, '');

    if (!apiKey || !workflowId) {
      return new Response(
        JSON.stringify({
          error: 'Didit is not configured. Set DIDIT_API_KEY and DIDIT_WORKFLOW_ID as Supabase function secrets.',
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const jwt = authHeader.replace('Bearer ', '');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseAnon);
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser(jwt);

    if (userErr || !user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const callback = `${publicAppUrl}/verify-identity-done`;

    const diditRes = await fetch('https://verification.didit.me/v3/session/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({
        workflow_id: workflowId,
        callback,
        vendor_data: user.id,
        metadata: { source: 'petflik-web' },
      }),
    });

    const text = await diditRes.text();
    if (!diditRes.ok) {
      console.error('Didit create session failed:', diditRes.status, text);
      return new Response(
        JSON.stringify({ error: 'Didit session creation failed', details: text }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const session = JSON.parse(text);
    return new Response(
      JSON.stringify({
        verification_url: session.verification_url,
        session_token: session.session_token,
        session_id: session.session_id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    console.error('didit-create-session error:', e);
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
