import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Using official Agora token generation via agora-access-token library (loaded dynamically below)
// Previous custom token builder removed to ensure compatibility with Agora SDK

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
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const body = await req.json();
    const channelName = body?.channelName?.toString();
    const roleNum = Number(body?.role) || 1;

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    const appId = (Deno.env.get('AGORA_APP_ID') || '').trim();
    const appCertificate = (Deno.env.get('AGORA_APP_CERTIFICATE') || '').trim();

    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    // Generate unique UID per session (user ID hash + timestamp modulo)
    const userIdHash = Math.abs(
      Array.from(user.id).reduce((acc, ch) => {
        return ((acc << 5) - acc + ch.charCodeAt(0)) | 0;
      }, 0)
    );
    const timeComponent = Date.now() % 100000;
    const uid = (userIdHash + timeComponent) % 2147483647; // Max uint32 / 2

    console.log(`Generating Agora token for channel="${channelName}" uid=${uid} role=${roleNum}`);

    // Load official token builder and generate token
    const { RtcTokenBuilder, RtcRole } = await import('https://esm.sh/agora-access-token@2.0.2');
    const roleEnum = roleNum === 1 ? RtcRole.PUBLISHER : RtcRole.SUBSCRIBER;
    const expireSeconds = 3600;
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid,
      roleEnum,
      expireSeconds
    );

    console.log(`Token generated successfully. Length: ${token.length}`);

    return new Response(
      JSON.stringify({
        token,
        appId,
        channelName,
        uid
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error generating Agora token:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
