-- =====================================================
-- QUICK DATABASE OVERVIEW - Essential Info Only (FIXED)
-- =====================================================
-- Execute this first for a quick overview

SELECT 'DATABASE OVERVIEW' as section;

-- Quick Tables Overview
SELECT 
    t.table_schema,
    t.table_name,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows,
    CASE 
        WHEN pt.rowsecurity THEN 'RLS ON'
        ELSE 'RLS OFF'
    END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = t.table_schema
WHERE t.table_schema IN ('public', 'auth', 'storage')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name;

-- Views Count
SELECT 'VIEWS COUNT' as info, COUNT(*)::text as value
FROM information_schema.views
WHERE table_schema IN ('public', 'auth', 'storage');

-- Functions Count  
SELECT 'CUSTOM FUNCTIONS COUNT' as info, COUNT(*)::text as value
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage')
  AND p.prokind = 'f'
  AND p.proname NOT LIKE 'pg_%';

-- RLS Policies Count
SELECT 'RLS POLICIES COUNT' as info, COUNT(*)::text as value
FROM pg_policies
WHERE schemaname IN ('public', 'auth', 'storage');

-- Try to find migration table
SELECT 'MIGRATION TABLES' as section;
SELECT 
    table_schema,
    table_name,
    'Migration table candidate' as note
FROM information_schema.tables
WHERE table_name LIKE '%migration%' 
   OR table_name LIKE '%schema%'
ORDER BY table_schema, table_name;

-- Look for any storage schema tables
SELECT 'STORAGE SCHEMA TABLES' as section;
SELECT 
    table_name,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'storage'
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_name;