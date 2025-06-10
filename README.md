# Full-Stack Web App Template

A production-ready template for building full-stack web applications with Supabase, Cloudflare Pages, and vanilla JavaScript. No build process required!

## Features

- 🔐 **Magic Link Authentication** - Email-based passwordless login
- 🚀 **Edge Functions** - Serverless backend with Deno
- 🗄️ **PostgreSQL Database** - With Row Level Security
- 🌐 **Global CDN Hosting** - Via Cloudflare Pages
- 📱 **Responsive Design** - Mobile-friendly out of the box
- 🔄 **Realtime Updates** - Live data synchronization
- 🛡️ **Security First** - RLS policies and secure authentication
- 🎨 **No Build Process** - Pure HTML/JS/CSS

## Prerequisites

- [Supabase Account](https://supabase.com) (free tier works)
- [Cloudflare Account](https://cloudflare.com) (free tier works)
- [Supabase CLI](https://supabase.com/docs/guides/cli) installed
- [Node.js](https://nodejs.org) (for Cloudflare Wrangler)
- Git

## Quick Start

### 1. Clone and Setup

```bash
git clone <your-repo-url>
cd <your-project>

# Setup environment variables
cp setup-env.sh.template setup-env.sh
```

### 2. Configure Supabase

1. Create a new Supabase project at [app.supabase.com](https://app.supabase.com)
2. Go to Settings → API and copy:
   - Project URL → `SUPABASE_URL`
   - Project Ref → `SUPABASE_PROJECT_REF`
   - Anon Public key → `SUPABASE_ANON_KEY`
   - Service Role key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

3. Edit `setup-env.sh` and add your Supabase credentials

### 3. Setup Database

1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `sql/schema.sql`
3. Run the SQL to create tables and policies

### 4. Configure Authentication

1. Go to Supabase Dashboard → Authentication → Email Templates
2. Update the magic link template if desired
3. Configure allowed domains in Authentication → URL Configuration

### 5. Configure Cloudflare

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

### 6. Deploy

```bash
# Load environment variables
source setup-env.sh dev  # or 'prod' for production

# Deploy backend (Supabase Edge Functions)
./deploy_backend.sh

# Deploy frontend (Cloudflare Pages)
./deploy_frontend.sh
```

## Development

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

### Adding Pages

1. Create new HTML file in `frontend/`
2. Create corresponding JS file
3. Add auth routing in `auth.js` if needed

### Adding Edge Functions

1. Create new folder in `supabase/functions/`
2. Add `index.ts` with your function logic
3. Import CORS from `_shared/cors.ts`
4. Redeploy with `./deploy_backend.sh`

### Database Changes

1. Add changes to `sql/schema.sql`
2. Run new SQL in Supabase dashboard
3. Remember to add RLS policies!

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

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages)
- [Deno Documentation](https://deno.land/manual)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## License

MIT - Use this template for any project!

## Contributing

Feel free to submit issues and PRs to improve this template.