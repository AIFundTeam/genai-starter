// Edge Function Template
// Copy this template when creating new functions
import { corsHeaders, handleCors } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// Type definitions for better developer experience
interface RequestBody {
  user_email: string;
  // Add your request properties here
}

interface ResponseData {
  success: boolean;
  // Add your response properties here
}

// Structured error class for better error handling
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'AppError';
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // 1. Parse and validate request body
    const body: RequestBody = await req.json();

    if (!body.user_email) {
      throw new AppError('user_email is required', 400);
    }

    // 2. Initialize Supabase client (choose one based on your needs)

    // Option A: Anonymous client (for public operations)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    // Option B: Admin client (bypasses RLS, use with caution)
    // const supabase = createClient(
    //   Deno.env.get('SUPABASE_URL')!,
    //   Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // );

    // 3. Your business logic here

    // Example: Query database
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('user_email', body.user_email);

    if (error) {
      throw new AppError(`Database error: ${error.message}`, 500);
    }

    // Example: Call external API
    // const apiKey = Deno.env.get('YOUR_API_KEY');
    // const apiResponse = await fetch('https://api.example.com/endpoint', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${apiKey}` },
    //   body: JSON.stringify({ /* data */ })
    // });

    // 4. Return success response
    const responseData: ResponseData = {
      success: true,
      // Add your response data here
    };

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Function error:', error);

    // Handle structured errors
    if (error instanceof AppError) {
      return new Response(
        JSON.stringify({
          error: error.message,
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
