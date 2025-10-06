// Business logic for test-llm function
// Separated from HTTP handling for easier testing

export interface TestLLMInput {
  prompt: string;
  user_email: string;
}

export interface TestLLMResult {
  success: boolean;
  response: string;
  user: string;
  timestamp: string;
}

export class LLMError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'LLMError';
  }
}

/**
 * Call OpenAI GPT-5 with a prompt
 * Pure business logic that can be unit tested
 */
export async function callLLM(input: TestLLMInput): Promise<TestLLMResult> {
  const prompt = input.prompt || 'Hello';
  const user_email = input.user_email || 'anonymous';

  // Check for OpenAI API key
  const openaiApiKey = Deno.env.get("OPENAI_API_KEY");
  if (!openaiApiKey) {
    throw new LLMError(
      "OpenAI API key not configured. Please set OPENAI_API_KEY in your Supabase Edge Function secrets",
      "MISSING_API_KEY",
      500
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
    throw new LLMError(
      "Check your OpenAI API key and billing status",
      "OPENAI_API_ERROR",
      openaiResponse.status
    );
  }

  const data = await openaiResponse.json();

  // Parse responses API format
  const response = parseOpenAIResponse(data);

  // Return result
  return {
    success: true,
    response,
    user: user_email,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Parse OpenAI Responses API response format
 * Helper function that can be tested independently
 */
function parseOpenAIResponse(data: any): string {
  // Try the output_text helper first (if available)
  if (data.output_text) {
    return data.output_text;
  }

  // Try the documented format: output[0] is message type, content[0] is output_text type
  if (data.output && data.output.length > 0) {
    const messageOutput = data.output.find((item: any) => item.type === 'message');
    if (messageOutput && messageOutput.content && messageOutput.content.length > 0) {
      const textContent = messageOutput.content.find((content: any) => content.type === 'output_text');
      if (textContent) {
        return textContent.text;
      }
    }
  }

  return "No text response found";
}
