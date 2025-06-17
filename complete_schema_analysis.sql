-- =====================================================
-- COMPLETE AI-READY DATABASE RECONSTRUCTION ANALYSIS
-- =====================================================
-- This will extract the complete current schema for reconstruction

-- ===========================================
-- 1. COMPLETE TABLE STRUCTURES WITH COLUMNS
-- ===========================================

-- Get all tables with complete column definitions
SELECT 
    'TABLE_DEFINITION' as analysis_type,
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ===========================================
-- 2. ALL PRIMARY KEYS
-- ===========================================

SELECT 
    'PRIMARY_KEYS' as analysis_type,
    tc.table_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as primary_key_columns,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- ===========================================
-- 3. ALL FOREIGN KEYS WITH ACTIONS
-- ===========================================

SELECT 
    'FOREIGN_KEYS' as analysis_type,
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name as to_table,
    ccu.column_name as to_column,
    rc.update_rule,
    rc.delete_rule,
    tc.constraint_name
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
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ===========================================
-- 4. ALL UNIQUE CONSTRAINTS
-- ===========================================

SELECT 
    'UNIQUE_CONSTRAINTS' as analysis_type,
    tc.table_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as unique_columns,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
    AND tc.table_schema = kcu.table_schema
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- ===========================================
-- 5. ALL CHECK CONSTRAINTS
-- ===========================================

SELECT 
    'CHECK_CONSTRAINTS' as analysis_type,
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name;

-- ===========================================
-- 6. ALL CUSTOM FUNCTIONS (for migration)
-- ===========================================

SELECT 
    'FUNCTIONS' as analysis_type,
    p.proname as function_name,
    pg_get_function_result(p.oid) as return_type,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND p.proname NOT LIKE 'pg_%'
ORDER BY p.proname;

-- ===========================================
-- 7. ALL TRIGGERS
-- ===========================================

SELECT 
    'TRIGGERS' as analysis_type,
    event_object_table as table_name,
    trigger_name,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- ===========================================
-- 8. ALL INDEXES (non-constraint)
-- ===========================================

SELECT 
    'INDEXES' as analysis_type,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname NOT LIKE '%_pkey'
  AND indexname NOT LIKE '%_key'
ORDER BY tablename, indexname;

-- ===========================================
-- 9. ALL RLS POLICIES
-- ===========================================

SELECT 
    'RLS_POLICIES' as analysis_type,
    tablename,
    policyname,
    permissive,
    array_to_string(roles, ', ') as roles,
    cmd,
    qual as condition,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ===========================================
-- 10. TABLE SIZES AND ROW COUNTS
-- ===========================================

SELECT 
    'TABLE_STATS' as analysis_type,
    table_name,
    pg_size_pretty(pg_total_relation_size('"public"."'||table_name||'"')) as table_size,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
ORDER BY pg_total_relation_size('"public"."'||table_name||'"') DESC;