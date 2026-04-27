import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type CleanupTarget = {
  table: string;
  column: string;
};

const cleanupTargets: CleanupTarget[] = [
  { table: 'notifications', column: 'user_id' },
  { table: 'messages', column: 'sender_id' },
  { table: 'messages', column: 'receiver_id' },
  { table: 'matches', column: 'user1_id' },
  { table: 'matches', column: 'user2_id' },
  { table: 'likes', column: 'liker_id' },
  { table: 'likes', column: 'liked_id' },
  { table: 'passes', column: 'passer_id' },
  { table: 'passes', column: 'passed_id' },
  { table: 'pet_passes', column: 'sitter_id' },
  { table: 'pet_likes', column: 'sitter_id' },
  { table: 'bookings', column: 'owner_id' },
  { table: 'bookings', column: 'sitter_id' },
  { table: 'reviews', column: 'reviewer_id' },
  { table: 'reviews', column: 'reviewee_id' },
  { table: 'payout_requests', column: 'sitter_id' },
  { table: 'stripe_connect_accounts', column: 'user_id' },
  { table: 'availability', column: 'user_id' },
  { table: 'availability', column: 'sitter_id' },
  { table: 'discount_codes', column: 'sitter_id' },
  { table: 'activity_feed', column: 'user_id' },
  { table: 'pets', column: 'owner_id' },
  { table: 'dogs', column: 'owner_id' },
  { table: 'images', column: 'user_id' },
  { table: 'walker_profiles', column: 'user_id' },
  { table: 'profiles', column: 'id' },
  { table: 'profiles', column: 'user_id' },
  { table: 'blogs', column: 'author_id' },
];

function isIgnorableDeleteError(message: string): boolean {
  return (
    /relation .* does not exist/i.test(message) ||
    /column .* does not exist/i.test(message) ||
    /Could not find the '.*' column/i.test(message)
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceRole) {
      return new Response(JSON.stringify({ error: 'Server misconfigured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(supabaseUrl, serviceRole);
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
      error: userError,
    } = await admin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid session' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Best-effort cleanup for user-owned rows before removing the auth user.
    for (const target of cleanupTargets) {
      const { error } = await admin.from(target.table).delete().eq(target.column, user.id);
      if (error && !isIgnorableDeleteError(error.message || '')) {
        // Continue anyway; the final auth deletion is the critical action.
      }
    }

    // Final fallback for main profile row.
    await admin.from('users').delete().eq('id', user.id);

    const { error: deleteAuthError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteAuthError) {
      return new Response(JSON.stringify({ error: deleteAuthError.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
