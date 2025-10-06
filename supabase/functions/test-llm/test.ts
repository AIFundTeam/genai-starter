// Unit tests for test-llm Edge Function
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";

const FUNCTION_URL = Deno.env.get("TEST_FUNCTION_URL") || "http://localhost:54321/functions/v1/test-llm";

Deno.test("test-llm: successful LLM call with valid prompt", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: "What is 2+2? Answer with just the number.",
      user_email: "test@example.com",
    }),
  });

  assertEquals(response.status, 200);

  const data = await response.json();

  // Check response structure
  assertEquals(data.success, true);
  assertExists(data.response);
  assertExists(data.user);
  assertExists(data.timestamp);

  // Check user email is returned
  assertEquals(data.user, "test@example.com");

  // Check that response contains actual content (not empty)
  assertEquals(typeof data.response, "string");
  assertEquals(data.response.length > 0, true);

  console.log("✅ LLM Response:", data.response);
});

Deno.test("test-llm: handles missing prompt with default", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_email: "test@example.com",
    }),
  });

  assertEquals(response.status, 200);

  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.response);
});

Deno.test("test-llm: handles CORS preflight request", async () => {
  const response = await fetch(FUNCTION_URL, {
    method: "OPTIONS",
    headers: {
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  // Consume the response body to avoid leak detection
  await response.text();

  assertEquals(response.status, 200);

  // Check CORS headers are present
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  const allowMethods = response.headers.get("Access-Control-Allow-Methods");

  assertExists(allowOrigin);
  assertExists(allowMethods);
});
