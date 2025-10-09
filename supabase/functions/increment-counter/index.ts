// Increment counter - HTTP handler
// Business logic is in logic.ts for testability
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { incrementCounter, CounterError } from './logic.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Call business logic
    const result = await incrementCounter();

    // Return response
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in increment-counter function:', error);

    // Handle business logic errors
    if (error instanceof CounterError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: error.statusCode,
        }
      );
    }

    // Handle unexpected errors
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
