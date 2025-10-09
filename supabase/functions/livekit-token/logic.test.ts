// LiveKit token generation logic tests
import { assertEquals, assertExists, assertRejects } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { generateLiveKitToken, LiveKitError } from "./logic.ts";

Deno.test("generateLiveKitToken: returns error when not configured", async () => {
  // Save original env vars
  const originalUrl = Deno.env.get("LIVEKIT_URL");
  const originalKey = Deno.env.get("LIVEKIT_API_KEY");
  const originalSecret = Deno.env.get("LIVEKIT_API_SECRET");

  // Clear env vars
  Deno.env.delete("LIVEKIT_URL");
  Deno.env.delete("LIVEKIT_API_KEY");
  Deno.env.delete("LIVEKIT_API_SECRET");

  // Test
  await assertRejects(
    async () => {
      await generateLiveKitToken({ user_email: "test@example.com" });
    },
    LiveKitError,
    "LiveKit is not configured"
  );

  // Restore env vars
  if (originalUrl) Deno.env.set("LIVEKIT_URL", originalUrl);
  if (originalKey) Deno.env.set("LIVEKIT_API_KEY", originalKey);
  if (originalSecret) Deno.env.set("LIVEKIT_API_SECRET", originalSecret);

  console.log("✅ Properly handles missing configuration");
});

Deno.test("generateLiveKitToken: generates room name if not provided", async () => {
  // This test will only run if LiveKit is configured
  const hasConfig = Deno.env.get("LIVEKIT_URL") &&
                     Deno.env.get("LIVEKIT_API_KEY") &&
                     Deno.env.get("LIVEKIT_API_SECRET");

  if (!hasConfig) {
    console.log("⚠️  Skipping test - LiveKit not configured");
    return;
  }

  const result = await generateLiveKitToken({ user_email: "test@example.com" });

  assertExists(result.room_name);
  assertEquals(result.room_name.startsWith("room-"), true);
  console.log("✅ Auto-generates room name");
});
