-- =================================================================
-- KLARE APP: Current AI-Ready Database State Analysis
-- =================================================================
-- Execute this in Supabase SQL Editor to analyze current state
-- Date: 2025-01-15

-- Schema Overview
SELECT 
    'SCHEMA OVERVIEW' as analysis_section,
    schemaname as name,
    COUNT(*)::text as details
FROM pg_tables 
WHERE schemaname IN ('public', 'auth', 'storage')
GROUP BY schemaname

UNION ALL

-- Table counts
SELECT 
    'TABLE DATA',
    t.tablename,
    COALESCE(
        (SELECT COUNT(*)::text 
         FROM information_schema.tables ist 
         WHERE ist.table_name = t.tablename 
           AND ist.table_schema = 'public'), 
        'N/A'
    ) || ' (exists: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = t.tablename AND table_schema = 'public'
    ) THEN 'YES' ELSE 'NO' END || ')'
FROM (
    VALUES 
        ('modules'),
        ('static_content'), 
        ('ai_prompt_templates'),
        ('generated_content'),
        ('user_profiles'),
        ('translations'),
        ('life_wheel_snapshots'),
        ('completed_modules'),
        ('user_answers'),
        ('personal_insights')
) t(tablename)

UNION ALL

-- AI Features Status
SELECT 
    'AI FEATURES',
    'ai_prompt_templates',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ai_prompt_templates' AND table_schema = 'public')
        THEN 'EXISTS ✓' ELSE 'MISSING ✗' END

UNION ALL

SELECT 
    'AI FEATURES',
    'generated_content', 
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'generated_content' AND table_schema = 'public')
        THEN 'EXISTS ✓' ELSE 'MISSING ✗' END

UNION ALL

SELECT 
    'AI FEATURES',
    'user_profiles',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles' AND table_schema = 'public')
        THEN 'EXISTS ✓' ELSE 'MISSING ✗' END

UNION ALL

-- Translation System
SELECT 
    'TRANSLATION',
    'translations_table',
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'translations' AND table_schema = 'public')
        THEN 'EXISTS ✓' ELSE 'MISSING ✗' END

ORDER BY analysis_section, name;