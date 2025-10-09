// Test LLM integration - HTTP handler
// Business logic is in logic.ts for testability
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { callLLM, LLMError } from './logic.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    let prompt = 'Hello';
    let user_email = 'anonymous';

    try {
      const body = await req.json();
      prompt = body.prompt || 'Hello';
      user_email = body.user_email || 'anonymous';
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError);
      return new Response(
        JSON.stringify({
          error: "Invalid JSON in request body",
          message: jsonError.message,
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }

    // Call business logic
    const result = await callLLM({ prompt, user_email });

    // Return response
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in test-llm function:', error);

    // Handle business logic errors
    if (error instanceof LLMError) {
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