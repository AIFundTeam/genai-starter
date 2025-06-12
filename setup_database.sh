#!/bin/bash

# Database Setup Script (using Supabase CLI)
# This script runs the SQL schema using supabase db push
# The schema is idempotent - it drops and recreates all objects

set -e  # Exit on error

echo "🗄️  Setting up database schema..."

# Check if environment is loaded
if [ -z "$SUPABASE_PROJECT_REF" ] || [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo "❌ Environment variables not loaded"
    echo "Please run: source setup-env.sh [dev|prod]"
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

echo "Linking to Supabase project..."
# Link the project (if not already linked)
if [ ! -f "supabase/.temp/project-ref" ] || [ "$(cat supabase/.temp/project-ref 2>/dev/null)" != "$SUPABASE_PROJECT_REF" ]; then
    supabase link --project-ref "$SUPABASE_PROJECT_REF" --password "$SUPABASE_DB_PASSWORD"
else
    echo "Already linked to project: $SUPABASE_PROJECT_REF"
fi

echo ""
echo "⚠️  WARNING: This will drop and recreate all tables!"
echo "   - user_roles"
echo "   - items"
echo ""
echo "This is safe for development but will DELETE ALL DATA."
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Reset local migrations to match remote (this makes it idempotent)
echo "Resetting migration state..."
rm -rf supabase/migrations
mkdir -p supabase/migrations

# Pull current remote state to sync
echo "Syncing with remote database..."
supabase db pull --password "$SUPABASE_DB_PASSWORD" 2>&1 | grep -v "Schema public was not modified" || true

# Now create our new migration
TIMESTAMP=$(date +%Y%m%d%H%M%S)
MIGRATION_FILE="supabase/migrations/${TIMESTAMP}_reset_schema.sql"
cp sql/schema.sql "$MIGRATION_FILE"

echo "Applying schema to database..."

# Push the migration
supabase db push --password "$SUPABASE_DB_PASSWORD"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Database schema setup complete!"
    echo ""
    echo "Tables created:"
    echo "  - user_roles (for user permissions)"
    echo "  - items (example table with RLS)"
    echo ""
    echo "Features enabled:"
    echo "  - Row Level Security (RLS)"
    echo "  - Realtime subscriptions"
    echo "  - Automatic user role creation on signup"
    echo ""
    echo "Note: This script is idempotent and can be run multiple times."
    echo "      Each run will drop and recreate all tables."
else
    echo ""
    echo "❌ Database setup failed"
    echo "Please check the error messages above"
    exit 1
fi