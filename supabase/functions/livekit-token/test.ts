// LiveKit token generation tests
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  testFunction,
  assertValidResponse,
  testCorsPreflight,
  assertValidCors,
  TEST_USER_EMAIL,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("livekit-token");

Deno.test("livekit-token: successful token generation with valid input", async () => {
  const response = await testFunction(FUNCTION_URL, {
    user_email: TEST_USER_EMAIL,
  });

  // Check response status
  if (response.status === 501) {
    console.log("⚠️  LiveKit not configured - this is expected if LIVEKIT_* env vars are not set");
    const data = await response.json();
    assertEquals(data.code, "LIVEKIT_NOT_CONFIGURED");
    console.log("✅ Properly returns 501 when not configured");
    return;
  }

  assertValidResponse(response, 200);
  const data = await response.json();

  // Validate response structure
  assertExists(data.token, "Should return token");
  assertExists(data.url, "Should return LiveKit URL");
  assertExists(data.room_name, "Should return room name");

  console.log("✅ Token generated successfully");
  console.log("  • URL:", data.url);
  console.log("  • Room:", data.room_name);
});

Deno.test("livekit-token: handles custom room name", async () => {
  const customRoom = "test-room-123";
  const response = await testFunction(FUNCTION_URL, {
    user_email: TEST_USER_EMAIL,
    room_name: customRoom,
  });

  // Check response status
  if (response.status === 501) {
    console.log("⚠️  LiveKit not configured - skipping test");
    return;
  }

  assertValidResponse(response, 200);
  const data = await response.json();

  assertEquals(data.room_name, customRoom, "Should use custom room name");
  console.log("✅ Custom room name handled correctly");
});

Deno.test("livekit-token: handles CORS preflight", async () => {
  const response = await testCorsPreflight(FUNCTION_URL);
  assertValidResponse(response, 200, false); // CORS doesn't return JSON
  assertValidCors(response);
});
