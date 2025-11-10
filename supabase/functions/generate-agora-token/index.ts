import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Agora Token Builder using Deno Web Crypto API
// Compatible with Agora RTC SDK v4.x token format (version 007)
class AgoraTokenBuilder {
  private VERSION = '007';
  
  private packUint16(value: number): Uint8Array {
    const buffer = new Uint8Array(2);
    buffer[0] = value & 0xff;
    buffer[1] = (value >> 8) & 0xff;
    return buffer;
  }

  private packUint32(value: number): Uint8Array {
    const buffer = new Uint8Array(4);
    buffer[0] = value & 0xff;
    buffer[1] = (value >> 8) & 0xff;
    buffer[2] = (value >> 16) & 0xff;
    buffer[3] = (value >> 24) & 0xff;
    return buffer;
  }

  private packString(str: string): Uint8Array {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(str);
    const length = this.packUint16(bytes.length);
    return this.concatArrays([length, bytes]);
  }

  private concatArrays(arrays: Uint8Array[]): Uint8Array {
    const totalLength = arrays.reduce((sum, arr) => sum + arr.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const arr of arrays) {
      result.set(arr, offset);
      offset += arr.length;
    }
    return result;
  }

  private async hmacSign(key: string, message: Uint8Array): Promise<Uint8Array> {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Uint8Array is a valid BufferSource (ArrayBufferView)
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, message as BufferSource);
    return new Uint8Array(signature);
  }

  private base64Encode(data: Uint8Array): string {
    const binString = Array.from(data, (byte) => String.fromCharCode(byte)).join('');
    return btoa(binString);
  }

  async buildToken(
    appId: string,
    appCertificate: string,
    channelName: string,
    uid: number,
    role: number,
    expireSeconds: number = 3600
  ): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    const salt = Math.floor(Math.random() * 100000000);
    const expireTimestamp = now + expireSeconds;

    // Build message: salt + timestamp + expire + channelName + uid
    const message = this.concatArrays([
      this.packUint32(salt),
      this.packUint32(now),
      this.packUint32(expireTimestamp),
      this.packString(channelName),
      this.packUint32(uid)
    ]);

    // Sign with app certificate
    const signature = await this.hmacSign(appCertificate, message);

    // Combine signature + message and encode
    const content = this.concatArrays([signature, message]);
    const base64Content = this.base64Encode(content);

    // Return: version + appId + base64Content
    return `${this.VERSION}${appId}${base64Content}`;
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

    // Use custom token builder with Web Crypto API
    const tokenBuilder = new AgoraTokenBuilder();
    const token = await tokenBuilder.buildToken(
      appId,
      appCertificate,
      channelName,
      uid,
      roleNum,
      3600
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
