// Shared test utilities for Edge Functions
// Import these in your test files for DRY tests
import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";

/**
 * Base URL for function tests
 * Defaults to deployed Supabase functions, can override with TEST_FUNCTION_URL env var
 */
export function getFunctionUrl(functionName: string): string {
  const baseUrl = Deno.env.get("TEST_FUNCTION_URL");
  if (baseUrl) {
    // If TEST_FUNCTION_URL is set to a specific function, use it directly
    return baseUrl;
  }

  // Otherwise construct URL from project ref
  const projectRef = Deno.env.get("SUPABASE_PROJECT_REF");
  if (!projectRef) {
    throw new Error("SUPABASE_PROJECT_REF environment variable not set");
  }

  return `https://${projectRef}.supabase.co/functions/v1/${functionName}`;
}

/**
 * Make a POST request to an Edge Function
 */
export async function testFunction(
  functionUrl: string,
  body: Record<string, unknown>
): Promise<Response> {
  return await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

/**
 * Assert that a response has the expected status and content type
 */
export function assertValidResponse(
  response: Response,
  expectedStatus = 200,
  expectJson = true
): void {
  assertEquals(response.status, expectedStatus, `Expected status ${expectedStatus} but got ${response.status}`);

  if (expectJson) {
    const contentType = response.headers.get("content-type");
    assertEquals(
      contentType?.includes("application/json"),
      true,
      "Expected JSON content-type"
    );
  }
}

/**
 * Test CORS preflight request
 */
export async function testCorsPreflight(functionUrl: string): Promise<Response> {
  const response = await fetch(functionUrl, {
    method: "OPTIONS",
    headers: {
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  // Consume body to avoid leak
  await response.text();

  return response;
}

/**
 * Assert that CORS headers are present and valid
 */
export function assertValidCors(response: Response): void {
  const allowOrigin = response.headers.get("Access-Control-Allow-Origin");
  const allowMethods = response.headers.get("Access-Control-Allow-Methods");

  assertEquals(allowOrigin !== null, true, "CORS Allow-Origin header missing");
  assertEquals(allowMethods !== null, true, "CORS Allow-Methods header missing");
}

/**
 * Common test data
 */
export const TEST_USER_EMAIL = "test@example.com";
