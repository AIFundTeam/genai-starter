#!/bin/bash

# LiveKit voice agent deployment script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Deploying LiveKit voice agent..."

# Always source setup-env.sh to ensure environment is configured
if [ -f "env.config" ]; then
    echo "Loading environment..."
    source setup-env.sh
    if [ -z "$SUPABASE_PROJECT_REF" ]; then
        echo -e "${RED}Error: SUPABASE_PROJECT_REF not set!${NC}"
        echo "Please check your env.config file"
        exit 1
    fi
else
    echo -e "${RED}Error: env.config not found!${NC}"
    echo "Please create env.config from env.config.template and fill in your values"
    exit 1
fi

# Check if LiveKit is configured
if [ -z "$LIVEKIT_URL" ] || [ -z "$LIVEKIT_API_KEY" ] || [ -z "$LIVEKIT_API_SECRET" ]; then
    echo -e "${RED}Error: LiveKit credentials not configured!${NC}"
    echo "Please set LIVEKIT_URL, LIVEKIT_API_KEY, and LIVEKIT_API_SECRET in env.config"
    exit 1
fi

# Set LiveKit secrets in Supabase (for livekit-token edge function)
if command -v supabase &> /dev/null; then
    supabase secrets set \
        LIVEKIT_URL="$LIVEKIT_URL" \
        LIVEKIT_API_KEY="$LIVEKIT_API_KEY" \
        LIVEKIT_API_SECRET="$LIVEKIT_API_SECRET" \
        --project-ref "$SUPABASE_PROJECT_REF" > /dev/null 2>&1
    echo "LiveKit credentials configured in Supabase"
fi

# Check if lk CLI is installed
if ! command -v lk &> /dev/null; then
    echo -e "${RED}❌ LiveKit CLI not installed!${NC}"
    echo "Install with: brew install livekit"
    echo "Then run this script again"
    exit 1
fi

# Navigate to agent directory
cd livekit-agent

# Check if Python dependencies are installed
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
        echo "⚙️  Updating livekit.toml subdomain: $CURRENT_SUBDOMAIN → $SUBDOMAIN"
        # Update subdomain but preserve agent ID if it exists
        if grep -q "^  id = " livekit.toml; then
            AGENT_ID=$(grep "^  id = " livekit.toml | cut -d'"' -f2)
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

# Create .env.secrets file with backend URL and project name
cat > .env.secrets <<EOF
BACKEND_URL=https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1
PROJECT_NAME=${PROJECT_NAME}
EOF

# Check if agent already exists
if [ -f "livekit.toml" ] && grep -q "^  id = " livekit.toml; then
    # Agent exists - deploy update
    AGENT_ID=$(grep "^  id = " livekit.toml | cut -d'"' -f2)
    echo ""
    echo "📦 Deploying voice agent update (ID: $AGENT_ID)..."

    if lk agent deploy --secrets-file .env.secrets > /dev/null 2>&1; then
        echo "✅ Voice agent deployed successfully!"
    else
        echo -e "${RED}❌ Deployment failed.${NC}"
        echo "Try deploying manually:"
        echo "   cd livekit-agent && lk agent deploy --secrets-file .env.secrets"
        cd ..
        exit 1
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
    echo "   lk agent create --secrets-file .env.secrets"
    echo ""
    echo "After creation, run ./deploy_livekit.sh again to deploy updates."
    echo ""
fi

cd ..
