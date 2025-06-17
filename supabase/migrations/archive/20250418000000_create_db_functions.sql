-- supabase/migrations/20250418000001_create_db_functions.sql

-- Funktion zum Abrufen der Transformationspfade
CREATE OR REPLACE FUNCTION get_transformation_paths(step TEXT)
RETURNS SETOF klare_content.transformation_paths
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM klare_content.transformation_paths 
  WHERE step_id = step
  ORDER BY sort_order ASC;
$$;

-- Funktion zum Abrufen der praktischen Übungen
CREATE OR REPLACE FUNCTION get_practical_exercises(step TEXT)
RETURNS SETOF klare_content.practical_exercises
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM klare_content.practical_exercises 
  WHERE step_id = step
  ORDER BY sort_order ASC;
$$;

-- Funktion zum Abrufen der unterstützenden Fragen
CREATE OR REPLACE FUNCTION get_supporting_questions(step TEXT)
RETURNS SETOF klare_content.supporting_questions
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * 
  FROM klare_content.supporting_questions 
  WHERE step_id = step
  ORDER BY sort_order ASC;
$$;
