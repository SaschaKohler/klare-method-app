-- SQL-Skript zum Exportieren von übersetzungsrelevanten Daten
-- Dieses Skript kann in der Supabase SQL-Konsole ausgeführt werden

-- Erstellen einer temporären View für den Export
CREATE OR REPLACE TEMPORARY VIEW export_translations AS

-- practical_exercises
SELECT 
  'practical_exercises' AS table_name,
  'klare_content' AS schema_name,
  id,
  title AS original_title,
  description AS original_description,
  NULL AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  NULL AS original_content,
  NULL AS original_instructions,
  NULL AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  klare_content.practical_exercises

UNION ALL

-- supporting_questions
SELECT 
  'supporting_questions' AS table_name,
  'klare_content' AS schema_name,
  id,
  NULL AS original_title,
  NULL AS original_description,
  question_text AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  NULL AS original_content,
  NULL AS original_instructions,
  NULL AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  klare_content.supporting_questions

UNION ALL

-- transformation_paths
SELECT 
  'transformation_paths' AS table_name,
  'klare_content' AS schema_name,
  id,
  NULL AS original_title,
  NULL AS original_description,
  NULL AS original_question_text,
  from_text AS original_from_text,
  to_text AS original_to_text,
  NULL AS original_content,
  NULL AS original_instructions,
  NULL AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  klare_content.transformation_paths

UNION ALL

-- content_sections
SELECT 
  'content_sections' AS table_name,
  'public' AS schema_name,
  id,
  title AS original_title,
  NULL AS original_description,
  NULL AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  content AS original_content,
  NULL AS original_instructions,
  NULL AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  public.content_sections

UNION ALL

-- exercise_steps
SELECT 
  'exercise_steps' AS table_name,
  'public' AS schema_name,
  id,
  title AS original_title,
  NULL AS original_description,
  NULL AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  NULL AS original_content,
  instructions AS original_instructions,
  NULL AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  public.exercise_steps

UNION ALL

-- journal_template_categories
SELECT 
  'journal_template_categories' AS table_name,
  'public' AS schema_name,
  id,
  NULL AS original_title,
  description AS original_description,
  NULL AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  NULL AS original_content,
  NULL AS original_instructions,
  name AS original_name,
  NULL AS original_question,
  NULL AS original_explanation
FROM 
  public.journal_template_categories

UNION ALL

-- quiz_questions
SELECT 
  'quiz_questions' AS table_name,
  'public' AS schema_name,
  id,
  NULL AS original_title,
  NULL AS original_description,
  NULL AS original_question_text,
  NULL AS original_from_text,
  NULL AS original_to_text,
  NULL AS original_content,
  NULL AS original_instructions,
  NULL AS original_name,
  question AS original_question,
  explanation AS original_explanation
FROM 
  public.quiz_questions;

-- Export der Daten im CSV-Format (Beispiel):
-- SELECT * FROM export_translations ORDER BY table_name, id;

-- Alternativ: JSON-Ausgabe für einfacheren Import in Übersetzungstools
SELECT json_agg(row_to_json(export_translations))
FROM export_translations
ORDER BY table_name, id;
