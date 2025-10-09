// LiveKit token generation - HTTP handler
// Business logic is in logic.ts for testability
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { generateLiveKitToken, LiveKitError } from './logic.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    let user_email = 'anonymous';
    let room_name = undefined;

    try {
      const body = await req.json();
      user_email = body.user_email || 'anonymous';
      room_name = body.room_name;
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
    const result = await generateLiveKitToken({ user_email, room_name });

    // Return response
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in livekit-token function:', error);

    // Handle business logic errors
    if (error instanceof LiveKitError) {
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
