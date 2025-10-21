#!/bin/bash

# Supabase deployment script for Edge Functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Deploying Supabase backend..."

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
supabase secrets set \
    OPENAI_API_KEY="$OPENAI_API_KEY" \
    PROJECT_NAME="$PROJECT_NAME" \
    --project-ref "$SUPABASE_PROJECT_REF" > /dev/null 2>&1

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

echo "Supabase backend ready!"

# Show LiveKit deployment reminder if configured
if [ -n "$LIVEKIT_URL" ] && [ -n "$LIVEKIT_API_KEY" ] && [ -n "$LIVEKIT_API_SECRET" ]; then
    echo ""
    echo "⚠️  LiveKit configured - deploy voice agent separately if needed:"
    echo "   ./deploy_livekit.sh"
fi
