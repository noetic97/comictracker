# Supabase RLS (Row Level Security) Setup

This document contains the actual SQL commands used to set up Row Level Security for the Comic Tracker application.

## Prerequisites

- Supabase project created
- Database URL and service role key configured
- Existing tables (comics, favorite_series, alert_logs) from Prisma migration

## RLS Migration (Production Commands)

Execute these commands in the Supabase SQL editor:

### 1. RLS Migration for Comic Tracker

```sql
-- RLS Migration for Comic Tracker
-- Run this in Supabase SQL Editor

-- 1. Enable RLS on all existing tables
ALTER TABLE comics ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_series ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sign_in_at TIMESTAMP WITH TIME ZONE,
  -- User preferences
  display_name TEXT,
  avatar_url TEXT,
  -- System fields
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false
);

-- Enable RLS on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. Add user_id to existing tables
ALTER TABLE comics ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE favorite_series ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE alert_logs ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS comics_user_id_idx ON comics(user_id);
CREATE INDEX IF NOT EXISTS favorite_series_user_id_idx ON favorite_series(user_id);
CREATE INDEX IF NOT EXISTS alert_logs_user_id_idx ON alert_logs(user_id);
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);

-- 5. RLS Policies

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id);

-- Comics policies
CREATE POLICY "Users can view own comics" ON comics
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own comics" ON comics
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own comics" ON comics
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own comics" ON comics
  FOR DELETE USING (auth.uid()::text = user_id);

-- Favorite series policies
CREATE POLICY "Users can view own favorites" ON favorite_series
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own favorites" ON favorite_series
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own favorites" ON favorite_series
  FOR UPDATE USING (auth.uid()::text = user_id);

CREATE POLICY "Users can delete own favorites" ON favorite_series
  FOR DELETE USING (auth.uid()::text = user_id);

-- Alert logs policies (more restrictive)
CREATE POLICY "Users can view own alerts" ON alert_logs
  FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can manage alerts" ON alert_logs
  FOR ALL USING (current_setting('role') = 'service_role');

-- 6. Service role policies for admin functions
-- Allow service role to bypass RLS for admin operations
CREATE POLICY "Service role bypass comics" ON comics
  FOR ALL USING (current_setting('role') = 'service_role');

CREATE POLICY "Service role bypass favorites" ON favorite_series
  FOR ALL USING (current_setting('role') = 'service_role');

-- 7. Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 2. Data Migration Script

```sql
-- Data Migration Script (UUID-based)
-- Run AFTER the RLS migration above

-- 1. Create default user if not exists
INSERT INTO users (email, display_name, email_verified, is_active)
VALUES ('user@comictracker.local', 'Default User', true, true)
ON CONFLICT (email) DO NOTHING;

-- 2. Get the default user ID and update existing data
DO $
DECLARE
    default_user_id UUID;
BEGIN
    -- Get the default user ID
    SELECT id INTO default_user_id 
    FROM users 
    WHERE email = 'user@comictracker.local';
    
    -- Update all existing comics to belong to default user
    UPDATE comics 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
    
    -- Update all existing favorite_series to belong to default user
    UPDATE favorite_series 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
    
    -- Update all existing alert_logs to belong to default user (optional)
    UPDATE alert_logs 
    SET user_id = default_user_id 
    WHERE user_id IS NULL;
    
    -- Log the migration
    RAISE NOTICE 'Migrated data to user_id: %', default_user_id;
END $;

-- 3. Make user_id NOT NULL after migration (for required tables)
ALTER TABLE comics ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE favorite_series ALTER COLUMN user_id SET NOT NULL;
-- Note: alert_logs can keep user_id nullable for system alerts

-- 4. Update unique constraints to include user_id
ALTER TABLE comics DROP CONSTRAINT IF EXISTS publisher_series_volume_issue_type;
ALTER TABLE comics ADD CONSTRAINT publisher_series_volume_issue_type_user 
    UNIQUE (publisher, series, volume, issue, type, user_id);

ALTER TABLE favorite_series DROP CONSTRAINT IF EXISTS publisher_series_volume_volume;
ALTER TABLE favorite_series ADD CONSTRAINT publisher_series_volume_user 
    UNIQUE (publisher, series, volume, user_id);

-- 5. Verify migration
SELECT 
    'comics' as table_name,
    COUNT(*) as total_rows,
    COUNT(user_id) as rows_with_user_id,
    COUNT(*) - COUNT(user_id) as rows_without_user_id
FROM comics
UNION ALL
SELECT 
    'favorite_series' as table_name,
    COUNT(*) as total_rows,
    COUNT(user_id) as rows_with_user_id,
    COUNT(*) - COUNT(user_id) as rows_without_user_id
FROM favorite_series
UNION ALL
SELECT 
    'users' as table_name,
    COUNT(*) as total_rows,
    COUNT(id) as rows_with_user_id,
    0 as rows_without_user_id
FROM users;
```

## Verification Commands

After setting up RLS, verify the policies are working:

```sql
-- Check that RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('users', 'comics', 'favorite_series', 'alert_logs');

-- List all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Testing RLS

### Test with Service Role (should work)

```sql
-- This should return data when using service role key
SELECT count(*) FROM comics;
SELECT count(*) FROM users;
SELECT count(*) FROM favorite_series;
```

### Test with Anon Key (should be restricted)

```sql
-- These should return empty results or errors when using anon key without proper auth
SELECT * FROM comics;
SELECT * FROM users;
```

## Single-Tenant Default User Setup

For the current single-tenant setup, ensure a default user exists:

```sql
-- Insert default user (run once)
INSERT INTO users (id, email, display_name, email_verified, is_active)
VALUES (
  gen_random_uuid(),
  'user@comictracker.local',
  'Default User',
  true,
  true
) ON CONFLICT (email) DO NOTHING;
```

## Environment Variables Required

Ensure these are set in your Netlify environment:

```bash
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
DEFAULT_USER_EMAIL=user@comictracker.local
```

## Notes

- Service role bypasses RLS and has full database access
- Anon key respects RLS policies
- Current implementation uses service role for all operations (single-tenant)
- Future multi-user implementation will use user-specific authentication