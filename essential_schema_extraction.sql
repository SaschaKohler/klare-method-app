-- =====================================================
-- ESSENTIAL SCHEMA EXTRACTION - For Migration Reconstruction
-- =====================================================
-- Run this to get the core structure I need for clean migrations

-- ===========================================
-- 1. ALL TABLE STRUCTURES (Essential)
-- ===========================================
SELECT 
    table_name,
    column_name,
    data_type,
    CASE 
        WHEN character_maximum_length IS NOT NULL 
        THEN data_type || '(' || character_maximum_length || ')'
        WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL
        THEN data_type || '(' || numeric_precision || ',' || numeric_scale || ')'
        WHEN numeric_precision IS NOT NULL
        THEN data_type || '(' || numeric_precision || ')'
        ELSE data_type
    END as full_data_type,
    CASE WHEN is_nullable = 'NO' THEN 'NOT NULL' ELSE 'NULL' END as nullable,
    COALESCE(column_default, 'NO DEFAULT') as default_value,
    ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ===========================================
-- 2. PRIMARY KEYS
-- ===========================================
SELECT 
    'PK' as constraint_type,
    tc.table_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'PRIMARY KEY'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;

-- ===========================================
-- 3. FOREIGN KEYS
-- ===========================================
SELECT 
    'FK' as constraint_type,
    tc.table_name,
    kcu.column_name,
    ccu.table_name as references_table,
    ccu.column_name as references_column,
    rc.delete_rule,
    tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON tc.constraint_name = rc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- ===========================================
-- 4. UNIQUE CONSTRAINTS  
-- ===========================================
SELECT 
    'UNIQUE' as constraint_type,
    tc.table_name,
    string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) as columns,
    tc.constraint_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name 
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'UNIQUE'
GROUP BY tc.table_name, tc.constraint_name
ORDER BY tc.table_name;