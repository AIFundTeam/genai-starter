# Claude Code Full-Stack Starter

Build full-stack web apps fast with AI assistance. Optimized for [Claude Code](https://www.anthropic.com/claude-code) - includes OpenAI LLM integration, optional voice interface, and zero-config deployment.

**Stack**: Vanilla JS • Supabase (PostgreSQL + Edge Functions) • Cloudflare Pages • LiveKit Voice (optional)

## Prerequisites

- **[Claude Code](https://www.anthropic.com/claude-code)** + **[Deno](https://deno.land)** (required) - See [SETUP_MACOS.md](./SETUP_MACOS.md) or [SETUP_WINDOWS.md](./SETUP_WINDOWS.md) for installation
- [OpenAI Account](https://platform.openai.com) with API key (required)
- [Supabase Account](https://supabase.com) (free tier)
- [Cloudflare Account](https://cloudflare.com) (free tier)
- [LiveKit Cloud](https://cloud.livekit.io) (optional - for voice)

## Quick Start

### 1. Clone Template

```bash
# Use this template on GitHub, then:
git clone <your-repo-url>
cd <your-repo-name>
```

### 2. Create Accounts

- **Supabase**: [app.supabase.com](https://app.supabase.com) - Create project, save database password
- **Cloudflare**: [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) - Create account
- Get [Supabase access token](https://app.supabase.com/account/tokens) for deployments

### 3. Configure Environment

```bash
cp env.config.template env.config
# Edit env.config with your credentials
```

**Required credentials** (see `env.config.template` comments for where to find each):
- Supabase: `PROJECT_REF`, `ANON_KEY`, `SERVICE_ROLE_KEY`, `DB_PASSWORD`, `ACCESS_TOKEN`
- Cloudflare: `API_TOKEN` ([create here](https://dash.cloudflare.com/profile/api-tokens) with "Edit Cloudflare Workers" template), `PROJECT_NAME`
- OpenAI: `API_KEY` ([get here](https://platform.openai.com/api-keys))
- LiveKit (optional): `URL`, `API_KEY`, `API_SECRET`

### 4. Setup & Deploy

```bash
./setup_database.sh      # ⚠️ WARNING: Drops and recreates tables (deletes all data)
./deploy_backend.sh      # Deploys Edge Functions
./deploy_frontend.sh     # Deploys to Cloudflare Pages
```

### 5. Test

Visit your Cloudflare Pages URL and run the built-in tests. If anything fails, ask Claude Code to help debug.

## ⚠️ Security Warning

**This template is for prototyping only. NOT production-ready.**

All Edge Functions are publicly accessible (no auth). Anyone with your Supabase URL can drain your OpenAI credits or modify your database.

**Before production**: Enable [Supabase Auth](https://supabase.com/docs/guides/auth), remove `--no-verify-jwt` from `deploy_backend.sh`, and add proper authentication to your voice agent.

## Start Building with Claude Code

```bash
cd /path/to/your/project
claude
```

Tell Claude Code what you want to build:
- "I want to build a task management app"
- "Add a user profile system"
- "Create a real-time chat feature"

Claude Code handles the database, backend, frontend, and tests. After schema changes, run `./setup_database.sh` to apply them.

<details>
<summary><b>Voice Interface Setup</b> (Optional - click to expand)</summary>

Browser-based voice interaction powered by LiveKit agents. Includes STT, LLM, TTS, and can call your backend functions.

**1. Get LiveKit Credentials**
- Create account at [cloud.livekit.io](https://cloud.livekit.io)
- Go to Settings → Keys and copy: `URL`, `API_KEY`, `API_SECRET`
- Add to `env.config`

**2. Deploy & Create Agent**
```bash
./deploy_backend.sh          # Run first to create .env.secrets
cd livekit-agent
lk cloud auth                # Authenticate (one-time)
lk agent create --secrets-file .env.secrets  # Create agent (one-time)
cd .. && ./deploy_backend.sh # Run again to complete setup
./deploy_frontend.sh         # Deploy frontend
```

**3. Update Agent Code**
Edit `livekit-agent/agent.py`, then:
```bash
./deploy_backend.sh   # Automatically redeploys everything
```

Test locally: `cd livekit-agent && python agent.py dev`

See `livekit-agent/README.md` for details.

</details>

## Development

Run tests after making changes:
```bash
./test_functions.sh
```

**Common issues**: Missing env.js? Run `./deploy_frontend.sh` • Database errors? Run `./setup_database.sh` • Still stuck? Ask Claude Code to help debug.

---

**Contributing**: Issues and PRs welcome!