-- KLARE App COMPLETE Content Export Script
-- Exportiert ALLE Tabellen und Daten für Clean Slate Migration
-- Führe jede Query einzeln aus und download als CSV

-- ============================================================================
-- PUBLIC SCHEMA CONTENT TABLES
-- ============================================================================

-- 1. MODULE CONTENTS (Kerninhalt der App)
-- Download als: module_contents.csv
SELECT 
  id, module_id, content_type, title, description, 
  content, order_index, created_at, updated_at, translations
FROM module_contents 
ORDER BY module_id, order_index;

-- 2. CONTENT SECTIONS (Detailinhalte)
-- Download als: content_sections.csv
SELECT 
  id, module_content_id, title, content, media_url, 
  order_index, created_at, updated_at, translations
FROM content_sections 
ORDER BY module_content_id, order_index;

-- 3. EXERCISE STEPS (Übungsschritte)
-- Download als: exercise_steps.csv
SELECT 
  id, module_content_id, title, instructions, step_type, 
  options, order_index, created_at, updated_at, translations
FROM exercise_steps 
ORDER BY module_content_id, order_index;

-- 4. QUIZ QUESTIONS (Quiz-Daten)
-- Download als: quiz_questions.csv
SELECT 
  id, module_content_id, question, question_type, options, 
  correct_answer, explanation, order_index, created_at, updated_at, translations
FROM quiz_questions 
ORDER BY module_content_id, order_index;

-- 5. JOURNAL TEMPLATES (Journal-Vorlagen)
-- Download als: journal_templates.csv
SELECT 
  id, title, description, prompt_questions, category, 
  order_index, created_at, updated_at, translations
FROM journal_templates 
ORDER BY category, order_index;

-- 6. JOURNAL TEMPLATE CATEGORIES (Kategorien)
-- Download als: journal_categories.csv
SELECT 
  id, name, description, icon, order_index, 
  created_at, updated_at, translations
FROM journal_template_categories 
ORDER BY order_index;

-- ============================================================================
-- USER DATA TABLES (Optional - meist leer in Development)
-- ============================================================================

-- 7. USERS (User-Daten)
-- Download als: users.csv
SELECT 
  id, email, name, completed_modules, progress, streak,
  join_date, last_active, created_at
FROM users 
ORDER BY created_at;

-- 8. LIFE WHEEL AREAS (Life Wheel Daten)
-- Download als: life_wheel_areas.csv
SELECT 
  id, user_id, name, current_value, target_value,
  created_at, updated_at, translations
FROM life_wheel_areas 
ORDER BY user_id, name;

-- 9. COMPLETED MODULES (Abgeschlossene Module)
-- Download als: completed_modules.csv
SELECT 
  id, user_id, module_id, completed_at
FROM completed_modules 
ORDER BY user_id, completed_at;

-- 10. PERSONAL VALUES (Persönliche Werte)
-- Download als: personal_values.csv
SELECT 
  id, user_id, value_name, description, rank,
  created_at, updated_at
FROM personal_values 
ORDER BY user_id, rank;

-- 11. VISION BOARD ITEMS (Vision Board)
-- Download als: vision_board_items.csv
SELECT 
  id, user_id, vision_board_id, title, description, life_area,
  image_url, position_x, position_y, width, height, rotation, scale, color,
  created_at, updated_at
FROM vision_board_items 
ORDER BY user_id, life_area;

-- ============================================================================
-- KLARE_CONTENT SCHEMA TABLES
-- ============================================================================

-- 12. PRACTICAL EXERCISES (Praktische Übungen)
-- Download als: practical_exercises.csv
SELECT 
  id, step_id, title, description, duration_minutes, 
  sort_order, created_at, updated_at, translations
FROM klare_content.practical_exercises 
ORDER BY step_id, sort_order;

-- 13. SUPPORTING QUESTIONS (Unterstützende Fragen)
-- Download als: supporting_questions.csv
SELECT 
  id, step_id, question_text, sort_order, 
  created_at, updated_at, translations
FROM klare_content.supporting_questions 
ORDER BY step_id, sort_order;

-- 14. TRANSFORMATION PATHS (Transformationspfade)
-- Download als: transformation_paths.csv
SELECT 
  id, step_id, from_text, to_text, sort_order, 
  created_at, updated_at, translations
FROM klare_content.transformation_paths 
ORDER BY step_id, sort_order;

-- ============================================================================
-- SUMMARY & VERIFICATION QUERIES
-- ============================================================================

-- 15. EXPORT SUMMARY (Übersicht)
-- Zeigt Anzahl Records pro Tabelle
SELECT 'module_contents' as table_name, COUNT(*) as record_count FROM module_contents
UNION ALL
SELECT 'content_sections', COUNT(*) FROM content_sections
UNION ALL
SELECT 'exercise_steps', COUNT(*) FROM exercise_steps
UNION ALL
SELECT 'quiz_questions', COUNT(*) FROM quiz_questions
UNION ALL
SELECT 'journal_templates', COUNT(*) FROM journal_templates
UNION ALL
SELECT 'journal_template_categories', COUNT(*) FROM journal_template_categories
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'life_wheel_areas', COUNT(*) FROM life_wheel_areas
UNION ALL
SELECT 'completed_modules', COUNT(*) FROM completed_modules
UNION ALL
SELECT 'personal_values', COUNT(*) FROM personal_values
UNION ALL
SELECT 'vision_board_items', COUNT(*) FROM vision_board_items
UNION ALL
SELECT 'practical_exercises', COUNT(*) FROM klare_content.practical_exercises
UNION ALL
SELECT 'supporting_questions', COUNT(*) FROM klare_content.supporting_questions
UNION ALL
SELECT 'transformation_paths', COUNT(*) FROM klare_content.transformation_paths
ORDER BY record_count DESC;

-- 16. TRANSLATION COVERAGE (Übersetzungsabdeckung)
-- Zeigt welche Inhalte Übersetzungen haben
SELECT 
  'module_contents' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN translations IS NOT NULL THEN 1 END) as with_translations,
  COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END) as with_english,
  ROUND(COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1) as english_percentage
FROM module_contents
UNION ALL
SELECT 
  'journal_templates',
  COUNT(*),
  COUNT(CASE WHEN translations IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END),
  ROUND(COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1)
FROM journal_templates
UNION ALL
SELECT 
  'content_sections',
  COUNT(*),
  COUNT(CASE WHEN translations IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END),
  ROUND(COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1)
FROM content_sections
UNION ALL
SELECT 
  'exercise_steps',
  COUNT(*),
  COUNT(CASE WHEN translations IS NOT NULL THEN 1 END),
  COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END),
  ROUND(COUNT(CASE WHEN translations->>'en' IS NOT NULL THEN 1 END) * 100.0 / COUNT(*), 1)
FROM exercise_steps
ORDER BY english_percentage DESC;

-- ============================================================================
-- EXPORT CHECKLIST
-- ============================================================================
/*
Nach Export solltest du diese 14 CSV-Dateien haben:

✅ Content Tables (Core):
   □ module_contents.csv
   □ content_sections.csv  
   □ exercise_steps.csv
   □ quiz_questions.csv
   □ journal_templates.csv
   □ journal_categories.csv

✅ User Data Tables (meist leer in Development):
   □ users.csv
   □ life_wheel_areas.csv
   □ completed_modules.csv
   □ personal_values.csv
   □ vision_board_items.csv

✅ KLARE Content Schema:
   □ practical_exercises.csv
   □ supporting_questions.csv
   □ transformation_paths.csv

Alle Übersetzungen sind in den translations-Spalten enthalten!
*/

-- ============================================================================
-- STORAGE BUCKETS & FILES INFORMATION
-- ============================================================================

-- 17. STORAGE BUCKETS (Check what buckets exist)
-- Download als: storage_buckets.csv
SELECT 
  id, name, public, avif_autodetection, file_size_limit, allowed_mime_types,
  created_at, updated_at
FROM storage.buckets 
ORDER BY name;

-- 18. STORAGE OBJECTS (Vision Board Files)
-- Download als: storage_objects.csv
SELECT 
  id, name, bucket_id, owner, created_at, updated_at, last_accessed_at,
  metadata
FROM storage.objects 
WHERE bucket_id = 'vision-board-images'
ORDER BY created_at DESC;

-- 19. VISION BOARD ITEMS WITH STORAGE REFERENCES
-- Download als: vision_board_complete.csv
-- This combines database entries with their storage references
SELECT 
  vbi.id, vbi.user_id, vbi.title, vbi.description, vbi.life_area,
  vbi.image_url, vbi.position_x, vbi.position_y, vbi.width, vbi.height,
  vbi.rotation, vbi.scale, vbi.color, vbi.created_at, vbi.updated_at,
  so.name as storage_file_name,
  so.metadata as storage_metadata
FROM vision_board_items vbi
LEFT JOIN storage.objects so ON (
  so.bucket_id = 'vision-board-images' AND 
  vbi.image_url LIKE '%' || so.name || '%'
)
ORDER BY vbi.user_id, vbi.life_area;

-- 20. STORAGE USAGE SUMMARY
-- Shows storage usage per user and bucket
SELECT 
  bucket_id,
  (storage.foldername(name))[1] as user_id,
  COUNT(*) as file_count,
  SUM(COALESCE((metadata->>'size')::bigint, 0)) as total_size_bytes,
  MIN(created_at) as first_upload,
  MAX(created_at) as last_upload
FROM storage.objects
GROUP BY bucket_id, (storage.foldername(name))[1]
ORDER BY bucket_id, total_size_bytes DESC;
