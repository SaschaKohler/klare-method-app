-- =====================================================
-- SIMPLE QUICK CHECK - Essential Current State
-- =====================================================

-- What tables exist in public schema?
SELECT 'PUBLIC TABLES' as check_type, table_name, 'exists' as status
FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- What tables exist in auth schema?
SELECT 'AUTH TABLES' as check_type, table_name, 'exists' as status
FROM information_schema.tables
WHERE table_schema = 'auth' AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Any custom functions?
SELECT 'CUSTOM FUNCTIONS' as check_type, proname as table_name, 'exists' as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND p.proname NOT LIKE 'pg_%'
ORDER BY proname;

-- Any views?
SELECT 'VIEWS' as check_type, table_name, 'exists' as status
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check migrations in storage
SELECT 'RECENT MIGRATIONS' as check_type, name as table_name, executed_at::text as status
FROM storage.migrations
ORDER BY executed_at DESC
LIMIT 5;