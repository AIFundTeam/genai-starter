# LiveKit Voice Agent

This directory contains the Python voice agent for the genai-starter template.

## Features

- Voice interaction using LiveKit Inference (STT/LLM/TTS)
- Custom tool to call backend edge functions
- Demonstrates agent-to-backend authentication

## Setup

1. **Install Dependencies**
   ```bash
   cd livekit-agent
   pip install -r requirements.txt
   ```

2. **Configure Environment**

   The agent needs these environment variables:
   - `LIVEKIT_URL` - Your LiveKit server URL
   - `LIVEKIT_API_KEY` - Your LiveKit API key
   - `LIVEKIT_API_SECRET` - Your LiveKit API secret
   - `BACKEND_URL` - Your Supabase functions URL (e.g., https://xxx.supabase.co/functions/v1)
   - `LIVEKIT_AGENT_SECRET` - Shared secret for agent-to-backend auth

3. **Test Locally**
   ```bash
   python agent.py dev
   ```

4. **Deploy to LiveKit Cloud**
   ```bash
   # From project root:
   ./deploy_livekit.sh

   # Or manually from this directory:
   lk agent deploy --secrets-file .env.secrets
   ```

   The deploy_livekit.sh script automatically handles subdomain sync and secrets file generation.

## Configuration

### Environment Variables for LiveKit Cloud

When deploying to LiveKit Cloud, set these environment variables:

```bash
lk agent set-env BACKEND_URL "https://your-project.supabase.co/functions/v1"
lk agent set-env LIVEKIT_AGENT_SECRET "your-secret-here"
```

### Testing the Agent

1. **From Terminal**: `python agent.py dev` and follow the connection URL
2. **From Browser**: Connect using the frontend voice interface
3. **Test Backend Call**: Say "Can you call the backend LLM and say hello?"

## How It Works

1. User speaks in browser
2. Agent receives audio via WebRTC
3. LiveKit Inference converts speech to text
4. LLM processes the request
5. If needed, agent calls backend edge functions with shared secret
6. LLM response converted to speech
7. Audio streamed back to user

## Troubleshooting

- **"Backend function calls are not configured"**: Set BACKEND_URL and LIVEKIT_AGENT_SECRET
- **Authentication errors**: Check that LIVEKIT_AGENT_SECRET matches in both agent and backend
- **Connection issues**: Verify LIVEKIT_URL, API_KEY, and API_SECRET are correct
