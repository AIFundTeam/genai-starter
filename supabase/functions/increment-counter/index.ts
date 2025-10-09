// Increment counter - HTTP handler
// Business logic is in logic.ts for testability
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { incrementCounter, CounterError } from './logic.ts';

/**
 * Verify agent authentication using shared secret
 */
function verifyAgentAuth(req: Request): boolean {
  const agentSecret = req.headers.get('X-Agent-Secret');
  const expectedSecret = Deno.env.get('LIVEKIT_AGENT_SECRET');

  // If no secret configured, agent auth is disabled
  if (!expectedSecret) {
    return false;
  }

  return agentSecret === expectedSecret;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Check authentication (agent secret required for this function)
    const isAgentAuthenticated = verifyAgentAuth(req);

    if (!isAgentAuthenticated) {
      return new Response(
        JSON.stringify({
          error: 'Unauthorized',
          message: 'Agent authentication required',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      );
    }

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
