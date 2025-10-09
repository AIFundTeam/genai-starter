// Increment counter tests
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  assertValidResponse,
  testCorsPreflight,
  assertValidCors,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("increment-counter");

Deno.test("increment-counter: requires authentication", async () => {
  // Call without auth header
  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  assertEquals(response.status, 401, "Should require authentication");
  const data = await response.json();
  assertEquals(data.error, "Unauthorized");
});

Deno.test("increment-counter: increments with valid auth", async () => {
  const agentSecret = Deno.env.get("LIVEKIT_AGENT_SECRET");

  if (!agentSecret) {
    console.log("⚠️  LIVEKIT_AGENT_SECRET not set - skipping test");
    return;
  }

  const response = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Agent-Secret': agentSecret,
    },
  });

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
