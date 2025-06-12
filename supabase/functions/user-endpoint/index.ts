// User-specific endpoint - no authentication required, just username
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders, handleCors } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Get user email from request body
    const { user_email } = await req.json();
    
    if (!user_email) {
      return new Response(
        JSON.stringify({ error: 'No user email provided' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Example: Fetch user's items
    const { data: items, error: itemsError } = await supabase
      .from('items')
      .select('*')
      .eq('user_email', user_email)
      .order('created_at', { ascending: false });

    if (itemsError) {
      throw itemsError;
    }

    // Get count of items
    const { count } = await supabase
      .from('items')
      .select('*', { count: 'exact', head: true })
      .eq('user_email', user_email);

    // Return successful response
    return new Response(
      JSON.stringify({
        message: 'User endpoint accessed successfully',
        user: user_email,
        itemCount: count || 0,
        recentItems: items?.slice(0, 5) || [], // Return last 5 items
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in user-endpoint function:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});