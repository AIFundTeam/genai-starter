// Test LLM integration - no authentication required
import { corsHeaders, handleCors } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  // Handle CORS preflight
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Parse request body
    const { prompt = 'Hello', user_email = 'anonymous' } = await req.json();
    
    
    // Check for OpenAI API key
    const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiApiKey) {
      console.log('OpenAI API key not found');
      return new Response(
        JSON.stringify({
          error: "OpenAI API key not configured",
          message: "Please set OPENAI_API_KEY in your Supabase Edge Function secrets",
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      );
    }

    console.log(`Calling OpenAI for user: ${user_email}, prompt: ${prompt}`);

    // Call OpenAI API
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant testing the full-stack template setup.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return new Response(
        JSON.stringify({
          error: "OpenAI API error",
          details: error,
          message: "Check your OpenAI API key and billing status",
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: openaiResponse.status,
        }
      );
    }

    const data = await openaiResponse.json();
    const response = data.choices[0].message.content;

    // Return response
    return new Response(
      JSON.stringify({
        success: true,
        response,
        user: user_email,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error('Error in test-llm function:', error);
    
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