#!/bin/bash

# Database Setup Script (using Supabase CLI)
# This script runs the SQL schema using supabase db push
# The schema is idempotent - it drops and recreates all objects

set -e  # Exit on error

echo "🗄️  Setting up database schema..."

# Auto-source setup-env.sh if env.config exists and environment variables are not set
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    if [ -f "env.config" ]; then
        echo "⚠️  Environment variables not set. Auto-sourcing setup-env.sh..."
        source setup-env.sh
        if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
            echo "❌ Failed to load environment variables!"
            echo "Please check your env.config file"
            exit 1
        fi
    else
        echo "❌ Environment variables not set and env.config not found!"
        echo "Please create env.config from env.config.template and fill in your values"
        exit 1
    fi
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

echo "Linking to Supabase project..."
# Link the project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref 2>/dev/null)" != "$SUPABASE_PROJECT_REF" ]; then
    supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
    echo "Already linked to project: $SUPABASE_PROJECT_REF"
fi

echo ""
echo "⚠️  WARNING: This will drop and recreate all tables!"
echo "   - items"
echo ""
echo "This is safe for development but will DELETE ALL DATA."
echo ""
echo "Proceeding automatically..."

# Reset migrations directory
echo "Preparing migrations..."
rm -rf supabase/migrations
mkdir -p supabase/migrations

# Create our schema migration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_initial_schema.sql"
cp sql/schema.sql "$MIGRATION_FILE"

# Reset the remote database and apply our migration
echo "Resetting remote database..."
echo "y" | PGPASSWORD="$SUPABASE_DB_PASSWORD" supabase db reset --linked --no-seed

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database reset complete!"
    echo ""
    echo "Tables created:"
    echo "  - items (example table with RLS)"
    echo ""
    echo "Features enabled:"
    echo "  - Row Level Security (RLS)"
    echo "  - Realtime subscriptions"
    echo "  - Email-based user identification"
    echo ""
    echo "Note: This script is idempotent and can be run multiple times."
    echo "      Each run will drop and recreate all tables."
else
    echo ""
    echo "❌ Database setup failed"
    echo "Please check the error messages above"
    exit 1
fi

