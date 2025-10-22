// Increment counter tests
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  testFunction,
  assertValidResponse,
  testCorsPreflight,
  assertValidCors,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("increment-counter");

Deno.test("increment-counter: increments counter", async () => {
  const response = await testFunction(FUNCTION_URL, {});

  assertValidResponse(response, 200);
  const data = await response.json();

  // Validate response structure
  assertExists(data.count, "Should return count");
  assertExists(data.timestamp, "Should return timestamp");

  console.log("✅ Counter incremented to:", data.count);
});

Deno.test("increment-counter: handles CORS preflight", async () => {
  const response = await testCorsPreflight(FUNCTION_URL);
  assertValidResponse(response, 200, false);
  assertValidCors(response);
});
