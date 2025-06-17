-- Verification script for security definer fix
-- Run this after applying the main migration to verify everything works

-- Test 1: Verify all views exist and are accessible
SELECT 
  'translated_content_sections' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_content_sections

UNION ALL

SELECT 
  'translated_exercise_steps' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_exercise_steps

UNION ALL

SELECT 
  'translated_journal_template_categories' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_journal_template_categories

UNION ALL

SELECT 
  'translated_journal_templates' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_journal_templates

UNION ALL

SELECT 
  'translated_module_contents' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_module_contents

UNION ALL

SELECT 
  'translated_quiz_questions' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_quiz_questions

UNION ALL

SELECT 
  'translated_life_wheel_areas' as view_name,
  COUNT(*) as row_count,
  CASE 
    WHEN COUNT(*) > 0 THEN 'PASS'
    ELSE 'FAIL'
  END as status
FROM public.translated_life_wheel_areas;
