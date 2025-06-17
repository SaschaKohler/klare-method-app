-- =====================================================
-- AI-Ready Database Comprehensive Analysis Script (FIXED)
-- =====================================================
-- Execute this in Supabase SQL Editor to get complete overview

-- ===========================================
-- 1. SCHEMAS OVERVIEW
-- ===========================================
SELECT 
    'SCHEMAS' as analysis_type,
    schema_name,
    NULL as table_name,
    NULL as column_info,
    NULL as additional_info
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- ===========================================
-- 2. TABLES OVERVIEW WITH ROW COUNTS
-- ===========================================
SELECT 
    'TABLES' as analysis_type,
    t.table_schema as schema_name,
    t.table_name,
    pg_size_pretty(pg_total_relation_size('"'||t.table_schema||'"."'||t.table_name||'"')) as table_size,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema IN ('public', 'auth', 'storage')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name;

-- ===========================================
-- 3. DETAILED TABLE STRUCTURES
-- ===========================================
SELECT 
    'TABLE_COLUMNS' as analysis_type,
    table_schema as schema_name,
    table_name,
    column_name || ' ' || 
    data_type || 
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN '(' || character_maximum_length || ')'
        ELSE ''
    END ||
    CASE 
        WHEN is_nullable = 'NO' THEN ' NOT NULL'
        ELSE ' NULL'
    END ||
    CASE 
        WHEN column_default IS NOT NULL 
        THEN ' DEFAULT ' || column_default
        ELSE ''
    END as column_info,
    ordinal_position::text as additional_info
FROM information_schema.columns
WHERE table_schema IN ('public', 'auth', 'storage')
ORDER BY table_schema, table_name, ordinal_position;

-- ===========================================
-- 4. PRIMARY KEYS AND UNIQUE CONSTRAINTS
-- ===========================================
SELECT 
    'CONSTRAINTS' as analysis_type,
    tc.table_schema as schema_name,
    tc.table_name,
    tc.constraint_name || ' (' || tc.constraint_type || ')' as column_info,
    string_agg(kcu.column_name, ', ') as additional_info
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema IN ('public', 'auth', 'storage')
  AND tc.constraint_type IN ('PRIMARY KEY', 'UNIQUE', 'FOREIGN KEY')
GROUP BY tc.table_schema, tc.table_name, tc.constraint_name, tc.constraint_type
ORDER BY tc.table_schema, tc.table_name, tc.constraint_type;

-- ===========================================
-- 5. FOREIGN KEY RELATIONSHIPS
-- ===========================================
SELECT 
    'FOREIGN_KEYS' as analysis_type,
    tc.table_schema as schema_name,
    tc.table_name,
    kcu.column_name || ' -> ' || ccu.table_name || '.' || ccu.column_name as column_info,
    rc.update_rule || '/' || rc.delete_rule as additional_info
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
    AND tc.table_schema = rc.constraint_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema IN ('public', 'auth', 'storage')
ORDER BY tc.table_schema, tc.table_name;

-- ===========================================
-- 6. VIEWS
-- ===========================================
SELECT 
    'VIEWS' as analysis_type,
    table_schema as schema_name,
    table_name,
    'VIEW' as column_info,
    NULL as additional_info
FROM information_schema.views
WHERE table_schema IN ('public', 'auth', 'storage')
ORDER BY table_schema, table_name;

-- ===========================================
-- 7. CUSTOM FUNCTIONS
-- ===========================================
SELECT 
    'FUNCTIONS' as analysis_type,
    n.nspname as schema_name,
    p.proname as table_name,
    pg_get_function_result(p.oid) as column_info,
    pg_get_function_arguments(p.oid) as additional_info
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'auth', 'storage')
  AND p.prokind = 'f'  -- functions only, not procedures
  AND p.proname NOT LIKE 'pg_%'
ORDER BY n.nspname, p.proname;

-- ===========================================
-- 8. RLS POLICIES
-- ===========================================
SELECT 
    'RLS_POLICIES' as analysis_type,
    schemaname as schema_name,
    tablename as table_name,
    policyname || ' (' || cmd || ')' as column_info,
    CASE 
        WHEN roles IS NOT NULL THEN 'ROLES: ' || array_to_string(roles, ', ')
        ELSE 'ALL ROLES'
    END as additional_info
FROM pg_policies
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename, policyname;

-- ===========================================
-- 9. INDEXES
-- ===========================================
SELECT 
    'INDEXES' as analysis_type,
    schemaname as schema_name,
    tablename as table_name,
    indexname as column_info,
    indexdef as additional_info
FROM pg_indexes
WHERE schemaname IN ('public', 'auth', 'storage')
  AND indexname NOT LIKE '%_pkey'  -- Skip primary key indexes
ORDER BY schemaname, tablename, indexname;

-- ===========================================
-- 10. EXTENSIONS
-- ===========================================
SELECT 
    'EXTENSIONS' as analysis_type,
    'system' as schema_name,
    extname as table_name,
    extversion as column_info,
    NULL as additional_info
FROM pg_extension
WHERE extname NOT IN ('plpgsql')  -- Skip default extension
ORDER BY extname;

-- ===========================================
-- 11. TRIGGERS
-- ===========================================
SELECT 
    'TRIGGERS' as analysis_type,
    trigger_schema as schema_name,
    event_object_table as table_name,
    trigger_name || ' (' || action_timing || ' ' || event_manipulation || ')' as column_info,
    action_statement as additional_info
FROM information_schema.triggers
WHERE trigger_schema IN ('public', 'auth', 'storage')
  AND trigger_name NOT LIKE 'tr_check_%'  -- Skip system triggers
ORDER BY trigger_schema, event_object_table, trigger_name;

-- ===========================================
-- 12. TABLE PERMISSIONS (RLS STATUS)
-- ===========================================
SELECT 
    'RLS_STATUS' as analysis_type,
    schemaname as schema_name,
    tablename as table_name,
    CASE 
        WHEN rowsecurity THEN 'RLS ENABLED'
        ELSE 'RLS DISABLED'
    END as column_info,
    NULL as additional_info
FROM pg_tables
WHERE schemaname IN ('public', 'auth', 'storage')
ORDER BY schemaname, tablename;

-- ===========================================
-- 13. FIND MIGRATION TABLES (STORAGE SCHEMA)
-- ===========================================
SELECT 
    'MIGRATION_SEARCH' as analysis_type,
    table_schema as schema_name,
    table_name,
    'Potential migration table' as column_info,
    COALESCE(c.reltuples::bigint, 0)::text as additional_info
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE (table_name LIKE '%migration%' OR table_name LIKE '%schema%')
  AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

-- ===========================================
-- 14. STORAGE SCHEMA DETAILED INFO
-- ===========================================
SELECT 
    'STORAGE_DETAILS' as analysis_type,
    'storage' as schema_name,
    table_name,
    'Storage table' as column_info,
    pg_size_pretty(pg_total_relation_size('"storage"."'||table_name||'"')) as additional_info
FROM information_schema.tables
WHERE table_schema = 'storage'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;