# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack web application template built with:
- **Frontend**: Vanilla JavaScript/HTML/CSS (no build process)
- **Backend**: Supabase Edge Functions (Deno runtime)
- **Database**: PostgreSQL via Supabase
- **Hosting**: Cloudflare Pages (frontend), Supabase (backend)
- **Users**: Email-based user identification (no passwords or authentication)
- **AI/LLM**: OpenAI API integration (required)
- **Voice**: LiveKit voice agents (optional)

## 🚀 Quick Setup Sequence

**Run these commands in order when setting up or making schema changes:**

```bash
# 1. Configure environment (run once)
cp env.config.template env.config
# Edit env.config with your credentials

# 2. Setup database (run after schema changes)
./setup_database.sh

# 3. Deploy Supabase backend (Edge Functions)
./deploy_supabase.sh

# 4. Deploy LiveKit agent (optional, only if using voice features)
./deploy_livekit.sh

# 5. Deploy frontend
./deploy_frontend.sh

# 6. Run tests (after making changes)
./test_functions.sh
```

**Important**: `setup_database.sh` must run before testing or using the app.

## 📖 Command Reference

```bash
# Initial setup (run once)
cp env.config.template env.config
# Edit env.config with your Supabase and Cloudflare credentials

# Database setup
./setup_database.sh

# Deploy Supabase backend (Edge Functions)
./deploy_supabase.sh

# Deploy LiveKit agent (optional, only after agent changes)
./deploy_livekit.sh

# Deploy frontend (Cloudflare Pages)
./deploy_frontend.sh

# Run tests (ALWAYS run after making changes)
./test_functions.sh

# Deploy specific function
supabase functions deploy <function-name> --project-ref $SUPABASE_PROJECT_REF
```

## 🎙️ When to Deploy LiveKit Agent

**Run `./deploy_livekit.sh` only when you modify voice agent files:**
- `livekit-agent/agent.py` - Agent code changes
- `livekit-agent/requirements.txt` - Python dependency changes
- `livekit-agent/Dockerfile` - Container configuration changes

**Skip if you're only modifying:**
- Edge Functions (use `./deploy_supabase.sh` instead)
- Frontend code (use `./deploy_frontend.sh` instead)
- Database schema (use `./setup_database.sh` instead)

**Note:** LiveKit deployment is slower (~30-60 seconds) and should only be run when the agent itself changes. The `deploy_supabase.sh` script will remind you if LiveKit is configured.

## 🧪 Test-Driven Development (CRITICAL)

**IMPORTANT: This template follows test-driven development principles.**

### When Adding or Modifying Edge Functions:

1. **Always create/update tests** in `supabase/functions/<function-name>/test.ts`
2. **Focus on functional paths** - Test that the main feature works, not edge cases
3. **Run tests after changes**: `./test_functions.sh`
4. **Tests should validate**:
   - ✅ Successful API calls with valid inputs
   - ✅ Proper response structure
   - ✅ CORS handling
   - ❌ Skip: Complex edge cases, exhaustive error scenarios (this is a starter pack)

### Function Template - Testable Architecture:

**IMPORTANT**: Separate business logic from HTTP handling for better testability.

**Create a new function with this structure:**

```bash
# Copy the templates
mkdir supabase/functions/your-function
cp supabase/functions/_templates/function-template.ts supabase/functions/your-function/index.ts
cp supabase/functions/_templates/logic-template.ts supabase/functions/your-function/logic.ts
cp supabase/functions/_templates/test-template.ts supabase/functions/your-function/test.ts
cp supabase/functions/_templates/logic.test.ts supabase/functions/your-function/logic.test.ts
```

**Your function directory structure:**
```
supabase/functions/your-function/
├── index.ts        # HTTP handler (thin layer)
├── logic.ts        # Business logic (pure, testable)
├── test.ts         # Integration tests (HTTP endpoint)
└── logic.test.ts   # Unit tests (business logic only)
```

**Why this pattern?**
- ✅ **Testable**: Unit test business logic without HTTP overhead
- ✅ **Fast**: Logic tests run instantly (no network calls)
- ✅ **Maintainable**: Clear separation of concerns
- ✅ **Reusable**: Business logic can be imported by other functions

**Example:**
```typescript
// logic.ts - Pure business logic
export async function processOrder(orderId: string) {
  // Your business logic here
  return { status: 'processed', orderId };
}

// index.ts - HTTP handler
import { processOrder } from './logic.ts';

Deno.serve(async (req) => {
  const { orderId } = await req.json();
  const result = await processOrder(orderId);
  return new Response(JSON.stringify(result));
});

// logic.test.ts - Fast unit tests
import { processOrder } from './logic.ts';

Deno.test("processOrder works", async () => {
  const result = await processOrder("123");
  assertEquals(result.status, "processed");
});
```

### Test Pattern with Shared Utilities:

```typescript
// supabase/functions/your-function/test.ts
import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import {
  getFunctionUrl,
  testFunction,
  assertValidResponse,
  testCorsPrefligh,
  assertValidCors,
  TEST_USER_EMAIL,
} from "../_shared/test-utils.ts";

const FUNCTION_URL = getFunctionUrl("your-function");

Deno.test("your-function: successful call with valid input", async () => {
  const response = await testFunction(FUNCTION_URL, {
    user_email: TEST_USER_EMAIL,
    // your test data
  });

  assertValidResponse(response, 200);
  const data = await response.json();

  // Validate response structure
  assertEquals(data.success, true);
  assertExists(data.result);

  console.log("✅ Result:", data.result);
});

Deno.test("your-function: handles CORS preflight", async () => {
  const response = await testCorsPrefligh(FUNCTION_URL);
  assertValidResponse(response, 200, false); // CORS doesn't return JSON
  assertValidCors(response);
});
```

### Auto-Discovery:

`test_functions.sh` automatically discovers all `test.ts` files in function directories. Just create your test file and run:

```bash
./test_functions.sh
```

No need to manually update the test runner - it finds all tests automatically!

**Remember**: Every new Edge Function MUST have at least one test that validates the happy path.

## 🔧 MCP Tools for Enhanced Debugging

This starter includes MCP tools in `.mcp.json` for closed-loop debugging:

- **Supabase MCP**: Direct database access, real-time queries, server logs
- **Puppeteer MCP**: UI testing, screenshots, frontend JavaScript console logs capture

### Puppeteer Usage Notes

**Important for Claude Code automation:**
- **Don't over-wait**: Web page updates are fast - shorter wait times are usually sufficient
- **Check login state**: The app remembers previous user login in localStorage. Always attempting to login is an automation failure mode - check if user is already logged in first

These tools enable Claude Code to get immediate feedback on changes across the full stack for more productive development.

## ⚠️ Most Common Error

**If you see "Missing Supabase configuration" or similar errors:**
1. Make sure `env.js` exists (created by deploy_frontend.sh)
2. Make sure `env.js` is loaded FIRST in your HTML (before all other scripts)
3. See "Script Loading Order" section below for details

## Architecture

### Directory Structure
```
template/
├── frontend/               # Frontend application
│   ├── login/             # Login page
│   │   ├── index.html     # Login page (email entry only, no password)
│   │   ├── app.js         # Login logic with Shadow DOM
│   │   └── css.js         # Login page styles
│   ├── app/               # Main application
│   │   ├── index.html     # Main app page (shows after login)
│   │   ├── app.js         # Main app logic with Shadow DOM
│   │   └── css.js         # Main app styles
│   ├── test/              # Test/setup page
│   │   ├── index.html     # Setup verification page
│   │   ├── app.js         # Test logic with Shadow DOM
│   │   └── css.js         # Test page styles
│   ├── index.html         # Root redirect page
│   ├── env.js             # Environment variables (generated)
│   ├── supabase.js        # Supabase client
│   └── user.js            # User management (email storage)
├── supabase/
│   ├── functions/         # Edge functions
│   │   ├── _shared/       # Shared utilities
│   │   │   └── cors.ts    # CORS configuration
│   │   ├── test-llm/      # LLM integration endpoint
│   │   └── livekit-token/ # Voice token generation
│   └── config.toml        # Supabase configuration
├── livekit-agent/         # Voice agent (optional)
│   ├── agent.py           # Python voice agent
│   ├── requirements.txt   # Python dependencies
│   └── livekit.toml      # LiveKit config (auto-generated/synced)
├── sql/
│   └── schema.sql         # Database schema
├── deploy_supabase.sh     # Supabase Edge Functions deployment
├── deploy_livekit.sh      # LiveKit voice agent deployment
├── deploy_frontend.sh     # Frontend deployment script
├── setup-env.sh           # Environment setup script
├── env.config.template    # Configuration template
├── CLAUDE.md             # This file
└── README.md             # Setup instructions
```

### Page Structure

**Application Pages:**
- `frontend/index.html` - Root redirect page (routes to login or app)
- `frontend/login/` - Email entry page (users enter email, no password)
- `frontend/app/` - Main application (shows after user enters email)
- `frontend/test/` - Setup verification page (tests database, LLM integration)

**User Flow:**
1. User visits site → root index.html routes based on localStorage
2. If no email stored → redirect to `/login/`
3. User enters email (no password required) → stored in localStorage
4. User redirected to `/app/` (main app) or `/test/` (for setup verification)
5. All data is associated with user's email

## 📝 Frontend Development Strategy with Shadow DOM

**IMPORTANT: Each page is organized in its own directory with Shadow DOM components!**

### 🏗️ Shadow DOM Architecture

Each page uses Shadow DOM for style encapsulation and modularity:
- **`css.js`** - Exports styles as a template literal string
- **`app.js`** - Custom element with Shadow DOM implementation  
- **`index.html`** - Minimal HTML that loads the custom element

### 📂 Page-Based Development

When users ask you to build features:
- ✅ **Modify existing page directories** (`/app/`, `/login/`, `/test/`)
- ✅ **Edit the relevant `css.js`** for styling changes
- ✅ **Edit the relevant `app.js`** for functionality
- ✅ **Create new page directories** only when requested (e.g., `/dashboard/`, `/settings/`)
- ✅ **Always use Shadow DOM pattern** for new pages
- ✅ Update schema.sql for database changes
- ✅ Create edge functions for backend logic

### 🎯 Where to Add Features

- **Main App Features** → Modify `frontend/app/` directory
- **Login/Auth Changes** → Modify `frontend/login/` directory  
- **Testing/Setup** → Modify `frontend/test/` directory
- **New Pages** → Create new directory with `index.html`, `app.js`, `css.js`

**Why Shadow DOM?** Provides style encapsulation, prevents CSS conflicts, and makes components more modular and maintainable.

**Test Setup Flow:**
The template includes a comprehensive test section in the dashboard to verify:
1. Frontend deployment is working
2. Database connection (tests items table access)
3. Edge functions (both public and user endpoints)
4. LLM integration (tests OpenAI API connection)

All tests must pass before building custom features. The OpenAI API key is automatically configured by the deploy scripts.

### CRITICAL: The env.js File

**IMPORTANT**: The app requires `env.js` to be present with Supabase configuration. This file is:
- Generated by `deploy_frontend.sh` 
- Contains `window.SUPABASE_URL` and `window.SUPABASE_ANON_KEY`
- Required for the app to connect to Supabase

**If the user reports Supabase errors**, check if env.js exists:
```javascript
// env.js should contain:
window.SUPABASE_URL = 'https://xyzabc.supabase.co';
window.SUPABASE_ANON_KEY = 'eyJ...';
```

**For local development**, create env.js manually or run the deploy script.

### Key Patterns

1. **User Management**
   - User enters email on login page (login.html)
   - Email stored in localStorage (no password)
   - Users redirected to login.html if no email found
   - Can change email via settings in the app
   - No passwords or authentication required
   - All data associated with user's email

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
   - Row Level Security (RLS) policies (open access, no auth checks)
   - Audit fields (created_at, updated_at)
   - user_email field for data ownership
   - Soft delete pattern where appropriate
   - **Idempotent schema**: setup_database.sh drops and recreates tables

5. **Security Best Practices**
   - Never expose API keys in frontend
   - Use environment variables for secrets
   - Implement RLS policies for all tables
   - Verify authentication in edge functions
   - Use admin client only when necessary

### ⚠️ CRITICAL: Script Loading Order with Shadow DOM

**Shadow DOM pages have different script loading patterns:**

**For pages that need Supabase (like `/test/`):**
```html
<!-- At the bottom of your HTML file, before </body> -->
<script src="../env.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../supabase.js"></script>
<script src="../user.js"></script>
<script type="module" src="./app.js"></script>  <!-- Your Shadow DOM component -->
```

**For simple pages (like `/login/` and `/app/`):**
```html
<!-- Minimal setup -->
<script src="../env.js"></script>
<script type="module" src="./app.js"></script>  <!-- Your Shadow DOM component -->
```

**Why this order matters:**
1. `../env.js` - Sets up environment variables (MUST be first)
2. Supabase CDN - Provides the Supabase library (only if needed)
3. `../supabase.js` - Creates the Supabase client (only if needed)  
4. `../user.js` - Sets up user management (only if needed)
5. `./app.js` - Your Shadow DOM component (type="module" for ES6 imports)

### 🔧 Shadow DOM Component Pattern

**Each page follows this structure:**

**`css.js` - Styles Export:**
```javascript
export const styles = `
  :host {
    /* CSS custom properties */
    --primary-color: #2563eb;
    display: block;
    /* Global styles for the component */
  }
  
  /* Component styles... */
`;
```

**`app.js` - Custom Element:**
```javascript
import { styles } from './css.js';

class MyPageApp extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.initializeEventListeners();
  }

  render() {
    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <!-- Your HTML content -->
    `;
  }
}

customElements.define('my-page-app', MyPageApp);
```

**`index.html` - Page Entry Point:**
```html
<body>
    <my-page-app></my-page-app>
    <script src="../env.js"></script>
    <script type="module" src="./app.js"></script>
</body>
```

### Adding New Features

1. **New Page Directory**
   - Create `/frontend/newpage/` directory
   - Copy the Shadow DOM pattern above
   - Follow the three-file structure: `index.html`, `app.js`, `css.js`

2. **Modify Existing Page**
   - Edit the appropriate `css.js` for styling changes
   - Edit the appropriate `app.js` for functionality changes
   - Shadow DOM keeps styles encapsulated

3. **New Edge Function**
   - Create folder in supabase/functions/
   - Copy structure from test-llm
   - Import CORS from _shared/cors.ts
   - Deploy with deploy_supabase.sh

4. **New Database Table**
   - Add to sql/schema.sql
   - **Run ./setup_database.sh** to apply changes
   - Include RLS policies
   - Add indexes for performance
   - Enable realtime if needed

5. **Environment Variables**
   - Add to env.config
   - Document in README.md
   - Use in code via env.js (frontend) or Deno.env (backend)
   - OpenAI API key is automatically set as Edge Function secret

### IMPORTANT: About the "items" Table

The template includes a pre-built `items` table as an example. When building a new app:

**Option 1: Replace the items table (RECOMMENDED)**
- Remove the items table from schema.sql
- Create your own tables (e.g., todos, notes, posts)
- Update all references in the frontend
- This gives you a clean, purpose-built schema

**Option 2: Repurpose the items table**
- Keep the table but rename it in schema.sql
- Update the columns to match your needs
- Modify the frontend to use your new fields

**Option 3: Extend with new tables**
- Keep items as an example (can delete later)
- Add your new tables alongside it
- Build your features independently

### LLM Integration Pattern

The template includes a working OpenAI integration example in `test-llm` function:
- Accepts a prompt and user_email
- Calls OpenAI GPT-4.1
- Returns the AI response
- Handles errors gracefully

**To use this pattern in your own functions:**
1. Copy the `test-llm` function as a starting point
2. Modify the system prompt for your use case
3. Adjust max_tokens and temperature as needed
4. Add any additional context or parameters

### Voice Interface Pattern (Optional)

The template includes an optional voice interface powered by LiveKit agents:
- **Browser Client**: LiveKit client SDK for voice interaction
- **Token Generation**: `livekit-token` edge function generates JWT tokens
- **Voice Agent**: Python agent deployed on LiveKit Cloud
- **Backend Integration**: Agent can call edge functions with shared secret authentication

**Voice Flow:**
1. User clicks voice button → frontend requests token from `livekit-token` function
2. Frontend connects to LiveKit room with token
3. LiveKit agent automatically joins the room
4. User speaks → Agent processes with STT/LLM/TTS
5. Agent can call backend functions (e.g., `test-llm`) using shared secret

**Authentication:**
- **Browser ↔ Backend**: Standard Supabase function calls
- **Browser ↔ LiveKit**: JWT token from `livekit-token` function
- **Agent ↔ Backend**: Shared secret in `X-Agent-Secret` header

**Agent Development:**
- Agent code: `livekit-agent/agent.py`
- Uses LiveKit Inference for STT/LLM/TTS billing
- Deploy with: `cd livekit-agent && lk agent deploy`
- Test locally: `cd livekit-agent && python agent.py dev`

**Graceful Degradation:**
- If LiveKit credentials not configured, voice button shows setup instructions
- App works normally without voice features
- Test page validates token generation (marks as passed if not configured)

**To add voice features to your app:**
1. Voice interface is already set up in `frontend/app/`
2. Agent demonstrates calling `test-llm` function
3. Add custom tools in `agent.py` to call your edge functions
4. Use shared secret for authentication (automatically handled by deploy script)

### Voice Agent Module

The template includes `frontend/voice-utils.js` - a complete voice interface module that isolates all LiveKit functionality.

**VoiceManager Class** - Main interface for voice features:
- `checkAvailability(userEmail)` - Check if voice features are available
- `loadSDK()` - Load LiveKit SDK dynamically
- `connect(userEmail, audioContainer)` - Connect to voice room
- `disconnect()` - Disconnect from voice room
- `toggle(userEmail, audioContainer)` - Toggle connection state

**VoiceManager Callbacks** (passed to constructor):
- `onStatusUpdate(message)` - Called on status changes
- `onConnectionChange(connected)` - Called on connect/disconnect
- `onTranscript(speaker, text)` - Called when transcript received
- `onDataMessage(data)` - Called for all data channel messages

**Helper Functions:**
- `publishMicrophoneTrack(room, LivekitClient)` - Creates and publishes microphone track
- `formatTranscriptEntry(speaker, text)` - Format transcript with timestamp
- `createTranscriptHTML(entry)` - Generate HTML for transcript entries
- `addTranscriptEntry(container, entry)` - Add entry to DOM with auto-scroll
- `handleDataChannelMessage(payload, participant)` - Parse binary messages from agent

**Usage Example:**
```javascript
import { VoiceManager, formatTranscriptEntry, addTranscriptEntry } from '../voice-utils.js';

// Create manager with UI callbacks
const voiceManager = new VoiceManager({
  onStatusUpdate: (status) => updateStatusDisplay(status),
  onConnectionChange: (connected) => updateButtonState(connected),
  onTranscript: (speaker, text) => {
    const entry = formatTranscriptEntry(speaker, text);
    addTranscriptEntry(transcriptContainer, entry);
  },
  onDataMessage: (data) => console.log('Data:', data),
});

// Check availability and load SDK
const { available } = await voiceManager.checkAvailability(userEmail);
if (available) {
  await voiceManager.loadSDK();
}

// Connect/disconnect
await voiceManager.connect(userEmail, audioContainer);
await voiceManager.disconnect();
```

**Benefits of VoiceManager:**
- All voice logic isolated in one module
- Simple callback-based UI integration
- No LiveKit implementation details in app code
- Easy to test and maintain

### Common User Requests and How to Handle Them

1. **"Build a [todo/notes/task/etc] app"**
   - **First decision**: Replace or extend the items table (see above)
   - Modify `index.html` and `index.js` for the app UI
   - Update schema.sql with appropriate tables
   - Create edge functions for CRUD operations
   - Add realtime subscriptions if needed

2. **"Add user profiles"**
   - Create profiles table in schema.sql
   - Add RLS policies for security
   - Update index.html with profile UI
   - Create profile management edge functions

3. **"Add AI features"**
   - Use the existing OpenAI integration
   - Create edge functions that call LLMs
   - Add AI-powered UI to index.html
   - Example: AI chat, content generation, analysis

4. **"Add file uploads"**
   - Use Supabase Storage buckets
   - Create storage policies
   - Add upload UI to index.html
   - Handle file metadata in database

5. **"Add payment processing"**
   - Integrate Stripe via edge functions
   - Add subscription/payment tables
   - Create checkout flow in index.html
   - Handle webhooks securely

6. **"Make it real-time"**
   - Enable realtime on relevant tables
   - Add subscription handlers in index.js
   - Update UI reactively on changes

### Common Implementation Patterns

1. **Check User Status**
   ```javascript
   // Get current user email (redirects to login.html if not set)
   const userEmail = window.getCurrentUser();
   
   // User management is handled by user.js which:
   // - Checks localStorage for userEmail
   // - Redirects to login.html if not found
   // - Provides getCurrentUser() and logout() functions
   ```

2. **Make Authenticated API Call**
   ```javascript
   // Edge functions are available globally
   const result = await window.invokeEdgeFunction('your-function-name', { data: 'value' });
   ```

3. **Database Operations**
   ```javascript
   // All database functions are available globally
   const items = await window.selectFrom('items');
   const newItem = await window.insertInto('items', { name: 'New Item' });
   await window.updateIn('items', itemId, { name: 'Updated' });
   await window.deleteFrom('items', itemId);
   ```

4. **Subscribe to Realtime Updates**
   ```javascript
   const channel = window.subscribeToTable('items', (payload) => {
     console.log('Change:', payload);
     // Update UI based on change
   });
   ```

5. **Add RLS Policy**
   ```sql
   CREATE POLICY "Anyone can view items" ON items
     FOR SELECT USING (true);
   ```

### Testing

- Frontend: Use browser developer tools on deployed site
- Backend: Test via Supabase dashboard or curl commands
- Database: Use Supabase SQL editor for queries
- Authentication: Create test users via sign up form or Supabase dashboard
- Full Stack: Use the built-in test suite on the dashboard to verify setup

### Deployment

**Deploy in this order:**

1. **Database first** with `./setup_database.sh` (creates/updates schema)
2. **Supabase backend** with `./deploy_supabase.sh` (deploys Edge Functions, sets secrets)
3. **LiveKit agent** with `./deploy_livekit.sh` (optional, only after agent changes)
4. **Frontend last** with `./deploy_frontend.sh` (deploys UI, generates env.js)
5. Monitor logs in Supabase, LiveKit, and Cloudflare dashboards

### Troubleshooting

- **Login issues**: Check localStorage for userEmail key
- **CORS errors**: Verify frontend URL in CORS configuration (update _shared/cors.ts)
- **Database errors**: Check that tables exist (run ./setup_database.sh) and RLS policies are open
- **Function 401/403 errors**: Ensure functions deployed with --no-verify-jwt flag
- **"Missing Supabase configuration"**: Check that env.js exists and is loaded first
- **OpenAI errors**: Verify API key is set and has active billing

# Important Claude Code Guidelines

1. **User Intent is King**
   - Build exactly what the user asks for
   - Don't add features they didn't request
   - Ask for clarification when needed

2. **File Management**
   - Edit existing files when possible
   - Only create new files for new features
   - Follow the established structure

3. **Communication**
   - Be concise but thorough
   - Explain complex changes
   - Use the todo list for multi-step tasks

4. **Quality Standards**
   - Every feature should be production-ready
   - Include proper error handling
   - Add security measures by default
   - Follow existing code patterns

5. **Development Flow**
   - Database schema first
   - Backend logic second
   - Frontend UI last
   - Test everything

6. **Deployment Reminders**
   - After modifying Edge Functions → Remind: `./deploy_supabase.sh`
   - After modifying agent.py → Remind: `./deploy_livekit.sh`
   - After modifying frontend → Remind: `./deploy_frontend.sh`
   - After modifying schema.sql → Remind: `./setup_database.sh`
   - Don't automatically run deployment scripts unless explicitly asked

Remember: This is a Claude Code-first starter. Users expect fast, high-quality development with AI assistance. Deliver on that promise.