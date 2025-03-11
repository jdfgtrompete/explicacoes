
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const CLIENT_ID = "544470972050-idagauarls9tpb8ae2gngoa2c05q7onn.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = 'http://localhost:5173/auth/callback';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code } = await req.json();

    if (action === 'getAuthUrl') {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${CLIENT_ID}&` +
        `redirect_uri=${REDIRECT_URI}&` +
        `response_type=code&` +
        `scope=https://www.googleapis.com/auth/calendar.events&` +
        `access_type=offline`;

      return new Response(JSON.stringify({ url: authUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'getToken' && code) {
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          code,
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code',
        }),
      });

      const tokenData = await tokenResponse.json();
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
