# Claude Code Full-Stack Starter

A Claude Code-optimized template for rapidly building full-stack web applications with AI assistance. This starter pack provides an opinionated framework designed to work seamlessly with [Claude Code](https://www.anthropic.com/claude-code), enabling you to build production-ready apps at terminal velocity.

**Built with Claude Code in mind** - Every aspect of this template is optimized for AI-assisted development, from the project structure to the deployment scripts.

## Why This Starter?

- 🤖 **Claude Code Optimized** - Clear project structure and patterns that Claude Code understands deeply
- ⚡ **Zero to Production Fast** - Let Claude Code handle the boilerplate while you focus on features
- 📝 **CLAUDE.md Included** - Pre-configured instructions for optimal AI assistance
- 🔧 **Opinionated Choices** - Carefully selected stack that works great with AI pair programming

## Tech Stack

- 🤖 **LLM Integration** - OpenAI API integration built-in
- 🎤 **Voice Interface** - LiveKit voice agents (optional)
- 👤 **Simple User System** - Email-based login (no passwords)
- 🚀 **Edge Functions** - Serverless backend with Deno
- 🗄️ **PostgreSQL Database** - With Row Level Security via Supabase
- 🌐 **Global CDN Hosting** - Via Cloudflare Pages
- 📱 **Responsive Design** - Mobile-friendly out of the box
- 🔄 **Realtime Updates** - Live data synchronization
- 🎨 **No Build Process** - Pure HTML/JS/CSS for simplicity

## Prerequisites

- **[Claude Code](https://www.anthropic.com/claude-code)** - Your AI coding assistant (required)
  - Install Node.js 18+, then run: `npm install -g @anthropic-ai/claude-code`
- **[Deno](https://deno.land)** - Runtime for Edge Functions and testing (required)
  - Install: `curl -fsSL https://deno.land/install.sh | sh`
  - Add to PATH: `export PATH="$HOME/.deno/bin:$PATH"` (add to ~/.zshrc or ~/.bashrc)
- [OpenAI Account](https://platform.openai.com) with API key (required)
- [Supabase Account](https://supabase.com) (free tier works)
- [Cloudflare Account](https://cloudflare.com) (free tier works)
- [LiveKit Cloud Account](https://cloud.livekit.io) (optional - for voice features)

**📝 For tool installation (Supabase CLI, Node.js, Deno, Git):** See [SETUP_MACOS.md](./SETUP_MACOS.md)

## Quick Start

### 1. Create a new repo from the template

1. Go to https://github.com/AIFundTeam/genai-starter and click **"Use this template"** → **"Create a new repository"**
2. Clone your new repository and navigate to it:
   ```bash
   git clone <your-repo-url>
   cd <your-repo-name>
   ```

### 2. Create Supabase Project and Cloudflare Account

#### Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and create a new project
   - Enter your project details and wait for the database to launch
   - **IMPORTANT**: Save your database password when creating the project (you can reset it later in Database Settings if needed)

2. Get your access token for deployments:
   - Go to [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
   - Generate a new token and save it securely

#### Create Cloudflare Account

1. Go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) and create a new account

### 3. Setup Environment

```bash
cp env.config.template env.config
```

Edit `env.config` and fill in your credentials:

**Supabase Values** (from your Supabase project):
- `SUPABASE_PROJECT_REF` - Project Settings → General → Project ID
- `SUPABASE_ANON_KEY` - Project Settings → API Keys → anon public
- `SUPABASE_SERVICE_ROLE_KEY` - Project Settings → API Keys → service_role secret
- `SUPABASE_DB_PASSWORD` - The password you saved when creating the project
- `SUPABASE_ACCESS_TOKEN` - The personal access token you created in step 2

**Cloudflare Values**:
- `CLOUDFLARE_API_TOKEN` - Create one following these steps:
  1. Go to [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  2. Click "Create Token"
  3. Select "Edit Cloudflare Workers" template → "Use template"
  4. **Account Resources**: Include → Your account
  5. **Zone Resources**: Include → All zones
  6. Click "Continue to summary" → "Create Token"
  7. **IMPORTANT**: Copy the token secret immediately (it's only shown once!)
- `CLOUDFLARE_PROJECT_NAME` - Choose a name for your project (e.g., "my-app") - this will be used in your deployment URL

**OpenAI Values**:
- `OPENAI_API_KEY` - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

**LiveKit Values (Optional - for voice features)**:
- `LIVEKIT_URL` - Your LiveKit server URL (e.g., wss://your-project.livekit.cloud)
- `LIVEKIT_API_KEY` - API key from LiveKit project settings
- `LIVEKIT_API_SECRET` - API secret from LiveKit project settings

**Note**: Voice features are optional. Leave these blank to skip voice integration.

### 4. Setup Database

```bash
# Run the database setup (WARNING: drops existing tables!)
./setup_database.sh
```

**Important**: This script is idempotent but destructive - it drops and recreates all tables each time it runs. This ensures a clean state but will DELETE ALL DATA.

### 5. Deploy

```bash
./deploy_backend.sh      # Deploy Supabase Edge Functions + Voice Agent (if configured)
./deploy_frontend.sh     # Deploy to Cloudflare Pages
```

The deploy scripts automatically handle:
- Loading environment variables from `env.config`
- Linking your Supabase project
- Generating `frontend/env.js` for the frontend
- Creating `.mcp.json` for Claude Code MCP servers
- Deploying voice agent to LiveKit Cloud (if credentials configured)
- Setting up all necessary configurations

### 6. Test Your Setup

Visit your Cloudflare Pages URL and run the built-in tests on the dashboard to verify everything works. If anything fails, copy the error message and ask Claude Code to help debug.

## ⚠️ Security Warning - READ BEFORE PRODUCTION USE

**This is a starter template optimized for rapid prototyping, NOT production security.**

### Current Security Status

All edge functions are **publicly accessible without authentication**:
- ❌ **Anyone with your Supabase URL can call your functions**
- ❌ **They can drain your OpenAI API credits** (via `test-llm`)
- ❌ **They can generate LiveKit tokens** and join voice rooms (via `livekit-token`)
- ❌ **They can modify your database** (via `increment-counter`)

### Why This Template Has No Auth

The template uses a simple email-only system (no passwords) to help you prototype quickly with Claude Code. This is intentional - authentication complexity would slow down development.

### Before Production Deployment

**YOU MUST add Supabase Auth before deploying with real users or sensitive data:**

1. **Enable Supabase Auth** in your project dashboard (magic links, OAuth, Google, etc.)
2. **Replace the simple email system** with proper authentication
3. **Remove `--no-verify-jwt`** from `deploy_backend.sh`
4. **Edge functions will automatically verify JWT tokens** and reject unauthorized requests

See [Supabase Auth docs](https://supabase.com/docs/guides/auth) for implementation.

### Voice Agent Security

**IMPORTANT**: The voice agent can call your backend edge functions without authentication in this starter template. For production deployments, you should implement proper authentication:

- **Option 1**: Enable Supabase Auth (recommended) - Voice agent receives user JWT and passes it to backend
- **Option 2**: Implement a shared secret between agent and backend for function calls
- **Option 3**: Use Supabase RLS policies to restrict what the voice agent can access

See [Supabase Auth docs](https://supabase.com/docs/guides/auth) and [LiveKit Agent docs](https://docs.livekit.io/agents/) for implementation details.

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

## Voice Interface (Optional)

This template includes an optional voice interface powered by LiveKit agents. Users can talk to an AI assistant that can answer questions and call your backend functions.

### Features
- Browser-based voice interaction
- Real-time speech-to-text and text-to-speech
- Custom tools to call edge functions
- Graceful fallback if not configured

### Setup Voice Interface

1. **Create LiveKit Cloud Account and Get Credentials**

   a. **Sign up**:
   - Go to [cloud.livekit.io](https://cloud.livekit.io)
   - Create a free account
   - Click "Create Project" and choose a project name

   b. **Get your credentials**:
   - Once in your project, go to **Settings** → **Keys**
   - You'll find three values:
     - **Project URL** (starts with `wss://your-project.livekit.cloud`) → Use for `LIVEKIT_URL`
     - **API Key** (e.g., `APIxxxxx`) → Use for `LIVEKIT_API_KEY`
     - **API Secret** (long string) → Use for `LIVEKIT_API_SECRET`
   - Copy these values - you'll need them for `env.config`

2. **Configure Environment**
   - Add the three LiveKit values to `env.config`:
     ```
     LIVEKIT_URL="wss://your-project.livekit.cloud"
     LIVEKIT_API_KEY="APIxxxxx"
     LIVEKIT_API_SECRET="your-secret-here"
     ```

3. **Deploy Backend (MUST RUN FIRST)**
   ```bash
   ./deploy_backend.sh   # This creates the .env.secrets file needed for agent creation
   ```

   **Important:** This script MUST be run before creating the agent, as it generates the `.env.secrets` file.

4. **Create Voice Agent** (one-time manual step)

   After running `./deploy_backend.sh`, you'll see instructions with the exact commands to run:

   ```
   📝 Voice agent setup (one-time manual step):

   ⚠️  LiveKit Cloud has a limit of 2 agents per project.
       You may need to delete old agents first.

   Run these commands to create your agent:
      cd livekit-agent
      lk cloud auth  # Authenticate with LiveKit Cloud
      lk agent list  # View existing agents (optional)
      lk agent create --subdomain your-subdomain --secrets-file .env.secrets
   ```

   **NOTE**: The `.env.secrets` file is automatically created by `deploy_backend.sh`. Never create it manually!

   **Why manual?**
   - LiveKit limits you to 2 agents per project
   - You may need to delete old agents first with `lk agent list` and `lk agent delete`
   - Gives you control over agent creation

   **After creation:**
   - Run `./deploy_backend.sh` again
   - All future deployments are automated!

5. **Deploy Frontend**
   ```bash
   ./deploy_frontend.sh  # Deploys frontend
   ```

6. **Test Voice**
   - Visit your app and click the voice button
   - Grant microphone permissions
   - Start talking!

### Voice Agent Development

The voice agent is in `livekit-agent/agent.py` and includes:
- Speech-to-text using LiveKit Inference (Deepgram)
- LLM responses using OpenAI GPT-5 via LiveKit Inference
- Text-to-speech using Cartesia
- Custom tool to demonstrate calling backend edge functions

**Deploy agent updates:**

After initial creation, updates are fully automated:
```bash
./deploy_backend.sh   # Automatically redeploys edge functions AND voice agent
```

Every time you run the deploy script, your agent code changes are pushed to LiveKit Cloud.

**Test locally:**
```bash
cd livekit-agent
python agent.py dev
```

See `livekit-agent/README.md` for detailed documentation.

**Note**: `./deploy_backend.sh` handles all of this automatically!

## Common Issues

**Missing env.js?** Run `./deploy_frontend.sh`

**401 errors?** Run `./deploy_backend.sh`

**Database errors?** Run `./setup_database.sh`

**OpenAI errors?** Check your API key has credits at [platform.openai.com](https://platform.openai.com)

**Voice not working?** Check LiveKit credentials and ensure agent is deployed

**Still stuck?** Copy the error and ask Claude Code: "Help me debug this error: [paste error]"

## Development

### Run Tests

```bash
./test_functions.sh  # Auto-discovers and runs all tests
```

### Local Development

```bash
cd frontend
python -m http.server 8000  # Or use Live Server in VS Code
```

## Why This Stack?

This starter uses technologies specifically chosen to work well with Claude Code:

- **No Build Process** - Claude Code can directly edit and understand every file
- **Clear Structure** - Organized in a way that makes sense to AI
- **Modern Standards** - Uses web standards that Claude Code knows well
- **Production Ready** - Scales from prototype to production seamlessly

## Contributing

Feel free to submit issues and PRs to improve this template.