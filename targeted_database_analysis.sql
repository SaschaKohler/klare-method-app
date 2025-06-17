-- =====================================================
-- TARGETED DATABASE ANALYSIS - Find Migration History
-- =====================================================

-- ===========================================
-- 1. MIGRATION HISTORY FROM STORAGE
-- ===========================================
SELECT 'MIGRATION HISTORY' as section;

-- Try to get migration history from storage.migrations
SELECT 
    id,
    name,
    hash,
    executed_at
FROM storage.migrations
ORDER BY executed_at DESC;

-- ===========================================
-- 2. ALL SCHEMAS IN DATABASE
-- ===========================================
SELECT 'ALL SCHEMAS' as section;
SELECT schema_name
FROM information_schema.schemata 
WHERE schema_name NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schema_name;

-- ===========================================
-- 3. COMPLETE TABLE INVENTORY
-- ===========================================
SELECT 'COMPLETE TABLE INVENTORY' as section;
SELECT 
    t.table_schema,
    t.table_name,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows,
    pg_size_pretty(pg_total_relation_size('"'||t.table_schema||'"."'||t.table_name||'"')) as table_size,
    CASE 
        WHEN pt.rowsecurity THEN 'RLS ON'
        ELSE 'RLS OFF'
    END as rls_status
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
LEFT JOIN pg_tables pt ON pt.tablename = t.table_name AND pt.schemaname = t.table_schema
WHERE t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
  AND t.table_type = 'BASE TABLE'
ORDER BY t.table_schema, t.table_name;

-- ===========================================
-- 4. PUBLIC SCHEMA DETAILED STRUCTURE
-- ===========================================
SELECT 'PUBLIC SCHEMA STRUCTURE' as section;
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ===========================================
-- 5. ALL FOREIGN KEY RELATIONSHIPS
-- ===========================================
SELECT 'FOREIGN KEY RELATIONSHIPS' as section;
SELECT 
    tc.table_schema || '.' || tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_schema || '.' || ccu.table_name as to_table,
    ccu.column_name as to_column,
    rc.update_rule,
    rc.delete_rule
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
ORDER BY tc.table_schema, tc.table_name;

-- ===========================================
-- 6. RLS POLICIES OVERVIEW
-- ===========================================
SELECT 'RLS POLICIES' as section;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual as condition
FROM pg_policies
ORDER BY schemaname, tablename, policyname;