import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';
// Use Agora official token builder via ESM for Deno
import { RtcTokenBuilder, RtcRole } from 'https://esm.sh/agora-access-token@2.0.5';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Auth required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: { user } } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const channelName: string | undefined = body?.channelName?.toString();
    const roleNum: number = Number(body?.role) === 2 ? 2 : 1; // 1 publisher, 2 subscriber

    if (!channelName) {
      return new Response(JSON.stringify({ error: 'Channel name is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const appId = (Deno.env.get('AGORA_APP_ID') || '').trim();
    const appCertificate = (Deno.env.get('AGORA_APP_CERTIFICATE') || '').trim();

    if (!appId || !appCertificate) {
      return new Response(JSON.stringify({ error: 'Agora credentials not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // Stable numeric uid derived from user.id
    const uid = Math.abs(Array.from(user.id).reduce((acc, ch) => ((acc << 5) - acc + ch.charCodeAt(0)) | 0, 0));

    const expireSeconds = 3600;
    const role = roleNum === 2 ? RtcRole.SUBSCRIBER : RtcRole.PUBLISHER;

    console.log(`Generating Agora RTC token | channel=${channelName} uid=${uid} role=${roleNum}`);

    // Build RTC token with uid and publish privileges
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      expireSeconds
    );

    return new Response(JSON.stringify({ token, appId, channelName, uid }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return new Response(JSON.stringify({ error: error?.message || 'Unknown error' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
