-- =====================================================
-- FIND APP MIGRATIONS - Where are KLARE App migrations?
-- =====================================================

-- ===========================================
-- 1. SEARCH FOR ANY MIGRATION-RELATED TABLES
-- ===========================================
SELECT 'MIGRATION TABLE SEARCH' as section;
SELECT 
    table_schema,
    table_name,
    'Potential migration table' as type
FROM information_schema.tables
WHERE (
    table_name ILIKE '%migration%' 
    OR table_name ILIKE '%schema%' 
    OR table_name ILIKE '%version%'
    OR table_name ILIKE '%history%'
)
AND table_type = 'BASE TABLE'
ORDER BY table_schema, table_name;

-- ===========================================
-- 2. CHECK ALL SCHEMAS FOR ANY TABLES
-- ===========================================
SELECT 'ALL SCHEMAS WITH TABLES' as section;
SELECT 
    t.table_schema,
    COUNT(*) as table_count,
    string_agg(t.table_name, ', ' ORDER BY t.table_name) as table_names
FROM information_schema.tables t
WHERE t.table_type = 'BASE TABLE'
  AND t.table_schema NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
GROUP BY t.table_schema
ORDER BY t.table_schema;

-- ===========================================
-- 3. CHECK IF PUBLIC SCHEMA HAS ANY CONTENT
-- ===========================================
SELECT 'PUBLIC SCHEMA CONTENT' as section;

-- Tables in public
SELECT 'PUBLIC_TABLES' as type, table_name as name, table_type as details
FROM information_schema.tables
WHERE table_schema = 'public'
UNION ALL
-- Views in public
SELECT 'PUBLIC_VIEWS' as type, table_name as name, 'VIEW' as details
FROM information_schema.views
WHERE table_schema = 'public'
UNION ALL
-- Functions in public
SELECT 'PUBLIC_FUNCTIONS' as type, p.proname as name, 'FUNCTION' as details
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'
  AND p.proname NOT LIKE 'pg_%'
ORDER BY type, name;

-- ===========================================
-- 4. CHECK SUPABASE SPECIFIC SCHEMAS
-- ===========================================
SELECT 'SUPABASE SCHEMAS' as section;
SELECT 
    schema_name,
    'Supabase related schema' as note
FROM information_schema.schemata 
WHERE schema_name LIKE '%supabase%'
   OR schema_name LIKE '%postgrest%'
   OR schema_name LIKE '%realtime%'
   OR schema_name = 'graphql_public'
ORDER BY schema_name;

-- ===========================================
-- 5. LOOK FOR CUSTOM SCHEMAS
-- ===========================================
SELECT 'CUSTOM SCHEMAS CHECK' as section;
SELECT 
    schema_name,
    'Custom schema candidate' as note
FROM information_schema.schemata 
WHERE schema_name NOT IN (
    'information_schema', 'pg_catalog', 'pg_toast', 'pg_temp_1',
    'public', 'auth', 'storage', 'supabase_functions', 
    'extensions', 'graphql', 'graphql_public', 'realtime', 
    'supabase_migrations', 'vault'
)
ORDER BY schema_name;

-- ===========================================
-- 6. CHECK FOR ANY USERS OR APP-RELATED TABLES
-- ===========================================
SELECT 'APP TABLES SEARCH' as section;
SELECT 
    table_schema,
    table_name,
    COALESCE(c.reltuples::bigint, 0) as estimated_rows
FROM information_schema.tables t
LEFT JOIN pg_class c ON c.relname = t.table_name
WHERE t.table_type = 'BASE TABLE'
  AND (
    t.table_name ILIKE '%user%'
    OR t.table_name ILIKE '%klare%'
    OR t.table_name ILIKE '%module%'
    OR t.table_name ILIKE '%life%'
    OR t.table_name ILIKE '%wheel%'
    OR t.table_name ILIKE '%ai%'
    OR t.table_name ILIKE '%conversation%'
    OR t.table_name ILIKE '%profile%'
  )
ORDER BY t.table_schema, t.table_name;