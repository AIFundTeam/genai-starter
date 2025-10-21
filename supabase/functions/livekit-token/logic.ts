// LiveKit token generation logic
import { create, getNumericDate } from "https://deno.land/x/djwt@v3.0.2/mod.ts";

export interface TokenRequest {
  user_email: string;
  room_name?: string;
}

export interface TokenResponse {
  token: string;
  url: string;
  room_name: string;
}

export class LiveKitError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "LiveKitError";
  }
}

/**
 * Generate LiveKit access token for a user
 */
export async function generateLiveKitToken(
  request: TokenRequest
): Promise<TokenResponse> {
  const { user_email, room_name } = request;

  // Get LiveKit configuration from environment
  const livekitUrl = Deno.env.get("LIVEKIT_URL");
  const livekitApiKey = Deno.env.get("LIVEKIT_API_KEY");
  const livekitApiSecret = Deno.env.get("LIVEKIT_API_SECRET");

  // Check if LiveKit is configured
  if (!livekitUrl || !livekitApiKey || !livekitApiSecret) {
    throw new LiveKitError(
      "LiveKit is not configured. Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET.",
      "LIVEKIT_NOT_CONFIGURED",
      501
    );
  }

  // Get project name for agent dispatch
  const projectName = Deno.env.get("PROJECT_NAME") || "genai-starter";
  const agentName = `${projectName}-voice`;

  // Generate room name if not provided
  const finalRoomName = room_name || `room-${Date.now()}`;

  // Create JWT payload with agent dispatch
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: livekitApiKey,
    sub: user_email,
    nbf: now,
    exp: now + 6 * 60 * 60, // 6 hours
    video: {
      room: finalRoomName,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    },
    roomConfig: {
      // Dispatch the project-specific agent when participant joins
      agents: [
        {
          agentName: agentName
        }
      ]
    },
  };

  // Sign the token
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(livekitApiSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const token = await create({ alg: "HS256", typ: "JWT" }, payload, key);

  return {
    token,
    url: livekitUrl,
    room_name: finalRoomName,
  };
}
