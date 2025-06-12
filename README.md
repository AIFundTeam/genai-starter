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
- 👤 **Simple User System** - Email-based login (no passwords)
- 🚀 **Edge Functions** - Serverless backend with Deno
- 🗄️ **PostgreSQL Database** - With Row Level Security via Supabase
- 🌐 **Global CDN Hosting** - Via Cloudflare Pages
- 📱 **Responsive Design** - Mobile-friendly out of the box
- 🔄 **Realtime Updates** - Live data synchronization
- 🎨 **No Build Process** - Pure HTML/JS/CSS for simplicity

## Prerequisites

- **[Claude Code](https://www.anthropic.com/claude-code)** - Your AI coding assistant (required)
- [OpenAI Account](https://platform.openai.com) with API key (required)
- [Supabase Account](https://supabase.com) (free tier works)
- [Cloudflare Account](https://cloudflare.com) (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Node.js](https://nodejs.org) (for Cloudflare Wrangler)
- Git

## Quick Start

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd <your-project>
```

### 2. Create Supabase Project

1. Go to [app.supabase.com](https://app.supabase.com) and create a new project
   - **IMPORTANT**: Save your database password when shown! It's only displayed once.

2. Get your access token for deployments:
   - Go to [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
   - Generate a new token

### 3. Create Cloudflare Pages Project

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → Pages
2. Create a new Pages project (name it something like "your-app-name")
3. Skip the git integration for now

### 4. Setup Environment

```bash
cp env.config.template env.config
```

Edit `env.config` and fill in your credentials:

**Supabase Values** (from your Supabase project):
- `SUPABASE_PROJECT_REF` - Settings → General (e.g., "xyzcompanyorxyz")
- `SUPABASE_ANON_KEY` - Settings → API → anon public
- `SUPABASE_SERVICE_ROLE_KEY` - Settings → API → service_role
- `SUPABASE_DB_PASSWORD` - The password you saved when creating the project
- `SUPABASE_ACCESS_TOKEN` - The personal access token you created in step 2

**Cloudflare Values**:
- `CLOUDFLARE_ACCOUNT_ID` - Found in any Cloudflare dashboard page (right sidebar)
- `CLOUDFLARE_API_TOKEN` - Create one following these steps:
  1. Go to [My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  2. Click "Create Token"
  3. Use "Custom token" template
  4. Set permissions:
     - Account → Cloudflare Pages:Edit
     - Account → Account Settings:Read (for account ID verification)
  5. Set Account Resources: Include → Your account
  6. Click "Continue to summary" → "Create Token"
  7. **IMPORTANT**: Copy the token immediately (you won't see it again!)
- `CLOUDFLARE_PROJECT_NAME` - Choose a name for your project (e.g., "my-app")

**OpenAI Values**:
- `OPENAI_API_KEY` - Get from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 5. Source Environment

```bash
source setup-env.sh  # This reads from env.config
```

This will:
- Set all environment variables
- Link your Supabase project
- Generate `frontend/env.js` for deployment

### 6. Setup Database

```bash
# Run the database setup (WARNING: drops existing tables!)
./setup_database.sh
```

**Important**: This script is idempotent but destructive - it drops and recreates all tables each time it runs. This ensures a clean state but will DELETE ALL DATA.

### 7. Deploy

```bash
./deploy_backend.sh      # Deploy Supabase Edge Functions
./deploy_frontend.sh     # Deploy to Cloudflare Pages
```

### 8. Test Your Setup

After deploying, verify everything is working by visiting your Cloudflare Pages URL.

The template includes a **Test Your Setup** section on the dashboard that verifies:

1. ✅ **Frontend** - Confirms deployment is working
2. ✅ **Database** - Tests connection to PostgreSQL  
3. ✅ **Edge Functions** - Tests both public and user APIs
4. ✅ **LLM Integration** - Tests OpenAI API integration

The LLM test verifies your OpenAI API key is working. If it fails:
1. Check your API key is valid and has credits
2. Make sure you ran `./deploy_backend.sh` after setting up
3. Verify the secret was set: `supabase secrets list`

Once all tests pass, you'll see "🎉 All Tests Passed!" and you're ready to build.

## Build Your App with Claude Code

Now that everything is set up and tested, open the project with Claude Code:

```bash
claude .
```

Examples of what to ask Claude Code:
- "I want to build a task management app"
- "Add a user profile system"
- "Create a real-time chat feature"
- "Implement file uploads"
- "Add data export functionality"

Claude Code will:
- Update the database schema in `sql/schema.sql`
- Modify the frontend UI in `index.html` and `index.js`
- Add edge functions for your business logic
- Implement features across the entire stack
- Maintain consistency with the existing codebase

**Important**: After Claude Code modifies the schema, run `./setup_database.sh` again to apply the changes.

## Development with Claude Code

Claude Code is your AI pair programmer. Here are some examples:

```bash
# Feature Development
"Add a comments system to items with real-time updates"
"Create a search functionality with full-text search"
"Implement user notifications with email integration"

# Debugging
"Why is my authentication redirect not working?"
"Help me debug this CORS error in my edge function"

# Performance
"Optimize the database queries for the dashboard"
"Add caching to improve page load times"

# Testing
"Write tests for the authentication flow"
"Create a test suite for my edge functions"
```

### Local Frontend Development

```bash
# Simple HTTP server (Python)
cd frontend
python -m http.server 8000

# Or use any static server like Live Server in VS Code
```

### Test Edge Functions

```bash
# Public endpoint
curl https://<project-ref>.supabase.co/functions/v1/hello-world

# User endpoint (no auth required, just pass user email)
curl https://<project-ref>.supabase.co/functions/v1/user-endpoint \
  -H "Content-Type: application/json" \
  -d '{"user_email": "user@example.com"}'
```

### Directory Structure

```
├── frontend/               # Frontend application
│   ├── login.html         # Email entry page
│   ├── index.html         # Main application
│   ├── index.js           # App logic
│   ├── user.js            # User management
│   ├── supabase.js        # Database client
│   └── style.css          # Styles
├── supabase/functions/    # Edge functions
│   ├── _shared/           # Shared utilities
│   ├── hello-world/       # Example endpoint
│   └── user-endpoint/  # User data example
├── sql/                   # Database schema
├── deploy_*.sh           # Deployment scripts
├── setup-env.sh       # Environment setup script
└── env.config.template # Configuration template
```

## Customization

### Building Your App - The Claude Code Way

```bash
# Build your main app
"Build a project management app with tasks and deadlines"

# Add features
"Add a kanban board view to the tasks"

# Add an edge function
"Add an API endpoint to export user data as CSV"

# Database changes
"Add a tags system to items with many-to-many relationships"
```

Claude Code will handle:
- Modifying index.html/js for your app
- Creating edge functions
- Adding RLS policies
- Updating the schema
- Maintaining consistency

## Environment Management

For multiple environments (dev/staging/prod), create separate copies of `setup-env.sh` with different values:
- `setup-env-dev.sh`
- `setup-env-staging.sh`
- `setup-env-prod.sh`

## Security Best Practices

1. **Never commit** `env.config` (it's in .gitignore)
2. **Use RLS policies** on all database tables (though open for this template)
3. **Validate inputs** in edge functions
4. **Keep API keys secure** - never expose in frontend code
5. **Store secrets** in Supabase Edge Function secrets, not in code

## Working with Claude Code

### Best Practices

1. **Be Specific** - Claude Code works best with clear, specific requests
2. **Iterate Quickly** - Make small changes and test frequently
3. **Use the CLAUDE.md** - It contains project-specific instructions
4. **Trust the Assistant** - Claude Code understands the entire codebase
5. **Document Your Vision First** - Before coding, write down what you hope to accomplish in a narrative document. Use this to align on goals with teammates. Often the alignment process is both time-consuming and the most important part of any project. Once this narrative document is locked down, Claude Code can often execute on it in a single pass.

### Example Workflow

```bash
# Start a new feature
claude "I need a blog system with markdown support"

# Claude Code will:
# 1. Create database tables for posts, categories, tags
# 2. Add RLS policies for authorization
# 3. Create edge functions for CRUD operations
# 4. Build the frontend UI with markdown editor
# 5. Set up real-time updates for comments

# Review and deploy
claude "Show me what changed and deploy to production"
```

## Why This Stack?

This starter uses technologies specifically chosen to work well with Claude Code:

- **No Build Process** - Claude Code can directly edit and understand every file
- **Clear Structure** - Organized in a way that makes sense to AI
- **Modern Standards** - Uses web standards that Claude Code knows well
- **Production Ready** - Scales from prototype to production seamlessly

## Contributing

Feel free to submit issues and PRs to improve this template.