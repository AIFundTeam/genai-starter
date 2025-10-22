// Unit tests for test-llm business logic
// These tests are fast because they don't make HTTP requests to the Edge Function
import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { callLLM, LLMError } from "./logic.ts";

// Note: These tests will make real OpenAI API calls
// Ensure OPENAI_API_KEY is set in your environment

Deno.test("callLLM: successfully calls OpenAI with valid input", async () => {
  const result = await callLLM({
    prompt: "What is 1+1? Answer with just the number.",
    user_email: "test@example.com",
  });

  assertEquals(result.success, true);
  assertExists(result.response);
  assertExists(result.timestamp);
  assertEquals(result.user, "test@example.com");
  assertEquals(typeof result.response, "string");
  assertEquals(result.response.length > 0, true);

  console.log("✅ LLM Response:", result.response);
});

Deno.test("callLLM: handles empty strings with default values", async () => {
  const result = await callLLM({
    prompt: "",
    user_email: "",
  });

  assertEquals(result.success, true);
  assertExists(result.response);
  assertEquals(result.user, "anonymous");
});

Deno.test("callLLM: throws LLMError if API key is missing", async () => {
  // Temporarily remove API key
  const originalKey = Deno.env.get("OPENAI_API_KEY");
  Deno.env.delete("OPENAI_API_KEY");

  try {
    await assertRejects(
      async () => {
        await callLLM({
          prompt: "test",
          user_email: "test@example.com",
        });
      },
      LLMError,
      "OpenAI API key not configured"
    );
  } finally {
    // Restore API key
    if (originalKey) {
      Deno.env.set("OPENAI_API_KEY", originalKey);
    }
  }
});
