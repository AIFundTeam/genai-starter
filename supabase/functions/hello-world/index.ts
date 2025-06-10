// Public edge function example - no authentication required
import { corsHeaders, handleCors } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { name = 'World' } = await req.json();
    
    // Example processing
    const message = `Hello, ${name}!`;
    const timestamp = new Date().toISOString();
    
    // Return response
    return new Response(
      JSON.stringify({
        message,
        timestamp,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in hello-world function:', error);
    
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