# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application template built with:
- **Frontend**: Vanilla JavaScript/HTML/CSS (no build process)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL via Supabase
- **Hosting**: Cloudflare Pages (frontend), Supabase (backend)
- **Authentication**: Magic link email authentication

## Key Commands

```bash
# Initial setup (run once)
cp setup-env.sh.template setup-env.sh
# Edit setup-env.sh with your Supabase and Cloudflare credentials
source setup-env.sh dev  # or prod

# Database setup (run once)
# Execute sql/schema.sql content in Supabase SQL editor

# Deploy backend (Supabase Edge Functions)
./deploy_backend.sh

# Deploy frontend (Cloudflare Pages)
./deploy_frontend.sh

# Local development
# Frontend: Open frontend/index.html in browser or use a local server
# Backend: Test edge functions via Supabase dashboard or curl

# Deploy specific function (for testing)
supabase functions deploy <function-name> --project-ref $SUPABASE_PROJECT_REF
```

## Architecture

### Directory Structure
```
template/
├── frontend/               # Frontend application
│   ├── index.html         # Landing page
│   ├── app.html           # Main application page
│   ├── login.html         # Login page
│   ├── index.js           # Landing page logic
│   ├── app.js             # Main app logic
│   ├── auth.js            # Authentication utilities
│   ├── supabase.js        # Supabase client
│   ├── style.css          # Styles
│   └── env.js             # Environment variables (generated)
├── supabase/
│   ├── functions/         # Edge functions
│   │   ├── _shared/       # Shared utilities
│   │   │   └── cors.ts    # CORS configuration
│   │   ├── hello-world/   # Example public endpoint
│   │   └── protected-endpoint/ # Example authenticated endpoint
│   └── config.toml        # Supabase configuration
├── sql/
│   └── schema.sql         # Database schema
├── deploy_backend.sh      # Backend deployment script
├── deploy_frontend.sh     # Frontend deployment script
├── setup-env.sh.template  # Environment setup template
├── CLAUDE.md             # This file
└── README.md             # Setup instructions
```

### Key Patterns

1. **Authentication Flow**
   - User enters email on login page
   - Magic link sent via Supabase Auth
   - User clicks link and is authenticated
   - Session stored in localStorage
   - Auth state changes trigger navigation

2. **Frontend Patterns**
   - Modular JavaScript with clear separation of concerns
   - Global auth state management via window.authReady
   - Event-driven communication between modules
   - Realtime subscriptions for live updates
   - No build process - pure vanilla JS

3. **Backend Patterns**
   - Edge functions follow consistent structure
   - CORS handling in _shared/cors.ts
   - Authentication verification via JWT
   - Proper error responses with status codes
   - Admin client for privileged operations

4. **Database Patterns**
   - UUID primary keys
   - Row Level Security (RLS) policies
   - Audit fields (created_at, updated_at, created_by)
   - User roles (user, admin)
   - Soft delete pattern where appropriate

5. **Security Best Practices**
   - Never expose API keys in frontend
   - Use environment variables for secrets
   - Implement RLS policies for all tables
   - Verify authentication in edge functions
   - Use admin client only when necessary

### Adding New Features

1. **New Page**
   - Create HTML file in frontend/
   - Create corresponding JS file
   - Add navigation logic in auth.js
   - Update auth routing if needed

2. **New Edge Function**
   - Create folder in supabase/functions/
   - Copy structure from hello-world or protected-endpoint
   - Import CORS from _shared/cors.ts
   - Deploy with deploy_backend.sh

3. **New Database Table**
   - Add to sql/schema.sql
   - Include RLS policies
   - Add indexes for performance
   - Enable realtime if needed

4. **Environment Variables**
   - Add to setup-env.sh.template
   - Document in README.md
   - Use in code via env.js (frontend) or Deno.env (backend)

### Common Tasks

1. **Check Authentication Status**
   ```javascript
   import { getCurrentUser } from './auth.js';
   const user = await getCurrentUser();
   ```

2. **Make Authenticated API Call**
   ```javascript
   import { invokeEdgeFunction } from './supabase.js';
   const result = await invokeEdgeFunction('protected-endpoint', { data: 'value' });
   ```

3. **Subscribe to Realtime Updates**
   ```javascript
   import { subscribeToTable } from './supabase.js';
   const channel = subscribeToTable('items', (payload) => {
     console.log('Change:', payload);
   });
   ```

4. **Add RLS Policy**
   ```sql
   CREATE POLICY "Users can view own items" ON items
     FOR SELECT USING (auth.uid() = user_id);
   ```

### Testing

- Frontend: Use browser developer tools and console
- Backend: Test via Supabase dashboard or curl commands
- Database: Use Supabase SQL editor for queries
- Authentication: Create test users via Supabase dashboard

### Deployment

1. Always run `source setup-env.sh <env>` before deploying
2. Deploy backend first with `./deploy_backend.sh`
3. Deploy frontend with `./deploy_frontend.sh`
4. Monitor logs in Supabase and Cloudflare dashboards

### Troubleshooting

- **Auth issues**: Check Supabase Auth settings and email templates
- **CORS errors**: Verify frontend URL in CORS configuration
- **Database errors**: Check RLS policies and user permissions
- **Function errors**: View logs in Supabase dashboard
- **Environment issues**: Ensure setup-env.sh is sourced correctly