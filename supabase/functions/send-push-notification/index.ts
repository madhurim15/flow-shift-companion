import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface PushNotificationRequest {
  token?: string;
  tokens?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  userId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, tokens, title, body, data, userId }: PushNotificationRequest = await req.json();
    
    // Get FCM server key from environment
    const fcmServerKey = Deno.env.get('FCM_SERVER_KEY');
    if (!fcmServerKey) {
      console.error('FCM_SERVER_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'FCM not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine target tokens
    let targetTokens: string[] = [];
    
    if (token) {
      targetTokens = [token];
    } else if (tokens) {
      targetTokens = tokens;
    } else if (userId) {
      // Fetch user's FCM tokens from database
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.49.10');
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      const { data: tokenRecords, error } = await supabase
        .from('fcm_tokens')
        .select('token')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user FCM tokens:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user tokens' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      targetTokens = tokenRecords?.map(record => record.token) || [];
    }

    if (targetTokens.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No tokens provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all tokens
    const results = await Promise.all(
      targetTokens.map(async (fcmToken) => {
        const notification = {
          to: fcmToken,
          notification: {
            title,
            body,
            icon: '/favicon.ico',
            click_action: 'FLUTTER_NOTIFICATION_CLICK'
          },
          data: data || {}
        };

        try {
          const response = await fetch('https://fcm.googleapis.com/fcm/send', {
            method: 'POST',
            headers: {
              'Authorization': `key=${fcmServerKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(notification),
          });

          const result = await response.json();
          console.log('FCM response for token', fcmToken.substring(0, 10) + '...:', result);
          
          return {
            token: fcmToken.substring(0, 10) + '...',
            success: response.ok,
            result
          };
        } catch (error) {
          console.error('Error sending to token', fcmToken.substring(0, 10) + '...:', error);
          return {
            token: fcmToken.substring(0, 10) + '...',
            success: false,
            error: error.message
          };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.length - successCount;

    console.log(`Push notification results: ${successCount} success, ${failureCount} failures`);

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        failed: failureCount,
        results
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});