import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agora token generation using HMAC
async function generateAgoraToken(
  appId: string,
  appCertificate: string,
  channelName: string,
  uid: number,
  role: number, // 1 = publisher, 2 = subscriber
  privilegeExpireTime: number = 3600
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = now + privilegeExpireTime;
  
  const message = `${appId}${channelName}${uid}${privilegeExpiredTs}`;
  
  const encoder = new TextEncoder();
  const keyData = encoder.encode(appCertificate);
  const messageData = encoder.encode(message);
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Build token string
  const tokenContent = JSON.stringify({
    appId,
    channelName,
    uid: uid.toString(),
    role,
    privilegeExpiredTs,
    signature: signatureHex
  });
  
  return btoa(tokenContent);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
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

    const { channelName, role = 1 } = await req.json();

    if (!channelName) {
      throw new Error('Channel name is required');
    }

    const appId = Deno.env.get('AGORA_APP_ID');
    const appCertificate = Deno.env.get('AGORA_APP_CERTIFICATE');

    if (!appId || !appCertificate) {
      throw new Error('Agora credentials not configured');
    }

    // Use user ID hash as UID (must be numeric)
    const uid = Math.abs(Array.from(user.id).reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0));

    console.log(`Generating token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    const token = await generateAgoraToken(
      appId,
      appCertificate,
      channelName,
      uid,
      role,
      3600 // 1 hour expiry
    );

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
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
