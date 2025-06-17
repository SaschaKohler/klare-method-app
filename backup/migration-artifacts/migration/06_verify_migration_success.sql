-- 06_verify_migration_success.sql
-- Comprehensive verification of AI-Ready Migration
-- Run this after 03_ai_ready_migration_NO_FK.sql to verify success

-- ============================================================================
-- TABLE EXISTENCE CHECK
-- ============================================================================

-- Check all expected tables exist
SELECT 
  'TABLE_EXISTENCE_CHECK' as check_type,
  table_name,
  table_schema,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    -- Existing tables that should still be there
    ('users'), ('life_wheel_areas'), ('completed_modules'), 
    ('module_contents'), ('content_sections'), ('exercise_steps'), ('quiz_questions'),
    ('journal_templates'), ('journal_template_categories'),
    ('personal_values'), ('vision_board_items'),
    
    -- New AI tables
    ('user_profiles'), ('life_wheel_snapshots'), ('ai_prompt_templates'), 
    ('generated_content'), ('user_answers'), ('personal_insights'),
    ('translations'), ('journal_entries'), ('user_events'), 
    ('user_patterns'), ('ai_conversations'), ('ai_service_logs')
) AS expected(table_name)
LEFT JOIN information_schema.tables t ON (
  t.table_name = expected.table_name 
  AND t.table_schema = 'public'
)
ORDER BY 
  CASE expected.table_name
    -- Existing tables first
    WHEN 'users' THEN 1
    WHEN 'life_wheel_areas' THEN 2
    WHEN 'completed_modules' THEN 3
    WHEN 'module_contents' THEN 4
    -- New AI tables
    WHEN 'user_profiles' THEN 10
    WHEN 'ai_prompt_templates' THEN 11
    ELSE 20
  END;

-- ============================================================================
-- COLUMN EXTENSIONS CHECK
-- ============================================================================

-- Check if existing tables got their new AI columns
SELECT 
  'COLUMN_EXTENSIONS_CHECK' as check_type,
  table_name,
  column_name,
  data_type,
  CASE 
    WHEN column_name IS NOT NULL THEN '✅ ADDED'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('users', 'preferred_language', 'text'),
    ('users', 'ai_mode_enabled', 'boolean'),
    ('users', 'personalization_level', 'text'),
    ('users', 'updated_at', 'timestamp without time zone'),
    ('life_wheel_areas', 'priority_level', 'integer'),
    ('life_wheel_areas', 'notes', 'text'),
    ('life_wheel_areas', 'improvement_actions', 'ARRAY'),
    ('completed_modules', 'responses', 'jsonb'),
    ('completed_modules', 'time_spent_seconds', 'integer'),
    ('completed_modules', 'satisfaction_rating', 'integer'),
    ('journal_template_categories', 'color_hex', 'text'),
    ('journal_templates', 'suitable_for_profiles', 'jsonb'),
    ('journal_templates', 'klare_steps', 'ARRAY'),
    ('journal_templates', 'difficulty_level', 'integer')
) AS expected(table_name, column_name, expected_type)
LEFT JOIN information_schema.columns c ON (
  c.table_name = expected.table_name 
  AND c.column_name = expected.column_name
  AND c.table_schema = 'public'
)
ORDER BY expected.table_name, expected.column_name;

-- ============================================================================
-- ROW LEVEL SECURITY CHECK
-- ============================================================================

-- Check RLS is enabled on all new tables
SELECT 
  'RLS_POLICIES_CHECK' as check_type,
  schemaname,
  tablename,
  rowsecurity as rls_enabled,
  CASE 
    WHEN rowsecurity THEN '✅ RLS ENABLED'
    ELSE '❌ RLS DISABLED'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'user_profiles', 'life_wheel_snapshots', 'generated_content',
    'user_answers', 'personal_insights', 'journal_entries',
    'user_events', 'user_patterns', 'ai_conversations',
    'ai_prompt_templates', 'translations'
  )
ORDER BY tablename;

-- Count policies per table
SELECT 
  'POLICY_COUNT' as check_type,
  schemaname,
  tablename,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ HAS POLICIES'
    ELSE '⚠️ NO POLICIES'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
  AND tablename IN (
    'user_profiles', 'life_wheel_snapshots', 'generated_content',
    'user_answers', 'personal_insights', 'journal_entries',
    'user_events', 'user_patterns', 'ai_conversations'
  )
GROUP BY schemaname, tablename
ORDER BY tablename;

-- ============================================================================
-- INDEXES CHECK
-- ============================================================================

-- Check if performance indexes were created
SELECT 
  'INDEXES_CHECK' as check_type,
  schemaname,
  tablename,
  indexname,
  indexdef,
  CASE 
    WHEN indexname IS NOT NULL THEN '✅ INDEX EXISTS'
    ELSE '❌ INDEX MISSING'
  END as status
FROM pg_indexes 
WHERE schemaname = 'public'
  AND (
    indexname LIKE 'idx_%_user_id' OR
    indexname LIKE 'idx_%_ai_%' OR
    indexname LIKE 'idx_translations_%' OR
    indexname LIKE 'idx_user_%'
  )
ORDER BY tablename, indexname;

-- ============================================================================
-- FUNCTIONS CHECK
-- ============================================================================

-- Check if helper functions exist
SELECT 
  'FUNCTIONS_CHECK' as check_type,
  routine_name,
  routine_type,
  CASE 
    WHEN routine_name IS NOT NULL THEN '✅ FUNCTION EXISTS'
    ELSE '❌ FUNCTION MISSING'
  END as status
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_translated_text',
    'update_updated_at_column'
  )
ORDER BY routine_name;

-- ============================================================================
-- TRIGGERS CHECK
-- ============================================================================

-- Check if update triggers exist
SELECT 
  'TRIGGERS_CHECK' as check_type,
  event_object_table as table_name,
  trigger_name,
  event_manipulation,
  CASE 
    WHEN trigger_name IS NOT NULL THEN '✅ TRIGGER EXISTS'
    ELSE '❌ TRIGGER MISSING'
  END as status
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table, trigger_name;

-- ============================================================================
-- KLARE_CONTENT SCHEMA CHECK
-- ============================================================================

-- Check klare_content schema tables still exist
SELECT 
  'KLARE_CONTENT_SCHEMA_CHECK' as check_type,
  table_name,
  table_schema,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM (
  VALUES 
    ('practical_exercises'), ('supporting_questions'), ('transformation_paths')
) AS expected(table_name)
LEFT JOIN information_schema.tables t ON (
  t.table_name = expected.table_name 
  AND t.table_schema = 'klare_content'
)
ORDER BY expected.table_name;

-- ============================================================================
-- STORAGE BUCKETS CHECK
-- ============================================================================

-- Check storage buckets exist (if storage setup was run)
SELECT 
  'STORAGE_BUCKETS_CHECK' as check_type,
  name as bucket_name,
  public,
  created_at,
  CASE 
    WHEN name IS NOT NULL THEN '✅ BUCKET EXISTS'
    ELSE '❌ BUCKET MISSING'
  END as status
FROM storage.buckets
WHERE name IN ('vision-board-images', 'ai-generated-content', 'profile-images')
ORDER BY name;

-- ============================================================================
-- DATA INTEGRITY BASIC CHECK
-- ============================================================================

-- Check if existing user data is still accessible
SELECT 
  'DATA_INTEGRITY_CHECK' as check_type,
  'users' as table_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DATA PRESERVED'
    ELSE '⚠️ NO DATA (OK for dev)'
  END as status
FROM users
UNION ALL
SELECT 
  'DATA_INTEGRITY_CHECK',
  'life_wheel_areas',
  COUNT(*),
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DATA PRESERVED'
    ELSE '⚠️ NO DATA (OK for dev)'
  END
FROM life_wheel_areas
UNION ALL
SELECT 
  'DATA_INTEGRITY_CHECK',
  'journal_templates',
  COUNT(*),
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DATA PRESERVED'
    ELSE '❌ DATA MISSING'
  END
FROM journal_templates
UNION ALL
SELECT 
  'DATA_INTEGRITY_CHECK',
  'module_contents',
  COUNT(*),
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ DATA PRESERVED'
    ELSE '❌ DATA MISSING'
  END
FROM module_contents;

-- ============================================================================
-- SUMMARY REPORT
-- ============================================================================

-- Count total tables in public schema
SELECT 
  'SUMMARY_REPORT' as check_type,
  'total_public_tables' as metric,
  COUNT(*) as value,
  'Total tables in public schema' as description
FROM information_schema.tables 
WHERE table_schema = 'public'
UNION ALL

-- Count AI-ready tables specifically
SELECT 
  'SUMMARY_REPORT',
  'ai_ready_tables',
  COUNT(*),
  'New AI-ready tables created'
FROM information_schema.tables 
WHERE table_schema = 'public'
  AND table_name IN (
    'user_profiles', 'life_wheel_snapshots', 'ai_prompt_templates',
    'generated_content', 'user_answers', 'personal_insights',
    'translations', 'journal_entries', 'user_events',
    'user_patterns', 'ai_conversations', 'ai_service_logs'
  )
UNION ALL

-- Count RLS enabled tables
SELECT 
  'SUMMARY_REPORT',
  'rls_enabled_tables',
  COUNT(*),
  'Tables with RLS enabled'
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true
UNION ALL

-- Count total policies
SELECT 
  'SUMMARY_REPORT',
  'total_policies',
  COUNT(*),
  'Total RLS policies'
FROM pg_policies 
WHERE schemaname = 'public'
UNION ALL

-- Count custom functions
SELECT 
  'SUMMARY_REPORT',
  'custom_functions',
  COUNT(*),
  'Custom helper functions'
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN ('get_translated_text', 'update_updated_at_column');

-- ============================================================================
-- FINAL STATUS
-- ============================================================================

SELECT 
  '🎉 MIGRATION VERIFICATION COMPLETE' as final_status,
  NOW() as verified_at,
  'Check results above for any ❌ MISSING items' as instructions;

-- Show next steps
SELECT 
  'NEXT_STEPS' as section,
  step_number,
  description,
  is_optional
FROM (
  VALUES 
    (1, 'Review verification results above', false),
    (2, 'Fix any ❌ MISSING items if found', false),
    (3, 'Run 05_fix_foreign_keys_corrected.sql for FK constraints', true),
    (4, 'Run 04_storage_setup.sql for vision board storage', true),
    (5, 'Test your app functionality', false),
    (6, 'Update src/types/supabase.ts with new types', false),
    (7, 'Begin Phase 1 of your Adaptive KLARE Strategy', false)
) AS steps(step_number, description, is_optional)
ORDER BY step_number;
