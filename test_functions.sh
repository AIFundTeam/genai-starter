#!/bin/bash

# Test script for Supabase Edge Functions

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Running Edge Function Tests${NC}"
echo ""

# Load environment variables
if [ -f "env.config" ]; then
    source setup-env.sh
    if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$OPENAI_API_KEY" ]; then
        echo -e "${RED}❌ Error: Failed to load environment variables!${NC}"
        echo "Please check your env.config file"
        exit 1
    fi
else
    echo -e "${RED}❌ Error: env.config not found!${NC}"
    echo "Please create env.config from env.config.template"
    exit 1
fi

# Add Deno to PATH if it's in the default location
export PATH="$HOME/.deno/bin:$PATH"

# Check if deno is installed
if ! command -v deno &> /dev/null; then
    echo -e "${RED}❌ Deno not found!${NC}"
    echo "Please install Deno: https://deno.land/"
    exit 1
fi

# Set test environment variables
export TEST_FUNCTION_URL="https://${SUPABASE_PROJECT_REF}.supabase.co/functions/v1/test-llm"
export OPENAI_API_KEY="$OPENAI_API_KEY"

echo -e "${YELLOW}Testing function URL: ${TEST_FUNCTION_URL}${NC}"
echo ""

# Run the tests
deno test --allow-net --allow-env supabase/functions/test-llm/test.ts

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Tests failed!${NC}"
    exit 1
fi
