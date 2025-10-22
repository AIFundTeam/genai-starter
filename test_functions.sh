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
export SUPABASE_PROJECT_REF="$SUPABASE_PROJECT_REF"
export SUPABASE_URL="$SUPABASE_URL"
export SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
export OPENAI_API_KEY="$OPENAI_API_KEY"
export LIVEKIT_URL="$LIVEKIT_URL"
export LIVEKIT_API_KEY="$LIVEKIT_API_KEY"
export LIVEKIT_API_SECRET="$LIVEKIT_API_SECRET"
export LIVEKIT_AGENT_SECRET="$LIVEKIT_AGENT_SECRET"

echo -e "${YELLOW}Finding test files...${NC}"
echo ""

# Auto-discover test files in function directories
# Finds both test.ts (integration) and *.test.ts (unit tests)
# Excludes _templates directory
TEST_FILES=$(find supabase/functions -name "test.ts" -o -name "*.test.ts" -type f | grep -v "_templates" | sort)

if [ -z "$TEST_FILES" ]; then
    echo -e "${RED}❌ No test files found!${NC}"
    echo "Test files should be named 'test.ts' and located in function directories"
    exit 1
fi

echo -e "${BLUE}Found test files:${NC}"
echo "$TEST_FILES" | while read -r file; do
    echo "  - $file"
done
echo ""

# Run all discovered tests
deno test --allow-net --allow-env $TEST_FILES

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
