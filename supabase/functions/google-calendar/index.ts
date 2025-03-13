
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLIENT_ID = "544470972050-idagauarls9tpb8ae2gngoa2c05q7onn.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
// Important: Correctly URL encode the redirect URI
const REDIRECT_URI = encodeURIComponent('http://localhost:5173/auth/callback');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code } = await req.json();
    console.log(`Received request with action: ${action}, code: ${code ? 'present' : 'not present'}`);

    if (action === 'getAuthUrl') {
      // Properly construct the auth URL - notice REDIRECT_URI is already encoded above
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=http://localhost:5173/auth/callback&` +
        `response_type=code&` +
        `scope=https://www.googleapis.com/auth/calendar.events&` +
        `access_type=offline&` +
        `prompt=consent`;

      console.log(`Generated auth URL: ${authUrl}`);
      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getToken' && code) {
      console.log(`Attempting to exchange code for token...`);
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: 'http://localhost:5173/auth/callback', // Must match exactly what was used in the auth URL
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
      console.log('Token response status:', tokenResponse.status);
      console.log('Token response:', tokenData);
      
      if (tokenData.error) {
        console.error('Error in token response:', tokenData);
        return new Response(JSON.stringify(tokenData), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      return new Response(JSON.stringify(tokenData), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
