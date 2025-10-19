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

// Cache for access tokens to avoid generating new ones on every request
let cachedAccessToken: string | null = null;
let tokenExpiresAt: number = 0;

// Generate JWT for Google OAuth
async function generateJWT(serviceAccount: any): Promise<string> {
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600 // 1 hour
  };

  const headerBase64 = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const payloadBase64 = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  
  const message = `${headerBase64}.${payloadBase64}`;
  
  // Import the private key and sign
  const privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  
  // Convert PEM to der format for Web Crypto API
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKey.replace(pemHeader, '').replace(pemFooter, '').replace(/\s/g, '');
  
  // Convert base64 to binary
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  try {
    const key = await crypto.subtle.importKey(
      'pkcs8',
      binaryDer,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      key,
      new TextEncoder().encode(message)
    );
    
    const signatureBase64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    
    return `${message}.${signatureBase64}`;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error(`Failed to generate JWT: ${(error as Error).message}`);
  }
}

// Get Google OAuth access token
async function getAccessToken(serviceAccount: any): Promise<string> {
  // Return cached token if still valid
  if (cachedAccessToken && Date.now() < tokenExpiresAt) {
    return cachedAccessToken;
  }

  try {
    const jwt = await generateJWT(serviceAccount);
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: jwt,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${error}`);
    }

    const tokenData = await response.json();
    cachedAccessToken = tokenData.access_token;
    tokenExpiresAt = Date.now() + (tokenData.expires_in * 1000) - 60000; // Subtract 1 minute for safety
    
    return cachedAccessToken as string;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, tokens, title, body, data, userId }: PushNotificationRequest = await req.json();
    
    // Get Firebase service account from environment
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_JSON');
    if (!serviceAccountJson) {
      console.error('FIREBASE_SERVICE_ACCOUNT_JSON not configured');
      return new Response(
        JSON.stringify({ error: 'Firebase service account not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let serviceAccount;
    try {
      serviceAccount = JSON.parse(serviceAccountJson);
    } catch (error) {
      console.error('Invalid FIREBASE_SERVICE_ACCOUNT_JSON format:', error);
      return new Response(
        JSON.stringify({ error: 'Invalid service account JSON' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract project ID from service account
    const projectId = serviceAccount.project_id;
    if (!projectId) {
      console.error('Project ID not found in service account');
      return new Response(
        JSON.stringify({ error: 'Project ID not found in service account' }),
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

    // Get access token for FCM HTTP v1 API
    let accessToken;
    try {
      accessToken = await getAccessToken(serviceAccount);
    } catch (error) {
      console.error('Failed to get access token:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to authenticate with FCM' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send notifications to all tokens using FCM HTTP v1 API
    const results = await Promise.all(
      targetTokens.map(async (fcmToken) => {
        // Create FCM v1 message format
        const message = {
          message: {
            token: fcmToken,
            notification: {
              title,
              body,
            },
            data: data || {},
            android: {
              priority: 'high',
              notification: {
                icon: 'ic_notification',
                click_action: 'FLUTTER_NOTIFICATION_CLICK',
                priority: 'high',
                visibility: 'public',
                importance: 'high',
                channel_id: 'high_importance_channel'
              }
            },
            apns: {
              payload: {
                aps: {
                  category: 'FLUTTER_NOTIFICATION_CLICK'
                }
              }
            },
            webpush: {
              notification: {
                icon: '/favicon.ico',
              },
              fcm_options: {
                link: '/'
              }
            }
          }
        };

        try {
          const response = await fetch(`https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
          });

          const result = await response.json();
          console.log('FCM v1 response for token', fcmToken.substring(0, 10) + '...:', result);
          
          if (!response.ok) {
            console.error('FCM v1 error for token', fcmToken.substring(0, 10) + '...:', result);
          }
          
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
            error: (error as Error).message
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
      JSON.stringify({ error: (error as Error).message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});