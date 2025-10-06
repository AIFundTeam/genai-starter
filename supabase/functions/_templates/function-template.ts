// Edge Function Template - HTTP Handler
// Copy this template when creating new functions
// This file handles HTTP requests and delegates to business logic
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { processRequest, BusinessError } from './logic.ts';

// Type definitions for HTTP layer
interface RequestBody {
  user_email: string;
  // Add your request properties here
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Parse request body
    const body: RequestBody = await req.json();

    // 2. Call business logic (separate, testable function)
    const result = await processRequest(body);

    // 3. Return success response
    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function error:', error);

    // Handle business logic errors
    if (error instanceof BusinessError) {
      return new Response(
        JSON.stringify({
          error: error.message,
          code: error.code,
          success: false,
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
        success: false,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
