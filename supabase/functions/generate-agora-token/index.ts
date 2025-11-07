import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Proper Agora RTC Token Generation
class AccessToken {
  private appId: string;
  private appCertificate: string;
  private channelName: string;
  private uid: string;
  private validTimeInSeconds: number;

  constructor(appId: string, appCertificate: string, channelName: string, uid: string, validTimeInSeconds = 3600) {
    this.appId = appId;
    this.appCertificate = appCertificate;
    this.channelName = channelName;
    this.uid = uid;
    this.validTimeInSeconds = validTimeInSeconds;
  }

  private async hmacSign(key: string, message: string): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const messageData = encoder.encode(message);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    return new Uint8Array(signature);
  }

  private packUint16(num: number): Uint8Array {
    return new Uint8Array([num & 0xff, (num >> 8) & 0xff]);
  }

  private packUint32(num: number): Uint8Array {
    return new Uint8Array([
      num & 0xff,
      (num >> 8) & 0xff,
      (num >> 16) & 0xff,
      (num >> 24) & 0xff
    ]);
  }

  private packString(str: string): Uint8Array {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const length = this.packUint16(data.length);
    const result = new Uint8Array(length.length + data.length);
    result.set(length, 0);
    result.set(data, length.length);
    return result;
  }

  async build(): Promise<string> {
    const version = '007';
    const now = Math.floor(Date.now() / 1000);
    const expire = now + this.validTimeInSeconds;

    // Build message
    const salt = Math.floor(Math.random() * 100000000);
    
    // Pack the message parts
    const parts = [
      this.packUint32(salt),
      this.packUint32(now),
      this.packUint32(expire),
      this.packString(this.channelName),
      this.packString(this.uid)
    ];

    // Concatenate all parts
    const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
    const message = new Uint8Array(totalLength);
    let offset = 0;
    for (const part of parts) {
      message.set(part, offset);
      offset += part.length;
    }

    // Sign the message
    const signature = await this.hmacSign(this.appCertificate, new TextDecoder().decode(message));

    // Build the final token
    const tokenParts = [
      signature,
      message
    ];

    const tokenLength = tokenParts.reduce((sum, part) => sum + part.length, 0);
    const token = new Uint8Array(tokenLength);
    let tokenOffset = 0;
    for (const part of tokenParts) {
      token.set(part, tokenOffset);
      tokenOffset += part.length;
    }

    // Convert to base64
    let binary = '';
    const bytes = new Uint8Array(token);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const base64Token = btoa(binary);

    return version + this.appId + base64Token;
  }
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

    // Use user ID hash as UID (must be string for Agora)
    const uid = Math.abs(Array.from(user.id).reduce((acc, char) => {
      return ((acc << 5) - acc + char.charCodeAt(0)) | 0;
    }, 0)).toString();

    console.log(`Generating token for channel: ${channelName}, uid: ${uid}, role: ${role}`);

    const tokenGenerator = new AccessToken(appId, appCertificate, channelName, uid, 3600);
    const token = await tokenGenerator.build();

    console.log(`Token generated successfully for channel: ${channelName}`);

    return new Response(
      JSON.stringify({
        token,
        appId,
        channelName,
        uid: parseInt(uid)
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
