#!/bin/bash

# Database Setup Script (using Supabase CLI)
# This script runs the SQL schema using supabase db push
# The schema is idempotent - it drops and recreates all objects

set -e  # Exit on error

echo "Setting up database..."

# Always source setup-env.sh to ensure environment is configured
if [ -f "env.config" ]; then
    echo "Loading environment..."
    source setup-env.sh
    if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
        echo "❌ Failed to load environment variables!"
        echo "Please check your env.config file"
        exit 1
    fi
else
    echo "❌ env.config not found!"
    echo "Please create env.config from env.config.template and fill in your values"
    exit 1
fi

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found!"
    echo "Please install: https://supabase.com/docs/guides/cli"
    exit 1
fi

# Check if SQL file exists
if [ ! -f "sql/schema.sql" ]; then
    echo "❌ sql/schema.sql not found"
    exit 1
fi

# Link the project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref 2>/dev/null)" != "$SUPABASE_PROJECT_REF" ]; then
    supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD" > /dev/null 2>&1
fi

# Reset migrations directory
rm -rf supabase/migrations
mkdir -p supabase/migrations

# Create our schema migration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_initial_schema.sql"
cp sql/schema.sql "$MIGRATION_FILE"

# Reset the remote database and apply our migration
echo "y" | PGPASSWORD="$SUPABASE_DB_PASSWORD" supabase db reset --linked --no-seed > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "Database ready!"
else
    echo "❌ Database setup failed"
    echo "Please check the error messages above"
    exit 1
fi

