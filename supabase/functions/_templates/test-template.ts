// Test template for Edge Functions
// Copy this template when creating tests for new functions
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  testFunction,
  assertValidResponse,
  testCorsPrefligh,
  assertValidCors,
  TEST_USER_EMAIL,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("your-function-name");

Deno.test("your-function-name: successful call with valid input", async () => {
  const response = await testFunction(FUNCTION_URL, {
    user_email: TEST_USER_EMAIL,
    // Add your test data here
  });

  assertValidResponse(response, 200);

  const data = await response.json();

  // Validate response structure
  assertEquals(data.success, true);
  // Add more assertions based on your response structure
  // assertExists(data.your_field);

  console.log("✅ Result:", data);
});

Deno.test("your-function-name: handles CORS preflight request", async () => {
  const response = await testCorsPrefligh(FUNCTION_URL);

  assertValidResponse(response, 200, false); // CORS preflight doesn't return JSON
  assertValidCors(response);
});
