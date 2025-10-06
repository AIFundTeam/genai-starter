// Test LLM integration - no authentication required
import { corsHeaders, handleCors } from '../_shared/cors.ts';

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

    // Call OpenAI Responses API
    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-5",
        input: `You are a helpful assistant testing the full-stack template setup. ${prompt}`,
        reasoning: {
          effort: "minimal"
        }
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

    // Parse responses API format
    let response = "";

    // Try the output_text helper first (if available)
    if (data.output_text) {
      response = data.output_text;
    }
    // Try the documented format: output[0] is message type, content[0] is output_text type
    else if (data.output && data.output.length > 0) {
      const messageOutput = data.output.find(item => item.type === 'message');
      if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
        const textContent = messageOutput.content.find(content => content.type === 'output_text');
        if (textContent) {
          response = textContent.text;
        }
      }
    }

    if (!response) {
      response = "No text response found";
    }

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