# Claude Code Full-Stack Starter

A Claude Code-optimized template for rapidly building full-stack web applications with AI assistance. This starter pack provides an opinionated framework designed to work seamlessly with [Claude Code](https://www.anthropic.com/claude-code), enabling you to build production-ready apps at terminal velocity.

**Built with Claude Code in mind** - Every aspect of this template is optimized for AI-assisted development, from the project structure to the deployment scripts.

## Why This Starter?

- 🤖 **Claude Code Optimized** - Clear project structure and patterns that Claude Code understands deeply
- ⚡ **Zero to Production Fast** - Let Claude Code handle the boilerplate while you focus on features
- 📝 **CLAUDE.md Included** - Pre-configured instructions for optimal AI assistance
- 🔧 **Opinionated Choices** - Carefully selected stack that works great with AI pair programming

## Tech Stack

- 🔐 **Magic Link Authentication** - Email-based passwordless login
- 🚀 **Edge Functions** - Serverless backend with Deno
- 🗄️ **PostgreSQL Database** - With Row Level Security via Supabase
- 🌐 **Global CDN Hosting** - Via Cloudflare Pages
- 📱 **Responsive Design** - Mobile-friendly out of the box
- 🔄 **Realtime Updates** - Live data synchronization
- 🛡️ **Security First** - RLS policies and secure authentication
- 🎨 **No Build Process** - Pure HTML/JS/CSS for simplicity

## Prerequisites

- **[Claude Code](https://www.anthropic.com/claude-code)** - Your AI coding assistant (required)
- [Supabase Account](https://supabase.com) (free tier works)
- [Cloudflare Account](https://cloudflare.com) (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Node.js](https://nodejs.org) (for Cloudflare Wrangler)
- Git

## Quick Start with Claude Code

### 1. Clone and Open with Claude Code

```bash
git clone <your-repo-url>
cd <your-project>

# Open with Claude Code to start building
claude .
```

Claude Code will help you:
- Understand the project structure instantly
- Customize the template for your specific needs
- Build features with AI assistance
- Deploy your app when ready

### 2. Setup Environment

```bash
# In Claude Code, ask:
# "Help me set up the environment variables"

# Or manually:
cp setup-env.sh.template setup-env.sh
```

### 3. Configure Supabase

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
   - **IMPORTANT**: Save your database password when shown! It's only displayed once.
2. Go to Settings → API and copy:
   - Project Ref → `SUPABASE_PROJECT_REF` (e.g., `xyzcompanyorxyz`)
   - Anon Public key → `SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)
3. Go to Settings → Database and copy:
   - Database Password → `SUPABASE_DB_PASSWORD` (the one you saved from step 1)
4. If you need an access token for deployments:
   - Go to [app.supabase.com/account/tokens](https://app.supabase.com/account/tokens)
   - Generate a new token → `SUPABASE_ACCESS_TOKEN`

5. Edit `setup-env.sh` and add your Supabase credentials

### 4. Build Your App with Claude Code

This is where Claude Code shines! Before setting up the database, customize the template:

```bash
# Examples of what to ask Claude Code:

# "I want to build a task management app - update the schema and create the UI"
# "Add a user profile page with avatar upload"
# "Create an admin dashboard with user management"
# "Implement real-time notifications"
# "Add Stripe payment integration"
```

Claude Code will:
- Update the database schema in `sql/schema.sql`
- Create new pages and components
- Add edge functions for your business logic
- Implement features across the entire stack
- Maintain consistency with the existing codebase

### 5. Setup Database

```bash
# Make sure you've sourced your environment first
source setup-env.sh dev

# Run the database setup (WARNING: drops existing tables!)
./setup_database.sh
```

**Important**: This script is idempotent but destructive - it drops and recreates all tables each time it runs. This ensures a clean state but will DELETE ALL DATA. Perfect for development, but don't run on production data!

### 6. Configure Authentication

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Update the magic link template if desired
3. Configure allowed domains in Authentication → URL Configuration

### 7. Configure Cloudflare

1. Create a Cloudflare Pages project
2. Get your Cloudflare credentials:
   - Account ID: Found in Cloudflare dashboard sidebar
   - API Token: Create at Cloudflare → My Profile → API Tokens
     - Use "Edit Cloudflare Workers" template
     - Add Account:Cloudflare Pages:Edit permission

3. Add to `setup-env.sh`:
   - `CLOUDFLARE_ACCOUNT_ID`
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_PROJECT_NAME` (your Pages project name)

### 8. Deploy with Claude Code

```bash
# Ask Claude Code to deploy:
# "Deploy the backend to Supabase"
# "Deploy the frontend to Cloudflare"

# Or run manually:
source setup-env.sh dev  # or 'prod' for production
./deploy_backend.sh      # Deploy backend (Supabase Edge Functions)
./deploy_frontend.sh     # Deploy frontend (Cloudflare Pages)
```

**Note**: The first time you deploy, Supabase CLI will link your project. This is a one-time setup per environment.

## Development with Claude Code

### AI-Assisted Development

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

# Protected endpoint (requires auth token)
curl https://<project-ref>.supabase.co/functions/v1/protected-endpoint \
  -H "Authorization: Bearer <user-jwt-token>"
```

### Directory Structure

```
├── frontend/               # Frontend application
│   ├── index.html         # Landing page
│   ├── app.html           # Main app (authenticated)
│   ├── login.html         # Login page
│   ├── auth.js            # Auth utilities
│   ├── supabase.js        # Database client
│   └── style.css          # Styles
├── supabase/functions/    # Edge functions
│   ├── _shared/           # Shared utilities
│   ├── hello-world/       # Example endpoint
│   └── protected-endpoint/# Auth example
├── sql/                   # Database schema
├── deploy_*.sh           # Deployment scripts
└── setup-env.sh.template # Environment template
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

The template supports multiple environments:

```bash
# Development
source setup-env.sh dev

# Production
source setup-env.sh prod
```

Configure different Supabase projects for each environment in `setup-env.sh`.

## Security Best Practices

1. **Never commit** `setup-env.sh` (it's in .gitignore)
2. **Use RLS policies** on all database tables
3. **Validate inputs** in edge functions
4. **Check authentication** before sensitive operations
5. **Keep service role key** secret

## Troubleshooting

### "Invalid JWT" errors
- Check that you're using the correct anon key
- Ensure cookies are enabled
- Try logging out and back in

### CORS errors
- Update `allowedOrigins` in `_shared/cors.ts`
- Redeploy edge functions
- Check browser console for specific origin

### Database permission errors
- Check RLS policies are enabled
- Verify user has correct role
- Test queries in Supabase SQL editor

### Email not sending
- Check spam folder
- Verify email settings in Supabase
- Ensure email provider is configured

## Working with Claude Code

### Best Practices

1. **Be Specific** - Claude Code works best with clear, specific requests
2. **Iterate Quickly** - Make small changes and test frequently
3. **Use the CLAUDE.md** - It contains project-specific instructions
4. **Trust the Assistant** - Claude Code understands the entire codebase

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

## Resources

- [Claude Code Documentation](https://www.anthropic.com/claude-code)
- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Deno Documentation](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Why This Stack?

This starter uses technologies specifically chosen to work well with Claude Code:

- **No Build Process** - Claude Code can directly edit and understand every file
- **Clear Structure** - Organized in a way that makes sense to AI
- **Modern Standards** - Uses web standards that Claude Code knows well
- **Production Ready** - Scales from prototype to production seamlessly

## License

MIT - Use this template for any project!

## Contributing

Feel free to submit issues and PRs to improve this template.