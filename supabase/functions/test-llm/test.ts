// Unit tests for test-llm Edge Function
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  testFunction,
  assertValidResponse,
  testCorsPreflight,
  assertValidCors,
  TEST_USER_EMAIL,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("test-llm");

Deno.test("test-llm: successful LLM call with valid prompt", async () => {
  const response = await testFunction(FUNCTION_URL, {
    prompt: "What is 2+2? Answer with just the number.",
    user_email: TEST_USER_EMAIL,
  });

  assertValidResponse(response, 200);

  const data = await response.json();

  // Check response structure
  assertEquals(data.success, true);
  assertExists(data.response);
  assertExists(data.user);
  assertExists(data.timestamp);

  // Check user email is returned
  assertEquals(data.user, TEST_USER_EMAIL);

  // Check that response contains actual content (not empty)
  assertEquals(typeof data.response, "string");
  assertEquals(data.response.length > 0, true);

  console.log("✅ LLM Response:", data.response);
});

Deno.test("test-llm: handles missing prompt with default", async () => {
  const response = await testFunction(FUNCTION_URL, {
    user_email: TEST_USER_EMAIL,
  });

  assertValidResponse(response, 200);

  const data = await response.json();
  assertEquals(data.success, true);
  assertExists(data.response);
});

Deno.test("test-llm: handles CORS preflight request", async () => {
  const response = await testCorsPreflight(FUNCTION_URL);

  assertValidResponse(response, 200, false); // CORS preflight doesn't return JSON
  assertValidCors(response);
});
