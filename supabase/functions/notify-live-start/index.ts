import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotifyLiveStartRequest {
  streamId: string;
  title: string;
  type: 'random' | 'circle';
  circleId?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { streamId, title, type, circleId }: NotifyLiveStartRequest = await req.json();

    console.log('Sending live start notifications:', { streamId, title, type, circleId });

    // Get stream creator info
    const { data: stream, error: streamError } = await supabase
      .from('live_streams')
      .select(`
        *,
        profiles:user_id (
          username,
          name
        )
      `)
      .eq('id', streamId)
      .maybeSingle();

    if (streamError) {
      console.error('Error fetching stream:', streamError);
      throw streamError;
    }

    if (!stream) {
      console.error('Stream not found for ID:', streamId);
      return new Response(
        JSON.stringify({ error: 'Stream not found', streamId }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    const streamerName = stream.profiles?.name || stream.profiles?.username || 'Someone';

    // Determine who to notify based on type
    let targetUserIds: string[] = [];

    if (type === 'circle' && circleId) {
      // Notify circle members
      const { data: members } = await supabase
        .from('circle_members')
        .select('user_id')
        .eq('circle_id', circleId)
        .eq('status', 'active')
        .neq('user_id', stream.user_id);

      targetUserIds = members?.map(m => m.user_id) || [];
    } else {
      // Notify followers for random live
      const { data: followers } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', stream.user_id);

      targetUserIds = followers?.map(f => f.follower_id) || [];
    }

    console.log(`Notifying ${targetUserIds.length} users`);

    // Create notifications
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      notification_type: 'live_start',
      title: `${streamerName} is live!`,
      body: title,
      data: {
        stream_id: streamId,
        type: type
      }
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('push_notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
      }
    }

    return new Response(
      JSON.stringify({ success: true, notified: notifications.length }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in notify-live-start:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
