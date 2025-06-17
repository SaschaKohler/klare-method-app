-- SQL Queries zur Analyse der aktuellen Übersetzungssituation
-- Diese Queries kannst du im Supabase SQL Editor ausführen

-- 1. ÜBERBLICK: Status aller Übersetzungs-Views
SELECT 
  'Content Sections' as table_name,
  COUNT(*) as total_count,
  COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END) as translated_count,
  ROUND((COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 1) as translation_percentage
FROM translated_content_sections
UNION ALL
SELECT 'Exercise Steps' as table_name, COUNT(*) as total_count,
  COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END) as translated_count,
  ROUND((COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 1) as translation_percentage
FROM translated_exercise_steps
UNION ALL
SELECT 'Quiz Questions' as table_name, COUNT(*) as total_count,
  COUNT(CASE WHEN question_en IS NOT NULL AND question_en != question THEN 1 END) as translated_count,
  ROUND((COUNT(CASE WHEN question_en IS NOT NULL AND question_en != question THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 1) as translation_percentage
FROM translated_quiz_questions
UNION ALL
SELECT 'Module Contents' as table_name, COUNT(*) as total_count,
  COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END) as translated_count,
  ROUND((COUNT(CASE WHEN title_en IS NOT NULL AND title_en != title THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100, 1) as translation_percentage
FROM translated_module_contents
ORDER BY translation_percentage DESC;



-- 2. UNÜBERSETZTE CONTENT SECTIONS: Welche Content Sections brauchen noch Übersetzungen?
SELECT 
  title as german_title,
  LEFT(content, 100) || '...' as content_preview,
  'NEEDS_TRANSLATION' as status
FROM translated_content_sections 
WHERE title_en IS NULL OR title_en = title
ORDER BY title
LIMIT 15;


-- 3. MODULE CONTENTS: Alle Module und ihre Übersetzungsstatus
SELECT 
  module_id,
  content_type,
  title as german_title,
  title_en as english_title,
  description as german_description,
  description_en as english_description,
  CASE 
    WHEN title_en IS NOT NULL AND title_en != title THEN 'TRANSLATED'
    ELSE 'NEEDS_TRANSLATION'
  END as translation_status
FROM translated_module_contents
ORDER BY translation_status, module_id;


-- 4. QUIZ QUESTIONS: Details aller Quiz-Fragen
SELECT 
  question as german_question,
  question_en as english_question,
  explanation as german_explanation,
  explanation_en as english_explanation,
  CASE 
    WHEN question_en IS NOT NULL AND question_en != question THEN 'TRANSLATED'
    ELSE 'NEEDS_TRANSLATION'
  END as translation_status
FROM translated_quiz_questions
ORDER BY translation_status;



-- 5. EXERCISE STEPS: Beispiele von unübersetzten Exercise Steps (erste 10)
SELECT 
  title as german_title,
  LEFT(instructions, 150) || '...' as instructions_preview,
  step_type,
  CASE 
    WHEN title_en IS NOT NULL AND title_en != title THEN 'TRANSLATED'
    ELSE 'NEEDS_TRANSLATION'
  END as translation_status
FROM translated_exercise_steps
WHERE title_en IS NULL OR title_en = title
ORDER BY title
LIMIT 10;


-- 6. KLARE -> CLEAR MAPPING: Überprüfung der korrekten Zuordnung
SELECT 
  'K->C (Clarity)' as mapping,
  COUNT(*) as count
FROM translated_content_sections 
WHERE title_en ILIKE '%clarity%'
UNION ALL
SELECT 
  'L->L (Liveliness)' as mapping,
  COUNT(*) as count
FROM translated_content_sections 
WHERE title_en ILIKE '%liveliness%'
UNION ALL
SELECT 
  'A->E (Evolvement)' as mapping,
  COUNT(*) as count
FROM translated_content_sections 
WHERE title_en ILIKE '%evolvement%'
ORDER BY count DESC;
