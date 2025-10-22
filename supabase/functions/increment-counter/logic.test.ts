// Increment counter logic tests
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { incrementCounter, CounterError } from "./logic.ts";

Deno.test({
  name: "incrementCounter: requires database to be set up",
  sanitizeResources: false,
  sanitizeOps: false,
  async fn() {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseKey) {
      console.log("⚠️  Supabase not configured - skipping test");
      return;
    }

    try {
      const result = await incrementCounter();

      assertExists(result.count);
      assertExists(result.timestamp);
      assertEquals(typeof result.count, "number");

      console.log("✅ Counter increment successful:", result.count);
    } catch (error) {
      if (error instanceof CounterError && error.code === "COUNTER_NOT_FOUND") {
        console.log("⚠️  Counter table not initialized - run ./setup_database.sh");
      } else {
        throw error;
      }
    }
  }
});
