-- Full-Stack App Template Database Schema
-- This script is idempotent - it can be run multiple times safely
-- Existing tables and objects will be dropped and recreated

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects to ensure clean state
DROP TABLE IF EXISTS items CASCADE;
DROP TABLE IF EXISTS voice_counter CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Items table (no authentication required)
CREATE TABLE items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_email TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_complete BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_items_user_email ON items(user_email);
CREATE INDEX idx_items_created_at ON items(created_at DESC);

-- Enable Row Level Security (but allow all operations)
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for items (allow all operations since no auth)
CREATE POLICY "Anyone can view items" ON items
    FOR SELECT USING (true);

CREATE POLICY "Anyone can create items" ON items
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can update items" ON items
    FOR UPDATE USING (true);

CREATE POLICY "Anyone can delete items" ON items
    FOR DELETE USING (true);

-- Function to automatically set updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime for items table
ALTER PUBLICATION supabase_realtime ADD TABLE items;

-- Voice counter table for voice agent demo
CREATE TABLE voice_counter (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count INTEGER DEFAULT 0,
    last_called_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW())
);

-- Insert initial counter row
INSERT INTO voice_counter (count) VALUES (0);

-- Enable Row Level Security
ALTER TABLE voice_counter ENABLE ROW LEVEL SECURITY;

-- RLS Policies (allow all operations)
CREATE POLICY "Anyone can view counter" ON voice_counter
    FOR SELECT USING (true);

CREATE POLICY "Anyone can update counter" ON voice_counter
    FOR UPDATE USING (true);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;