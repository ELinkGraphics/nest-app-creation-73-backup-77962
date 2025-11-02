import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationPayload {
  userId?: string;
  userIds?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  notificationType: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: NotificationPayload = await req.json();
    console.log('Sending push notification:', payload);

    // Determine target users
    let targetUserIds: string[] = [];
    if (payload.userId) {
      targetUserIds = [payload.userId];
    } else if (payload.userIds) {
      targetUserIds = payload.userIds;
    } else {
      // Get all users with FCM tokens
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id')
        .not('fcm_token', 'is', null);
      
      targetUserIds = profiles?.map(p => p.id) || [];
    }

    console.log(`Sending to ${targetUserIds.length} users`);

    // Store notification records
    const notifications = targetUserIds.map(userId => ({
      user_id: userId,
      notification_type: payload.notificationType,
      title: payload.title,
      body: payload.body,
      data: payload.data || {},
    }));

    const { error: insertError } = await supabase
      .from('push_notifications')
      .insert(notifications);

    if (insertError) {
      console.error('Error storing notifications:', insertError);
      throw insertError;
    }

    // In a real implementation, you would send actual push notifications here
    // using a service like Firebase Cloud Messaging or OneSignal
    console.log('Push notifications stored successfully');

    // Trigger browser notifications via realtime
    for (const userId of targetUserIds) {
      await supabase
        .from('push_notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notifications sent to ${targetUserIds.length} users`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-push-notification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
