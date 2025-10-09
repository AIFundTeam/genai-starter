#!/bin/bash

# Backend deployment script for Supabase Edge Functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Deploying backend..."

# Always source setup-env.sh to ensure environment is configured
if [ -f "env.config" ]; then
    echo "Loading environment..."
    source setup-env.sh
    if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}Error: Failed to load environment variables!${NC}"
        echo "Please check your env.config file"
        exit 1
    fi
else
    echo -e "${RED}Error: env.config not found!${NC}"
    echo "Please create env.config from env.config.template and fill in your values"
    exit 1
fi


# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found! Please install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Link the project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref 2>/dev/null)" != "$SUPABASE_PROJECT_REF" ]; then
    supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" > /dev/null 2>&1
fi

# Set secrets for edge functions
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref "$SUPABASE_PROJECT_REF" > /dev/null 2>&1

# Set LiveKit secrets (optional - only if configured)
LIVEKIT_CONFIGURED=false
if [ -n "$LIVEKIT_URL" ] && [ -n "$LIVEKIT_API_KEY" ] && [ -n "$LIVEKIT_API_SECRET" ]; then
    supabase secrets set \
        LIVEKIT_URL="$LIVEKIT_URL" \
        LIVEKIT_API_KEY="$LIVEKIT_API_KEY" \
        LIVEKIT_API_SECRET="$LIVEKIT_API_SECRET" \
        --project-ref "$SUPABASE_PROJECT_REF" > /dev/null 2>&1
    echo "LiveKit credentials configured"
    LIVEKIT_CONFIGURED=true
else
    echo "⚠️ LiveKit credentials not found - voice features will be disabled"
fi

# Deploy all edge functions

# Get list of functions (excluding _shared and _templates directories)
FUNCTIONS=$(ls -d supabase/functions/*/ 2>/dev/null | grep -v '_shared' | grep -v '_templates' | xargs -n 1 basename)

if [ -z "$FUNCTIONS" ]; then
    echo "⚠️ No functions found to deploy"
else
    for func in $FUNCTIONS; do
        supabase functions deploy "$func" \
            --use-api \
            --project-ref "$SUPABASE_PROJECT_REF" \
            --no-verify-jwt > /dev/null 2>&1
        
        if [ $? -eq 0 ]; then
            echo "$func"
        else
            echo "Failed to deploy $func"
        fi
    done
fi

echo "Backend ready!"

# Deploy voice agent if LiveKit is configured
if [ "$LIVEKIT_CONFIGURED" = true ]; then
    echo ""
    echo "Deploying voice agent..."

    # Check if lk CLI is installed
    if ! command -v lk &> /dev/null; then
        echo "⚠️ LiveKit CLI not installed. Install with: brew install livekit"
        echo "   Then run: cd livekit-agent && lk agent deploy"
        exit 0
    fi

    # Check if Python dependencies are installed
    cd livekit-agent
    if ! python3 -c "import livekit.agents" 2>/dev/null; then
        echo "📦 Installing Python dependencies..."
        pip install -r requirements.txt > /dev/null 2>&1
    fi

    # Extract subdomain from LIVEKIT_URL (e.g., wss://tutor-j7bhwjbm.livekit.cloud -> tutor-j7bhwjbm)
    SUBDOMAIN=$(echo "$LIVEKIT_URL" | sed -E 's|wss://([^.]+)\.livekit\.cloud|\1|')

    # Create or update livekit.toml with correct subdomain
    if [ -f "livekit.toml" ]; then
        # Check if subdomain needs updating
        CURRENT_SUBDOMAIN=$(grep "^  subdomain = " livekit.toml | cut -d'"' -f2)
        if [ "$CURRENT_SUBDOMAIN" != "$SUBDOMAIN" ]; then
            echo "⚙️ Updating livekit.toml subdomain: $CURRENT_SUBDOMAIN → $SUBDOMAIN"
            # Update subdomain but preserve agent ID if it exists
            if grep -q "^id = " livekit.toml; then
                AGENT_ID=$(grep "^id = " livekit.toml | cut -d'"' -f2)
                cat > livekit.toml <<EOF
[project]
  subdomain = "$SUBDOMAIN"

[agent]
  id = "$AGENT_ID"
EOF
            else
                cat > livekit.toml <<EOF
[project]
  subdomain = "$SUBDOMAIN"

[agent]
# Agent ID will be assigned by LiveKit Cloud after first deployment
EOF
            fi
        fi
    else
        # Create from template
        if [ -f "livekit.toml.template" ]; then
            cat > livekit.toml <<EOF
[project]
  subdomain = "$SUBDOMAIN"

[agent]
# Agent ID will be assigned by LiveKit Cloud after first deployment
EOF
        else
            echo "Warning: livekit.toml.template not found"
        fi
    fi

    # Create .env.secrets file with backend URL
    echo "BACKEND_URL=https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1" > .env.secrets

    # Check if agent already exists
    if [ -f "livekit.toml" ] && grep -q "^id = " livekit.toml; then
        # Agent exists - deploy update automatically
        AGENT_ID=$(grep "^id = " livekit.toml | cut -d'"' -f2)
        echo ""
        echo "📦 Deploying voice agent update (ID: $AGENT_ID)..."

        if lk agent deploy --secrets-file .env.secrets > /dev/null 2>&1; then
            echo "✅ Voice agent deployed successfully!"
        else
            echo "❌ Automated deployment failed. Deploy manually:"
            echo "   cd livekit-agent && lk agent deploy --secrets-file .env.secrets"
        fi
        echo ""
    else
        # No agent - show manual creation instructions
        echo ""
        echo "📝 Voice agent setup (one-time manual step):"
        echo ""
        echo "⚠️  LiveKit Cloud has a limit of 2 agents per project."
        echo "    You may need to delete old agents first."
        echo ""
        echo "Run these commands to create your agent:"
        echo "   cd livekit-agent"
        echo "   lk cloud auth  # Authenticate with LiveKit Cloud"
        echo "   lk agent list  # View existing agents (optional)"
        echo "   lk agent create --subdomain $SUBDOMAIN --secrets-file .env.secrets"
        echo ""
        echo "After creation, run ./deploy_backend.sh again to deploy updates automatically."
        echo ""
    fi

    cd ..
fi

