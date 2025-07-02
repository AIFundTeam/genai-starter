#!/bin/bash

# Backend deployment script for Supabase Edge Functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Supabase Edge Functions Deployment ===${NC}"

# Check if environment variables are set
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo -e "${RED}Error: Environment variables not set!${NC}"
    echo "Please run: source setup-env.sh"
    exit 1
fi

echo -e "${YELLOW}Deploying to project: $SUPABASE_PROJECT_REF${NC}"

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not found!${NC}"
    echo "Please install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Link the project (if not already linked)
echo -e "\n${GREEN}Checking Supabase project link...${NC}"
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref 2>/dev/null)" != "$SUPABASE_PROJECT_REF" ]; then
    echo -e "${YELLOW}Linking to project: $SUPABASE_PROJECT_REF${NC}"
    supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
    echo -e "${GREEN}Already linked to project: $SUPABASE_PROJECT_REF${NC}"
fi

# Set OpenAI API key as a secret
echo -e "\n${GREEN}Setting Edge Function secrets...${NC}"
echo -e "${YELLOW}Setting OPENAI_API_KEY...${NC}"
supabase secrets set OPENAI_API_KEY="$OPENAI_API_KEY" --project-ref "$SUPABASE_PROJECT_REF" 2>&1 | grep -v "would you like to" || true

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ OPENAI_API_KEY set successfully${NC}"
else
    echo -e "${YELLOW}⚠ OPENAI_API_KEY may already be set or there was an error${NC}"
fi

# Deploy all edge functions
echo -e "\n${GREEN}Deploying edge functions...${NC}"

# Get list of functions (excluding _shared directory)
FUNCTIONS=$(ls -d supabase/functions/*/ 2>/dev/null | grep -v '_shared' | xargs -n 1 basename)

if [ -z "$FUNCTIONS" ]; then
    echo -e "${YELLOW}No functions found to deploy${NC}"
else
    for func in $FUNCTIONS; do
        echo -e "\n${YELLOW}Deploying function: $func${NC}"
        supabase functions deploy "$func" \
            --use-api \
            --project-ref "$SUPABASE_PROJECT_REF" \
            --no-verify-jwt
        
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}✓ Function $func deployed successfully${NC}"
        else
            echo -e "${RED}✗ Failed to deploy function $func${NC}"
        fi
    done
fi

echo -e "\n${GREEN}=== Backend Deployment Complete ===${NC}"
echo -e "${YELLOW}Function URLs:${NC}"
for func in $FUNCTIONS; do
    echo "  https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/${func}"
done

echo -e "\n${GREEN}Next steps:${NC}"
echo "See README.md section 7 for testing instructions"
echo "Deploy frontend with: ./deploy_frontend.sh"